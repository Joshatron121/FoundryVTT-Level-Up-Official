extern crate glob;
extern crate leveldb;
extern crate serde;

// use serde::Deserialize;
use serde_json::Value;
use std::collections::HashSet;
use std::path::PathBuf;
use std::{ fs, path };

// const PACK_DEST: &str = "../public/packs/";
const PACK_SRC: &str = "../packs/";
// const ID_FILE_PATH: &str = "../packs/ids.json";

// fn clean_document(document: Value) {
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
    // let ids = get_existing_ids(&folder_paths);

    // Iterate through all the files, sanitize them, and write them to the db
    for folder in folder_paths {
      let file_names = glob::glob(&format!("{}/*.json", folder.display())).unwrap();

      for file_name in file_names {
        let json_data: Value = serde_json::from_str(
          fs::read_to_string(file_name.unwrap()).unwrap().as_str(),
        ).expect("JSON was not well-formatted");

        if json_data["_id"].is_null() {
          // TODO: Do advanced id stuff
        } else {
          // clean_document(&json_data);
        }

      }
    }
}
