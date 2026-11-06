import {pagination} from '../reference/validation.mjs';
const url=new URL('/tasks?limit=2&offset=0','http://localhost');
console.log(JSON.stringify(pagination(url.searchParams)));
