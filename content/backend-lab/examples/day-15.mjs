import {taskInput} from '../reference/validation.mjs';
const outputs=[taskInput({title:'  Read  '})];
try{taskInput({title:'Read',owner_id:2});}catch(error){outputs.push({status:error.status});}
console.log(JSON.stringify(outputs));
