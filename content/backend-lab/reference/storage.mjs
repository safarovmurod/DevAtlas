import {DatabaseSync} from 'node:sqlite';
export function openStore(filename = ':memory:') {
  const db = new DatabaseSync(filename);
  db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=3000;');
  // One versioned migration: rerunning is safe. A failed migration rolls back.
  db.exec('BEGIN IMMEDIATE');
  try {
    const version = Number(db.prepare('PRAGMA user_version').get().user_version);
    if (version > 1) throw new Error('Database is newer than this application');
    if (version === 0) {
      db.exec(`CREATE TABLE users(id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, password TEXT NOT NULL);
        CREATE TABLE tasks(id INTEGER PRIMARY KEY, owner_id INTEGER NOT NULL REFERENCES users(id),
          title TEXT NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 120));
        CREATE INDEX tasks_owner_id ON tasks(owner_id,id);
        PRAGMA user_version=1;`);
    }
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); db.close(); throw error; }
  return {
    db,
    addUser: (name, password) => db.prepare('INSERT INTO users(name,password) VALUES(?,?)').run(name,password).lastInsertRowid,
    user: name => db.prepare('SELECT id,name,password FROM users WHERE name=?').get(name),
    create(owner, title) {
      const id = db.prepare('INSERT INTO tasks(owner_id,title) VALUES(?,?)').run(owner,title).lastInsertRowid;
      return {id: Number(id),title};
    },
    list: (owner, limit, offset) => db.prepare('SELECT id,title FROM tasks WHERE owner_id=? ORDER BY id LIMIT ? OFFSET ?').all(owner,limit,offset),
    get: (owner, id) => db.prepare('SELECT id,title FROM tasks WHERE owner_id=? AND id=?').get(owner,id),
    rename: (owner, id, title) => db.prepare('UPDATE tasks SET title=? WHERE owner_id=? AND id=?').run(title,owner,id).changes === 1,
    remove: (owner, id) => db.prepare('DELETE FROM tasks WHERE owner_id=? AND id=?').run(owner,id).changes === 1,
    close: () => db.close(),
  };
}
