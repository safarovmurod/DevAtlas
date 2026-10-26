import {DatabaseSync} from 'node:sqlite';
const db=new DatabaseSync(':memory:');db.exec("CREATE TABLE tasks(title TEXT NOT NULL CHECK(length(title)>0));INSERT INTO tasks VALUES('Keep')");
db.exec('BEGIN IMMEDIATE');try{const insert=db.prepare('INSERT INTO tasks VALUES(?)');insert.run('New');insert.run('');db.exec('COMMIT');}catch{db.exec('ROLLBACK');}
console.log(JSON.stringify(db.prepare('SELECT title FROM tasks ORDER BY rowid').all()));db.close();
