export function solve(found) { return found?{status:200,body:{status:'ok'}}:{status:404,body:{error:'Not found'}}; }
