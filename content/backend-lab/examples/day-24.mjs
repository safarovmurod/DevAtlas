import {sessions} from '../reference/auth.mjs';
const auth=sessions(),token=auth.create(7);
console.log(JSON.stringify({valid:auth.read(token)===7,invented:auth.read('invented')===undefined}));
