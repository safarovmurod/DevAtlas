import {exchange} from '../reference/http-lab.mjs';
const result=await exchange((req,res)=>{
  res.statusCode=201;
  res.setHeader('Location','/tasks/1');
  res.setHeader('Content-Type','application/json');
  res.end(JSON.stringify({id:1,title:'Read'}));
});
console.log(JSON.stringify({status:result.status,location:result.headers.location,body:result.body}));
