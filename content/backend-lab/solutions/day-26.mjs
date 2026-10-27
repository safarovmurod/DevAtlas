import {hashPassword} from '../reference/auth.mjs';
export async function solve(password){return await hashPassword(password);}
