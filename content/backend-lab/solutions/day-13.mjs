export function solve({method,path}) {if(path!=='/tasks')return 'not-found';if(method==='GET')return 'list';if(method==='POST')return 'create';return 'method-not-allowed';}
