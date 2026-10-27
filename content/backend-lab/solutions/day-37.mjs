export function solve(x){return x.status===200&&x.version===x.expectedVersion&&x.rollbackReady===true?'promote':'hold';}
