export function solve(input){if(!input.authenticated)return 401;return input.userId===input.ownerId?200:404;}
