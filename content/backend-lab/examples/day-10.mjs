import {exchange} from '../reference/http-lab.mjs';
const result = await exchange((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify({method: request.method, path: url.pathname}));
}, {method:'POST', path:'/notes?draft=1'});
console.log(JSON.stringify(result.body));
