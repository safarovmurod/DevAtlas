export function solve(input,db,{auth,advance}) {
 const token=auth.create(7),before=auth.read(token);
 advance(input.advance);
 if(input.logout)auth.delete(token);
 return {before,after:auth.read(token)??null};
}
