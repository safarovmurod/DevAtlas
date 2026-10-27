import {hashPassword} from '../reference/auth.mjs';
const password='local-example-password',user={id:1,name:'Amina',passwordHash:await hashPassword(password)};
const profile={id:user.id,name:user.name};
console.log(JSON.stringify({plainStored:user.passwordHash===password,profile}));
