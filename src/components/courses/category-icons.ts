import { Code2, Palette, Megaphone, ChartNoAxesCombined, BriefcaseBusiness, MessagesSquare, Clapperboard, Languages, Shapes, Heart, Sparkles } from 'lucide-react';
import type { CourseCategoryId } from '@/content/course-categories';

export const CATEGORY_ICONS:Record<CourseCategoryId,typeof Code2> = {
  programming:Code2, ai:Sparkles, design:Palette, marketing:Megaphone,
  analytics:ChartNoAxesCombined, business:BriefcaseBusiness, 'soft-skills':MessagesSquare,
  content:Clapperboard, languages:Languages, kids:Shapes, lifestyle:Heart,
};
