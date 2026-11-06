export function solve(input) { return {method:input.method,path:new URL(input.url,'http://localhost').pathname}; }
