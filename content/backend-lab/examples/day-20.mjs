import {DatabaseSync} from 'node:sqlite';
const db=new DatabaseSync(':memory:');
db.exec('CREATE TABLE tasks(id INTEGER PRIMARY KEY,title TEXT NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 120))');
const result=db.prepare('INSERT INTO tasks(title) VALUES(?)').run('Read');
console.log(JSON.stringify({id:Number(result.lastInsertRowid),rows:db.prepare('SELECT title FROM tasks').all()}));
db.close();
