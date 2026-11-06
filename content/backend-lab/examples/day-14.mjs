import {exchange} from '../reference/http-lab.mjs';
const result=await exchange(async(req,res)=>{
 res.setHeader('Content-Type','application/json');let size=0;const chunks=[];
 for await(const chunk of req){size+=chunk.length;if(size>4096){res.statusCode=413;res.end('{"error":"size"}');return;}chunks.push(chunk);}
 try{res.end(JSON.stringify({received:JSON.parse(Buffer.concat(chunks).toString('utf8'))}));}
 catch{res.statusCode=400;res.end('{"error":"json"}');}
},{method:'POST',headers:{'Content-Type':'application/json'},body:'{"title":"Read"}'});
console.log(JSON.stringify(result.body));
