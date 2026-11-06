import {hashPassword,verifyPassword} from '../reference/auth.mjs';
const password='local-example-password',a=await hashPassword(password),b=await hashPassword(password);
console.log(JSON.stringify({different:a!==b,correct:await verifyPassword(password,a),wrong:await verifyPassword('wrong',a)}));
