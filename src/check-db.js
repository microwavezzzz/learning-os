const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "../data/learning_os.db");
const db = new Database(dbPath);

const subjects = db.prepare(`SELECT id, title FROM subjects`).all();
console.log("Subjects in DB:", subjects);

const topics = db.prepare(`SELECT id, title FROM topics`).all();
console.log("Topics in DB:", topics);

const materials = db.prepare(`SELECT id, name FROM material_files`).all();
console.log("Materials in DB:", materials);
