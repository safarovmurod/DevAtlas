export function solve(input,db){return Number(db.prepare('INSERT INTO tasks(title) VALUES(?)').run(input.title).lastInsertRowid);}
