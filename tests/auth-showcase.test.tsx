import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AuthShowcase, AuthShowcaseMobile } from '@/components/account/auth-showcase';
import { AUTH_COPY } from '@/lib/auth-copy';
import { useLearningStore } from '@/stores/learning-store';

const mocked = vi.hoisted(() => ({
  carousel: vi.fn(),
  createScene: vi.fn(),
  controller: { setSlide: vi.fn(), spin: vi.fn(), dispose: vi.fn() },
  api: {
    on: vi.fn(),
    off: vi.fn(),
    selectedScrollSnap: () => 0,
    scrollPrev: vi.fn(),
    scrollNext: vi.fn(),
    scrollTo: vi.fn(),
  },
}));
vi.mock('embla-carousel-react', () => ({ default: mocked.carousel }));
vi.mock('embla-carousel-autoplay', () => ({
  default: () => ({ play: vi.fn(), stop: vi.fn(), reset: vi.fn() }),
}));
vi.mock('@/components/account/auth-showcase-scene', () => ({
  createShowcaseScene: mocked.createScene,
}));

const initialStore = useLearningStore.getState();
let desktop = false;
let reducedMotion = false;
const listeners = new Map<string, Set<() => void>>();
const viewportRef = () => {};

beforeEach(() => {
  vi.clearAllMocks();
  listeners.clear();
  desktop = false;
  reducedMotion = false;
  useLearningStore.setState({ language: 'en' });
  mocked.carousel.mockReturnValue([viewportRef, mocked.api]);
  mocked.createScene.mockReturnValue(mocked.controller);
  vi.stubGlobal('matchMedia', (query: string) => {
    if (!listeners.has(query)) listeners.set(query, new Set());
    return {
      get matches() {
        return query.includes('1024px') ? desktop : reducedMotion;
      },
      addEventListener: (_: string, fn: () => void) => listeners.get(query)!.add(fn),
      removeEventListener: (_: string, fn: () => void) => listeners.get(query)!.delete(fn),
    };
  });
});
afterEach(() => {
  cleanup();
  useLearningStore.setState(initialStore);
  vi.unstubAllGlobals();
});

it('shows a static mobile panel without initializing a carousel or WebGL', () => {
  render(
    <>
      <AuthShowcase />
      <AuthShowcaseMobile copy={AUTH_COPY.en} />
    </>,
  );
  expect(screen.getByText(AUTH_COPY.en.panelFlow)).toBeVisible();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(document.querySelector('[aria-roledescription="carousel"]')).toBeNull();
  expect(mocked.carousel).not.toHaveBeenCalled();
  expect(mocked.createScene).not.toHaveBeenCalled();
});

it('provides eight desktop slides and rotation, then releases the scene on mobile resize', async () => {
  desktop = true;
  render(<AuthShowcase />);
  await waitFor(() => expect(mocked.createScene).toHaveBeenCalledTimes(1));
  expect(document.querySelectorAll('.auth-showcase-slide')).toHaveLength(8);
  expect(screen.queryByText('Swipe or drag to explore')).not.toBeInTheDocument();
  fireEvent.click(await screen.findByRole('button', { name: 'Rotate 3D by 360°' }));
  expect(mocked.controller.spin).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
  expect(mocked.api.scrollNext).toHaveBeenCalledTimes(1);
  act(() => {
    desktop = false;
    listeners.get('(min-width: 1024px)')?.forEach((fn) => fn());
  });
  expect(document.querySelector('[aria-roledescription="carousel"]')).toBeNull();
  expect(mocked.controller.dispose).toHaveBeenCalledTimes(1);
});

it('does not offer animated rotation when reduced motion is requested', async () => {
  desktop = true;
  reducedMotion = true;
  render(<AuthShowcase />);
  await waitFor(() => expect(mocked.createScene).toHaveBeenCalled());
  expect(mocked.createScene.mock.calls[0][1]).toBe(true);
  expect(screen.queryByRole('button', { name: 'Rotate 3D by 360°' })).not.toBeInTheDocument();
});
