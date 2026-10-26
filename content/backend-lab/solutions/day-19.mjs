export function solve(input,db){return db.prepare('SELECT id,title FROM tasks WHERE id=? ORDER BY id').all(input.id);}
