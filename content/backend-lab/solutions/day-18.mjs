import {DatabaseSync} from 'node:sqlite';
export function solve(input){const db=new DatabaseSync(input.filename);try{db.exec('CREATE TABLE tasks(title TEXT NOT NULL)');db.prepare('INSERT INTO tasks(title) VALUES(?)').run(input.title);}finally{db.close();}return 'saved';}
