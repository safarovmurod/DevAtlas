import { expect, test } from '@playwright/test';

test('public and learning routes render without server errors',async({request})=>{
  for(const path of ['/','/login','/home','/courses','/courses/html/home','/courses/html/plan','/practice','/settings','/plans','/community','/privacy','/terms']) {
    const response=await request.get(path);
    expect(response.status(),path).toBe(200);
    const html=await response.text();
    expect(html,path).not.toContain('Internal Server Error');
    if(path==='/')expect(html).toContain('От нового интереса');
  }
});

test('the public page renders all six interface locales on the server',async({request})=>{
  for(const [country,lead] of [['RU','От нового интереса'],['UA','Від нового інтересу'],['US','Turn your curiosity'],['TJ','Аз шавқи нав'],['JP','新しい興味を'],['KR','새로운 관심을']] as const) {
    const response=await request.get('/',{headers:{'x-vercel-ip-country':country}});
    expect(response.status(),country).toBe(200);
    expect(await response.text(),country).toContain(lead);
  }
});
