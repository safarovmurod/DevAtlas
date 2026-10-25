import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
const mocks=vi.hoisted(()=>({actor:'guest',session:vi.fn()}));
vi.mock('@/components/account/account-provider',()=>({useAccount:()=>({user:mocks.actor==='guest'?null:{id:mocks.actor}})}));
vi.mock('@/lib/supabase/client',()=>({getSupabaseBrowserClient:()=>({auth:{getSession:mocks.session}})}));
import {LessonAssessment} from '@/components/courses/lesson-assessment';
import {useLearningStore} from '@/stores/learning-store';
import bank from '@/content/assessments/html-first-page';
import {assessmentView} from '@/lib/practice/assessment';
import {ASSESSMENT_COPY as copy} from '@/lib/practice/assessment-copy';
const draftKey=(actor:string)=>`devatlas-assessment-draft-v1:${actor}:html:html-day-01`;
const props={courseId:'html',lessonId:'html-day-01',code:''};
beforeEach(()=>{
 localStorage.clear();mocks.actor='guest';useLearningStore.setState({language:'ru',contentLanguage:'ru'});
 mocks.session.mockImplementation(async()=>({data:{session:{user:{id:mocks.actor},access_token:mocks.actor+'-token'}},error:null}));
 vi.stubGlobal('fetch',vi.fn(async(url:string)=>Response.json(url.includes('/progress?')?{attempts:[]}:assessmentView(bank,bank.variants[0].id))));
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it('isolates answers when switching accounts and never restores cached attestation',async()=>{
 const question=bank.variants[0].questions[0];
 localStorage.setItem(draftKey('guest'),JSON.stringify({version:1,variantId:bank.variants[0].id,answers:{[question.id]:'body'},attestation:'server'}));
 const ui=render(<LessonAssessment {...props}/>);
 await waitFor(()=>expect(screen.getAllByRole('group')).toHaveLength(8));
 const guestChecked=document.querySelectorAll('input:checked').length;
 expect(guestChecked).toBe(1);expect(screen.queryByText(copy.recordedMastery.ru)).not.toBeInTheDocument();
 mocks.actor='account-b';ui.rerender(<LessonAssessment {...props}/>);
 await waitFor(()=>expect(screen.getAllByRole('group')).toHaveLength(8));
 expect(document.querySelectorAll('input:checked')).toHaveLength(0);
 fireEvent.click(document.querySelector('input[type=radio]')!);
 expect(localStorage.getItem(draftKey('account-b'))).not.toBeNull();
 expect(JSON.parse(localStorage.getItem(draftKey('guest'))!).answers).toEqual({[question.id]:'body'});
});
it('preserves malformed drafts instead of crashing or overwriting them',async()=>{
 const raw=JSON.stringify({version:1,variantId:'first-page-a',answers:{bad:{nested:{bad:true}}}});
 localStorage.setItem(draftKey('guest'),raw);render(<LessonAssessment {...props}/>);
 expect(await screen.findByRole('alert')).toHaveTextContent(copy.restoreError.ru);
 fireEvent.click(document.querySelector('input[type=radio]')!);
 expect(localStorage.getItem(draftKey('guest'))).toBe(raw);
});
