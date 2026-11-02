import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { getAnswerTopic } from '@/content/answers';
import { AnswerReader } from '@/components/learning/answer-reader';
import { useLearningStore } from '@/stores/learning-store';

const clipboard=vi.fn();
const previousClipboard=Object.getOwnPropertyDescriptor(navigator,'clipboard');
beforeEach(()=>{
  clipboard.mockReset();
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:clipboard}});
  useLearningStore.setState({language:'ru',contentLanguage:'ru'});
});
afterEach(()=>{
  cleanup();
  if(previousClipboard)Object.defineProperty(navigator,'clipboard',previousClipboard);
  else Reflect.deleteProperty(navigator,'clipboard');
});

it('copies the displayed code and acknowledges success',async()=>{
  clipboard.mockResolvedValue(undefined);
  const {container}=render(<AnswerReader topic={getAnswerTopic('deep-71')!}/>);
  const first=container.querySelector('.answer-code')!;
  const expected=first.querySelector('code')!.textContent;
  fireEvent.click(first.querySelector('button')!);
  await waitFor(()=>expect(clipboard).toHaveBeenCalledWith(expected));
  expect(screen.getAllByRole('button',{name:'Скопировано'})).toHaveLength(1);
});

it('explains when the browser cannot copy code',async()=>{
  clipboard.mockRejectedValue(new Error('Clipboard unavailable'));
  const {container}=render(<AnswerReader topic={getAnswerTopic('deep-71')!}/>);
  fireEvent.click(container.querySelector('.answer-code button')!);
  expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось скопировать');
});
