import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { LanguageMenu } from '@/components/layout/language-menu';
import { AccountMenu } from '@/components/layout/account-menu';
import { COPY } from '@/lib/i18n';
import { ACCOUNT_COPY } from '@/lib/account-copy';
import { useLearningStore } from '@/stores/learning-store';

const mocks=vi.hoisted(()=>({signOut:vi.fn(),user:{id:'account'}}));
vi.mock('@/components/account/account-provider',()=>({useAccount:()=>({user:mocks.user,signOut:mocks.signOut})}));
vi.mock('@/components/account/account-avatar',()=>({AccountAvatar:()=> <span className="avatar">A</span>}));

beforeEach(()=>{useLearningStore.setState({language:'ru'});mocks.signOut.mockReset();});
afterEach(()=>{cleanup();useLearningStore.setState({language:'ru'});});

it('changes the interface language and returns focus to its trigger',()=>{
  render(<LanguageMenu/>);
  const trigger=screen.getByRole('button',{name:COPY.ru.interfaceLanguage});
  fireEvent.click(trigger);
  expect(screen.getByRole('menuitemradio',{name:/Русский/})).toHaveFocus();
  fireEvent.click(screen.getByRole('menuitemradio',{name:/English/}));
  expect(useLearningStore.getState().language).toBe('en');
  expect(screen.getByRole('button',{name:COPY.en.interfaceLanguage})).toHaveTextContent('EN');
  expect(trigger).toHaveFocus();
});

it('closes the account menu on Escape and keeps sign out in the account menu',()=>{
  render(<AccountMenu/>);
  const trigger=screen.getByRole('button',{name:ACCOUNT_COPY.ru.profile});
  fireEvent.click(trigger);
  expect(screen.getByRole('menuitem',{name:'Личный профиль'})).toHaveFocus();
  fireEvent.keyDown(screen.getByRole('menu'),{key:'Escape'});
  expect(trigger).toHaveFocus();
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  fireEvent.click(trigger);
  act(()=>fireEvent.click(screen.getByRole('menuitem',{name:'Выйти из аккаунта'})));
  expect(mocks.signOut).toHaveBeenCalledOnce();
});
