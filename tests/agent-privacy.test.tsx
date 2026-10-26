import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
const actor=vi.hoisted(()=>({id:'account-a' as string|null}));
vi.mock('@/components/account/account-provider',()=>({useAccount:()=>({user:actor.id?{id:actor.id}:null})}));
vi.mock('@/lib/supabase/client',()=>({getSupabaseBrowserClient:()=>({auth:{getSession:async()=>({data:{session:actor.id?{user:{id:actor.id},access_token:'unit-test-token'}:null}})}})}));
import {SiteAgent} from '@/components/agent/site-agent';
import {useLearningStore} from '@/stores/learning-store';
import {useAppStore} from '@/stores/app-store';
import {agentStorageKey,readAgentHistory,saveAgentHistory,LEGACY_AGENT_CHAT_KEY} from '@/lib/agent/private-history';
const message={id:'private',sender:'user' as const,text:'Account A private draft'};
beforeEach(()=>{localStorage.clear();actor.id='account-a';useLearningStore.setState({language:'en',selectedCourse:'react'});useAppStore.setState({tutorDrawerOpen:false});});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
const open=()=>fireEvent.click(screen.getByRole('button',{name:'DevAtlas assistant'}));
it('separates guest, accounts and voice preferences without claiming legacy ownership',()=>{
 localStorage.setItem(LEGACY_AGENT_CHAT_KEY,JSON.stringify([message]));
 expect(readAgentHistory(localStorage,'account-a')).toBeNull();
 expect(saveAgentHistory(localStorage,'account-a',[message])).toBe(true);
 expect(readAgentHistory(localStorage,'account-a')).toEqual([message]);
 expect(readAgentHistory(localStorage,'account-b')).toBeNull();expect(readAgentHistory(localStorage,null)).toBeNull();
 expect(localStorage.getItem(LEGACY_AGENT_CHAT_KEY)).toContain(message.text);
 expect(agentStorageKey(null)).not.toBe(agentStorageKey('guest'));
 expect(agentStorageKey('account-a','voice')).not.toBe(agentStorageKey('account-b','voice'));
});
it('rejects malformed, oversized and active-link histories',()=>{
 for(const raw of ['not JSON','{}',JSON.stringify([{...message,links:[{href:'javascript:alert(1)',label:'bad'}]}]),' '.repeat(320001)]){
  localStorage.setItem(agentStorageKey('account-a'),raw);expect(readAgentHistory(localStorage,'account-a')).toBeNull();
 }
 expect(readAgentHistory({getItem(){throw new Error('denied');}},'account-a')).toBeNull();
 expect(saveAgentHistory({setItem(){throw new Error('full');}},null,[message])).toBe(false);
});
it('restores the current owner only, and cannot commit a late reply into a switched account',async()=>{
 saveAgentHistory(localStorage,'account-a',[message]);
 let resolve!:(value:Response)=>void;
 const request=vi.fn(()=>new Promise<Response>(done=>{resolve=done;}));vi.stubGlobal('fetch',request);
 const view=render(<SiteAgent/>);open();expect(screen.getByText(message.text)).toBeInTheDocument();
 fireEvent.change(screen.getByLabelText('Ask the assistant'),{target:{value:'Explain frobnitz variables'}});
 fireEvent.click(screen.getByRole('button',{name:'Send'}));await waitFor(()=>expect(request).toHaveBeenCalledOnce());
 actor.id='account-b';view.rerender(<SiteAgent/>);open();
 expect(screen.queryByText(message.text)).not.toBeInTheDocument();
 await act(async()=>resolve(new Response(JSON.stringify({reply:'Late secret from A'}))));
 expect(screen.queryByText('Late secret from A')).not.toBeInTheDocument();
 expect(localStorage.getItem(agentStorageKey('account-b'))).not.toContain('Late secret');
});
it('clearing a pending chat cancels its request even when the transport resolves later',async()=>{
 let resolve!:(value:Response)=>void;
 const request=vi.fn(()=>new Promise<Response>(done=>{resolve=done;}));vi.stubGlobal('fetch',request);
 render(<SiteAgent/>);open();
 fireEvent.change(screen.getByLabelText('Ask the assistant'),{target:{value:'Explain frobnitz variables'}});
 fireEvent.click(screen.getByRole('button',{name:'Send'}));await waitFor(()=>expect(request).toHaveBeenCalledOnce());
 fireEvent.click(screen.getByRole('button',{name:'Clear chat'}));
 await act(async()=>resolve(new Response(JSON.stringify({reply:'Cleared response'}))));
 expect(screen.queryByText('Cleared response')).not.toBeInTheDocument();
 expect(screen.getByRole('button',{name:'Send'})).toBeDisabled();
});

it('mobile dialog focuses input, locks background scrolling and closes with Escape',()=>{
 vi.stubGlobal('matchMedia',()=>({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()}));
 const before=document.body.style.overflow;render(<SiteAgent/>);
 const launcher=screen.getByRole('button',{name:'DevAtlas assistant'});launcher.focus();open();
 expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal','true');
 expect(document.body.style.overflow).toBe('hidden');expect(screen.getByLabelText('Ask the assistant')).toHaveFocus();
 fireEvent.keyDown(document,{key:'Escape'});expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
 expect(document.body.style.overflow).toBe(before);expect(launcher).toHaveFocus();
});
