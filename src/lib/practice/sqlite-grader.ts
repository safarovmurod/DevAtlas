import type {Database,SqlJsStatic,SqlValue} from 'sql.js';
export const SQLITE_CHECK_IDS=['baseline','schema','changed-data','zero-price','missing-id','negative-price','null-name'] as const;
export interface SqliteCheck {id:typeof SQLITE_CHECK_IDS[number];passed:boolean;expected:string;actual:string}
export interface SqliteGrade {checks:SqliteCheck[];passed:boolean;error?:string;engineVersion:string}
const format=(rows:SqlValue[][])=>JSON.stringify(rows);
function rows(db:Database,query:string):SqlValue[][]{
 const stmt=db.prepare(query),output:SqlValue[][]=[];
 try{while(stmt.step()){if(output.length>=32)throw new Error('Result exceeds 32 rows');const row=stmt.get();if(row.some(value=>typeof value==='string'&&value.length>2000||value instanceof Uint8Array&&value.length>2000))throw new Error('Result value too large');output.push(row);}return output;}
 finally{stmt.free();}
}

/** SQLite only. Called in a disposable browser worker, never on the app server. */
export function gradeFirstSqlLesson(SQL:SqlJsStatic,code:string):SqliteGrade{
 const checks:SqliteCheck[]=[],db=new SQL.Database();
 let engineVersion='unknown';
 try{
  engineVersion=String(rows(db,'select sqlite_version()')[0][0]);
  db.run('PRAGMA hard_heap_limit=16777216; PRAGMA max_page_count=512; PRAGMA temp_store=MEMORY;');
  if(!code.trim()||new TextEncoder().encode(code).byteLength>32768)throw new Error('Use 1–32768 UTF-8 bytes of SQL');
  let query='',initial:SqlValue[][]=[];
  for(const stmt of db.iterateStatements(code)){
   const statementRows:SqlValue[][]=[];
   while(stmt.step()){
    if(statementRows.length>=32)throw new Error('Result exceeds 32 rows');
    const row=stmt.get();
    if(row.some(value=>typeof value==='string'&&value.length>2000||value instanceof Uint8Array&&value.length>2000))throw new Error('Result value too large');
    statementRows.push(row);
   }
   if(stmt.getColumnNames().length){query=stmt.getSQL();initial=statementRows;}
  }
  if(!query)throw new Error('Finish with a query returning name and total');
  const expectRows=(id:SqliteCheck['id'],actual:SqlValue[][],expected:SqlValue[][])=>checks.push({id,passed:format(actual)===format(expected),expected:format(expected),actual:format(actual)});
  expectRows('baseline',initial,[['Tea',36]]);
  const columns=rows(db,"PRAGMA table_info('products')");
  const schema=columns.some(c=>c[1]==='id'&&c[5]===1)&&columns.some(c=>c[1]==='name'&&c[3]===1)&&columns.some(c=>c[1]==='price'&&c[3]===1);
  checks.push({id:'schema',passed:schema,expected:'id PRIMARY KEY; name NOT NULL; price NOT NULL',actual:JSON.stringify(columns.map(c=>({name:c[1],notNull:c[3],primaryKey:c[5]})))});
  // Reuse the learner's actual final query against changed fixtures. Hard-coded
  // output, a missing WHERE and ignored data changes cannot pass these cases.
  db.run("DELETE FROM products; INSERT INTO products(id,name,price) VALUES(1,'Coffee',7),(2,'Other',5);");
  expectRows('changed-data',rows(db,query),[['Coffee',21]]);
  db.run("UPDATE products SET name='Free',price=0 WHERE id=1;");
  expectRows('zero-price',rows(db,query),[['Free',0]]);
  db.run('DELETE FROM products WHERE id=1;');
  expectRows('missing-id',rows(db,query),[]);
  const constraint=(id:SqliteCheck['id'],sql:string)=>{
   db.run('SAVEPOINT constraint_probe');let rejected=false;
   try{db.run(sql);}catch{rejected=true;}
   finally{db.run('ROLLBACK TO constraint_probe; RELEASE constraint_probe');}
   checks.push({id,passed:rejected,expected:'rejected',actual:rejected?'rejected':'accepted'});
  };
  constraint('negative-price',"INSERT INTO products(id,name,price) VALUES(101,'Invalid',-1)");
  constraint('null-name','INSERT INTO products(id,name,price) VALUES(102,NULL,1)');
  return {checks,passed:checks.length===SQLITE_CHECK_IDS.length&&checks.every(check=>check.passed),engineVersion};
 }catch(error){return {checks,passed:false,error:(error instanceof Error?error.message:'SQLite error').slice(0,1500),engineVersion};}
 finally{db.close();}
}
