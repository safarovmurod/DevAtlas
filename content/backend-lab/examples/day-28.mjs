import {sessions} from '../reference/auth.mjs';
let time=0;const auth=sessions({now:()=>time,ttl:10});const token=auth.create(7),before=auth.read(token);
time=10;const expired=auth.read(token)??null;const second=auth.create(8);auth.delete(second);
console.log(JSON.stringify({before,expired,revoked:auth.read(second)??null}));
