import {DatabaseSync} from 'node:sqlite';
const db=new DatabaseSync(':memory:');
db.exec("CREATE TABLE tasks(id INTEGER PRIMARY KEY,owner_id INTEGER,title TEXT);INSERT INTO tasks VALUES(1,1,'Read'),(2,2,'Write')");
const result=db.prepare('UPDATE tasks SET title=? WHERE id=? AND owner_id=?').run('Stolen',1,2);
console.log(JSON.stringify({changes:result.changes,title:db.prepare('SELECT title FROM tasks WHERE id=1').get().title}));
db.close();
