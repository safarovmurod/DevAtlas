import {exchange} from '../reference/http-lab.mjs';
const result=await exchange((req,res)=>{
 res.statusCode=404;res.setHeader('Content-Type','application/json');
 res.end(JSON.stringify({error:{code:404,message:'Not found',requestId:'r-demo'}}));
});
console.log(JSON.stringify(result.body));
