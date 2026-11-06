export function solve({token,secure}){return `sid=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=1800${secure?'; Secure':''}`;}
