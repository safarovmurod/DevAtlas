// @vitest-environment node
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {requestTutorCompletion,selectTutorProvider,TutorProviderError} from '@/lib/tutor/provider';
const fetchMock=vi.fn();
beforeEach(()=>{fetchMock.mockReset();vi.stubGlobal('fetch',fetchMock);});
afterEach(()=>vi.unstubAllGlobals());
describe('Gemini adapter',()=>{
 it('selects Gemini with a secret server key',()=>{
  expect(selectTutorProvider({GEMINI_API_KEY:'test-secret',AI_PROVIDER_KEY:'legacy'})).toMatchObject({kind:'gemini',model:'gemini-2.5-flash'});
  expect(selectTutorProvider({AI_TUTOR_PROVIDER:'gemini',AI_PROVIDER_KEY:'legacy'})).toBeNull();
  expect(selectTutorProvider({AI_TUTOR_PROVIDER:'anymodel',AI_PROVIDER_KEY:'legacy'})?.kind).toBe('anymodel');
 });
 it('calls Google API without disclosing credentials to client',async()=>{
  fetchMock.mockResolvedValue(Response.json({candidates:[{content:{parts:[{text:'React state.'}]}}],usageMetadata:{totalTokenCount:23}}));
  const result=await requestTutorCompletion(selectTutorProvider({GEMINI_API_KEY:'test-secret'})!,[
   {role:'system',content:'DevAtlas tutor'}, {role:'user',content:'Explain React state'},
  ],256);
  expect(result).toEqual({reply:'React state.',totalTokens:23});
  const [url,init]=fetchMock.mock.calls[0];
  expect(url).toContain('/models/gemini-2.5-flash:generateContent');
  expect(init.headers['x-goog-api-key']).toBe('test-secret');
  expect(init.headers.Authorization).toBeUndefined();
  expect(JSON.parse(init.body).systemInstruction.parts[0].text).toContain('DevAtlas');
 });
 it('sanitizes errors',async()=>{
  fetchMock.mockResolvedValue(new Response('secret-provider-details',{status:429}));
  await expect(requestTutorCompletion(selectTutorProvider({GEMINI_API_KEY:'test-secret'})!,[],256)).rejects.toBeInstanceOf(TutorProviderError);
 });
});
