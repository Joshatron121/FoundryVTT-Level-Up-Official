extern crate glob;
extern crate rusty_leveldb;
extern crate serde;

use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};
use rusty_leveldb::{Options, WriteBatch, DB};
// use serde::Deserialize;
use serde_json::{json, Map, Value};
use std::collections::HashSet;
use std::path::PathBuf;
use std::{fs, path};

const PACK_DEST: &str = "../public/packs/";
const PACK_SRC: &str = "../packs/";
// const ID_FILE_PATH: &str = "../packs/ids.json";

struct CleanOptions {
    clear_source_id: bool,
}

fn random_id() -> String {
    let rand_string: String = thread_rng()
        .sample_iter(&Alphanumeric)
        .take(16)
        .map(char::from)
        .collect();

    rand_string
}

fn generate_id(ids: &mut HashSet<String>) -> String {
    let mut new_id = random_id();
    while ids.contains(&new_id) {
        new_id = random_id();
    }

    ids.insert(new_id.clone());
    new_id
}

fn clean_document(document: &mut Map<String, Value>, options: CleanOptions) {
    if !document.contains_key("flags") {
        document.insert("flags".to_string(), json!({}));
    }

    // Clean up flags
    let flags: &mut Map<String, Value> =
        document.get_mut("flags").unwrap().as_object_mut().unwrap();
    flags.remove("exportSource");
    flags.remove("importSource");
    if options.clear_source_id {
        flags
            .get_mut("core")
            .unwrap()
            .as_object_mut()
            .unwrap()
            .remove("sourceId");
    }

    let remove_keys: Vec<_> = flags
        .iter()
        .filter(|(key, _)| !["core", "a5e"].contains(&key.as_str()))
        .map(|(key, _)| key.to_string())
        .collect();

    remove_keys.iter().for_each(|key| {
        flags.remove(key);
    });

    // Clean up permissions & stats
    document.remove("ownership");
    document.remove("_stats");

    // Recurse through effects and items
    if document.contains_key("effects") {
        let effects = document.get_mut("effects").unwrap().as_array_mut().unwrap();
        for effect in effects {
            clean_document(
                effect.as_object_mut().unwrap(),
                CleanOptions {
                    clear_source_id: false,
                },
            );
        }
    }

    if document.contains_key("items") {
        let items = document.get_mut("items").unwrap().as_array_mut().unwrap();
        for item in items {
            clean_document(
                item.as_object_mut().unwrap(),
                CleanOptions {
                    clear_source_id: false,
                },
            );
        }
    }
}

fn get_existing_ids(folders: &Vec<path::PathBuf>) -> HashSet<String> {
    println!("[INFO] - Extracting existing ids...");

    let mut ids: HashSet<String> = HashSet::new();
    for folder in folders {
        // Get all files in folder
        let files: Vec<_> = fs::read_dir(folder)
            .unwrap()
            .map(|entry| entry.unwrap().path())
            .collect();

        for file in files {
            let file = fs::read_to_string(file).unwrap();
            let data: Value = serde_json::from_str(&file).expect("JSON was not well-formatted");

            let id = data["_id"].as_str().unwrap();
            ids.insert(id.to_string());
        }
    }

    println!("[INFO] - Finished Extracting existing ids.");
    ids
}

fn main() {
    // Get folders
    let folder_paths: Vec<PathBuf> = fs::read_dir(PACK_SRC)
        .unwrap()
        .map(|entry| entry.unwrap().path())
        .filter(|entry| entry.is_dir())
        .collect();

    // Get existing ids
    let mut ids = get_existing_ids(&folder_paths);

    // Iterate through all the files, sanitize them, and write them to the db
    for folder in folder_paths {
        let file_names = glob::glob(&format!("{}/*.json", folder.display())).unwrap();

        let mut documents: Vec<Map<String, Value>> = Vec::new();

        for file_name in file_names {
            let mut json_data: Map<String, Value> =
                serde_json::from_str(fs::read_to_string(file_name.unwrap()).unwrap().as_str())
                    .expect("JSON was not well-formatted");

            if json_data["_id"].is_null() {
                json_data["_id"] = match json_data["flags"]["core"]["sourceId"].as_str() {
                    Some(id) => match id.rsplit_once(".") {
                        Some((_, id)) => Value::String(id.to_string()),
                        None => Value::String(generate_id(&mut ids)),
                    },
                    None => Value::String(generate_id(&mut ids)),
                };
            } else {
                clean_document(
                    &mut json_data,
                    CleanOptions {
                        clear_source_id: false,
                    },
                );
            }
            documents.push(json_data);
        }

        let db_name = folder.file_name().unwrap().to_str().unwrap();
        write_to_db(documents, db_name);
    }
}

