// @vitest-environment node
import {beforeEach,expect,it,vi} from 'vitest';
const mocks=vi.hoisted(()=>({user:vi.fn(),client:vi.fn(),from:vi.fn(),select:vi.fn(),eq:vi.fn(),order:vi.fn(),limit:vi.fn()}));
vi.mock('@/lib/account/require-user',()=>({authenticatedUser:mocks.user}));
vi.mock('@/lib/supabase/server',()=>({getSupabaseServerClient:mocks.client}));
import {GET} from '@/app/api/assessments/progress/route';
const request=()=>new Request('https://example.test/api/assessments/progress?courseId=html&lessonId=html-day-01&userId=forged',{headers:{authorization:'Bearer valid'}});
beforeEach(()=>{
 vi.resetAllMocks();mocks.user.mockResolvedValue({id:'actual-user'});
 const chain={select:mocks.select,eq:mocks.eq,order:mocks.order,limit:mocks.limit};
 mocks.client.mockReturnValue({from:mocks.from});mocks.from.mockReturnValue(chain);
 mocks.select.mockReturnValue(chain);mocks.eq.mockReturnValue(chain);mocks.order.mockReturnValue(chain);
 mocks.limit.mockResolvedValue({data:[{attempt_id:'real',mastered:true}],error:null});
});
it('requires identity and derives the history owner from it',async()=>{
 const response=await GET(request());expect(response.status).toBe(200);expect(response.headers.get('Cache-Control')).toContain('no-store');
 expect(mocks.eq).toHaveBeenCalledWith('user_id','actual-user');expect(mocks.limit).toHaveBeenCalledWith(20);
 expect(await response.json()).toEqual({attempts:[{attempt_id:'real',mastered:true}]});
 mocks.user.mockResolvedValue(null);expect((await GET(request())).status).toBe(401);
});
it('reports absent migration, service and network failure without fabricating history',async()=>{
 mocks.limit.mockResolvedValue({data:null,error:{code:'42P01'}});expect((await GET(request())).status).toBe(503);
 mocks.limit.mockRejectedValue(new Error('offline'));expect((await GET(request())).status).toBe(503);
 mocks.client.mockReturnValue(null);expect((await GET(request())).status).toBe(503);
});
