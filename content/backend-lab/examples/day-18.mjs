import {DatabaseSync} from 'node:sqlite';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const folder=await mkdtemp(join(tmpdir(),'Backend ')),filename=join(folder,'data.sqlite');
try{let db=new DatabaseSync(filename);db.exec("CREATE TABLE tasks(title TEXT);INSERT INTO tasks VALUES('Read')");db.close();
 db=new DatabaseSync(filename);try{console.log(JSON.stringify(db.prepare('SELECT title FROM tasks').all()));}finally{db.close();}
}finally{await rm(folder,{recursive:true,force:true});}
