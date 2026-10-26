export function solve(input,db){db.exec('CREATE TABLE tasks(id INTEGER PRIMARY KEY,title TEXT NOT NULL)');return 'created';}