// Move to different file
fn write_to_db(documents: Vec<Map<String, Value>>, db_name: &str) {
    let path = [PACK_DEST, db_name].iter().collect::<PathBuf>();

    let mut options = Options::default();
    options.create_if_missing = true;
    let mut database = match DB::open(&path, options) {
        Ok(db) => db,
        // TODO: Change to error
        Err(e) => panic!("Failed to open database: {:?}", e),
    };

    let mut batch = WriteBatch::new();

    for mut document in documents {
        let mut collection_type = "items";
        if ["character", "npc"].contains(&document["type"].as_str().unwrap()) {
            collection_type = "actors";

            // Map items to item_ids and add items as separate documents
            // let mut item_ids: Vec<String> = Vec::new();

            // let items = document.get("items").unwrap().as_array().unwrap();

            // for item in items {
            //     let item_id = item["_id"].as_str().unwrap();
            //     item_ids.push(item_id.to_string());

            //     let key = format!(
            //         "!actors.items!{}.{}",
            //         document["_id"].clone().as_str().unwrap(),
            //         item_id
            //     );

            //     batch.put(
            //         &key.as_bytes(),
            //         serde_json::to_string(&item).unwrap().as_bytes(),
            //     );
            // }

            // document.insert("items".to_string(), json!(item_ids));
            add_sublevel_to_db(&mut document, "actors", "items")
        }

        // Map effects to effect_ids and add effects as separate documents
        // FIXME: Effects need to be done for both actors and items so key needs to change. It also needs to be done for nested items on actors
        if document.contains_key("effects") {
            let mut effect_ids: Vec<String> = Vec::new();

            let effects = document.get("effects").unwrap().as_array().unwrap();
            for effect in effects {
                let effect_id = effect["_id"].as_str().unwrap();
                effect_ids.push(effect_id.to_string());

                let key = format!(
                    "!actors.effects!{}.{}",
                    document["_id"].clone().as_str().unwrap(),
                    effect_id
                );

                batch.put(
                    &key.as_bytes(),
                    serde_json::to_string(&effect).unwrap().as_bytes(),
                );
            }

            document.insert("effects".to_string(), json!(effect_ids));
        }

        // Key is in the form collectionName!id
        let key = format!(
            "!{}!{}",
            collection_type,
            &document["_id"].as_str().unwrap()
        );

        batch.put(
            &key.as_bytes(),
            serde_json::to_string(&document).unwrap().as_bytes(),
        );
    }

    match database.write(batch, true) {
        Ok(_) => println!("[INFO] - Successfully wrote to database."),
        Err(e) => panic!("Failed to write to database: {:?}", e),
    }
}

fn add_sublevel_to_db(
    document: &mut Map<String, Value>,
    document_name: &str,
    collection_type: &str,
) {
    let mut batch = WriteBatch::new();

    // Map items to item_ids and add items as separate documents
    let mut item_ids: Vec<String> = Vec::new();

    let items = document.get(collection_type).unwrap().as_array().unwrap();

    for item in items {
        let item_id = item["_id"].as_str().unwrap();
        item_ids.push(item_id.to_string());

        let key = format!(
            "!{}.{}!{}.{}",
            document_name,
            collection_type,
            document["_id"].clone().as_str().unwrap(),
            item_id
        );

        batch.put(
            &key.as_bytes(),
            serde_json::to_string(&item).unwrap().as_bytes(),
        );
    }

    document.insert("items".to_string(), json!(item_ids));

    add_sublevel_to_db(document, document_name, "effects");
}
