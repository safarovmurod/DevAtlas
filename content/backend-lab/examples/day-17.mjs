import {DatabaseSync} from 'node:sqlite';
const db=new DatabaseSync(':memory:');
db.exec("CREATE TABLE tasks(id INTEGER PRIMARY KEY,title TEXT NOT NULL); INSERT INTO tasks VALUES(1,'Read')");
console.log(JSON.stringify(db.prepare('SELECT id,title FROM tasks ORDER BY id').all()));
db.close();
