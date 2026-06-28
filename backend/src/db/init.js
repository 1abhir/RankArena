const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || './data/rankarena.db';
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all().map((col) => col.name);
  if (!columns.includes(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

ensureColumn('users', 'headline', "TEXT DEFAULT ''");
ensureColumn('users', 'degree', "TEXT DEFAULT ''");
ensureColumn('users', 'institution', "TEXT DEFAULT ''");
ensureColumn('users', 'location', "TEXT DEFAULT ''");
ensureColumn('scores', 'daily_score', 'REAL DEFAULT 0');
ensureColumn('scores', 'social_score', 'REAL DEFAULT 0');

// Seed the default tracks if empty
const trackCount = db.prepare('SELECT COUNT(*) AS c FROM tracks').get().c;
if (trackCount === 0) {
  const insert = db.prepare('INSERT INTO tracks (slug, name, icon) VALUES (?, ?, ?)');
  const defaults = [
    ['web-dev', 'Web Development', 'globe'],
    ['ai-ml', 'AI / Machine Learning', 'brain'],
    ['dsa-cp', 'DSA & Competitive Programming', 'cpu'],
    ['open-source', 'Open Source', 'git-branch'],
    ['mobile', 'Mobile Development', 'smartphone'],
    ['design', 'Product Design / UI-UX', 'palette'],
    ['cloud-devops', 'Cloud & DevOps', 'server'],
  ];
  const tx = db.transaction((rows) => rows.forEach((r) => insert.run(...r)));
  tx(defaults);
}

module.exports = db;
