import {expect,it,vi} from 'vitest';
import {AuthApiError,AuthRetryableFetchError,type Session,type SupabaseClient} from '@supabase/supabase-js';
import {currentSessionInfo,describeDevice,verifySavedSession} from '@/lib/account/session';

const saved={access_token:'old-access',refresh_token:'saved-refresh',user:{id:'account-a'}} as Session;
function client(getUser:ReturnType<typeof vi.fn>,refreshSession=vi.fn()) {
  return {auth:{getUser,refreshSession}} as unknown as SupabaseClient;
}
it.each([new AuthApiError('Expired access',401,undefined),new AuthApiError('Bad JWT',403,'bad_jwt')])('refreshes rejected access without another interactive login (%s)',async error=>{
  const getUser=vi.fn().mockResolvedValueOnce({data:{user:null},error}).mockResolvedValueOnce({data:{user:{id:'account-a'}},error:null});
  const refreshSession=vi.fn().mockResolvedValue({data:{session:{...saved,access_token:'new-access'}},error:null});
  expect((await verifySavedSession(client(getUser,refreshSession),saved)).access_token).toBe('new-access');
  expect(refreshSession).toHaveBeenCalledTimes(1);expect(getUser.mock.calls.map(call=>call[0])).toEqual(['old-access','new-access']);
});
it('preserves a temporary network failure without rotating the saved refresh token',async()=>{
  const error=new AuthRetryableFetchError('Offline',503),getUser=vi.fn().mockResolvedValue({data:{user:null},error}),refreshSession=vi.fn();
  await expect(verifySavedSession(client(getUser,refreshSession),saved)).rejects.toBe(error);expect(refreshSession).not.toHaveBeenCalled();
});
it('does not reuse a session when refresh discovers another signed-in account',async()=>{
  const getUser=vi.fn().mockResolvedValue({data:{user:null},error:new AuthApiError('Expired',401,undefined)});
  const refreshSession=vi.fn().mockResolvedValue({data:{session:{...saved,user:{id:'account-b'}}},error:null});
  await expect(verifySavedSession(client(getUser,refreshSession),saved)).rejects.toThrow('Сессия изменилась');expect(getUser).toHaveBeenCalledTimes(1);
});
it('requires a new login when the saved refresh token was revoked',async()=>{
  const error=new AuthApiError('Refresh token revoked',400,'refresh_token_not_found');
  const getUser=vi.fn().mockResolvedValue({data:{user:null},error:new AuthApiError('Expired',401,undefined)}),refreshSession=vi.fn().mockResolvedValue({data:{session:null},error});
  await expect(verifySavedSession(client(getUser,refreshSession),saved)).rejects.toBe(error);
});

function token(claims:Record<string,unknown>) {
  const encode=(value:unknown)=>Buffer.from(JSON.stringify(value)).toString('base64url');
  return encode({alg:'ES256'})+'.'+encode(claims)+'.signature';
}
it('reads the session id and sign-in provider of this device without trusting the token for access',()=>{
  const session={access_token:token({session_id:'f3a1c2d4-1111-2222-3333-444455556666',iat:1793000000,amr:[{method:'oauth',timestamp:1793000100}]}),user:{id:'account-a',app_metadata:{provider:'google'},last_sign_in_at:'2026-11-01T08:00:00.000Z'}} as unknown as Session;
  expect(currentSessionInfo(session)).toEqual({sessionId:'f3a1c2d4-1111-2222-3333-444455556666',signedInAt:'2026-11-01T08:00:00.000Z',provider:'google'});
});
it('falls back to the token time and survives a token that cannot be read',()=>{
  const fromToken={access_token:token({iat:1793000000}),user:{id:'a',app_metadata:{}}} as unknown as Session;
  expect(currentSessionInfo(fromToken)).toEqual({sessionId:null,signedInAt:new Date(1793000000*1000).toISOString(),provider:null});
  const broken={access_token:'not-a-token',user:{id:'a'}} as unknown as Session;
  expect(currentSessionInfo(broken)).toEqual({sessionId:null,signedInAt:null,provider:null});
});
it('names the browser and system of this device',()=>{
  expect(describeDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36')).toBe('Chrome · Windows');
  expect(describeDevice('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/130.0 Safari/537.36 Edg/130.0')).toBe('Edge · Windows');
  expect(describeDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1')).toBe('Safari · iOS');
  expect(describeDevice('Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36')).toBe('Chrome · Android');
  expect(describeDevice('curl/8')).toBe('');
});
