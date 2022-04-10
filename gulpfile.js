const gulp = require('gulp');
const fs = require('fs');
const mergeStream = require('merge-stream');
const through2 = require('through2');
const path = require('path');

const PACK_DEST = './public/packs';
const PACK_SRC = './packs';
const ids = [];

function randomID(length = 16) {
  const rnd = () => Math.random().toString(36).substring(2);
  let id = '';
  while (id.length < length) { id += rnd(); }
  return id.substring(0, length);
}

function compilePacks() {
  const folders = fs.readdirSync(PACK_SRC, { withFileTypes: true })
    .filter((f) => f.isDirectory());

  const packs = folders.map((folder) => {
    const filePath = path.join(PACK_DEST, `${folder.name}.db`);
    fs.rmSync(filePath, { force: true });

    const db = fs.createWriteStream(filePath, { flags: 'a', mode: 0o664 });
    const data = [];

    return gulp.src(path.join(PACK_SRC, folder.name, '/**/*.json'))
      .pipe(through2.obj((file, enc, callback) => {
        try {
          const json = JSON.parse(file.contents.toString());

          // Generate id
          let id = randomID();
          while (ids.includes(id)) id = randomID();
          ids.push(id);
          // eslint-disable-next-line no-underscore-dangle
          json._id = id;

          data.push(json);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn(`${file.relative} failed to parse.`);
        }
        callback(null, file);
      }, (callback) => {
        // eslint-disable-next-line no-underscore-dangle
        data.sort((lhs, rhs) => (lhs._id > rhs._id ? -1 : 1));
        data.forEach((entry) => {
          db.write(`${JSON.stringify(entry)}\n`);
        });
        callback();
      }));
  });

  return mergeStream.call(null, packs);
}

exports.default = gulp.series(compilePacks);
exports.buildCompendia = gulp.series(compilePacks);