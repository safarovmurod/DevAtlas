export function solve(c){return Object.entries({create:201,anonymous:401,foreign:404,invalid:422}).filter(([k,v])=>c[k]!==v).map(([k])=>k);}
