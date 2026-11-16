'use client';

import type { ComputerScreenData } from './computer-screen';
import { ComputerStage } from './computer-stage';

/** The hero computer: a calm pose with idle motion and mouse parallax. */
export function HeroScene({ screen }: { screen: ComputerScreenData }) {
  return (
    <ComputerStage
      variant="hero"
      screen={screen}
      className="h-[360px] w-full min-w-0 sm:h-[420px] lg:h-[560px]"
    />
  );
}
