import {DatabaseSync} from 'node:sqlite';
const db=new DatabaseSync(':memory:');
db.exec("CREATE TABLE tasks(id INTEGER PRIMARY KEY,title TEXT);INSERT INTO tasks VALUES(1,'Read'),(2,'Write')");
console.log(JSON.stringify(db.prepare('SELECT id,title FROM tasks WHERE id=?').get(2)));
db.close();
