import {sessions} from '../reference/auth.mjs';
import {exchange} from '../reference/http-lab.mjs';
const auth=sessions(),token=auth.create(1);
const result=await exchange((req,res)=>{res.setHeader('Set-Cookie',`sid=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=1800`);res.end('ok');});
const cookie=result.headers['set-cookie'];
console.log(JSON.stringify({httpOnly:cookie.includes('HttpOnly'),sameSite:cookie.includes('SameSite=Strict'),secure:cookie.includes('; Secure')}));
