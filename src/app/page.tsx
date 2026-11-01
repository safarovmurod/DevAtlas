
import { PageTransition } from '@/components/layout/page-transition';
import Link from 'next/link';
import { ArrowRight, BookOpen, CalendarCheck, CheckCircle2, ChevronDown, Code2, FileCode2, ListChecks, NotebookPen, RotateCcw, Sparkles, Languages, Terminal } from 'lucide-react';
import { getRequestLocale } from '@/lib/request-locale';
import { LANDING_COPY, PUBLIC_COPY } from '@/lib/public-copy';
import { BRAND_NAME } from '@/lib/brand';
import { INTERFACE_LOCALES } from '@/lib/locale';
import { MEMBERSHIP_COPY } from '@/lib/billing/copy';
import { COURSE_CATEGORIES } from '@/content/course-categories';
import { COURSE_CATALOG } from '@/content/courses/catalog';
import { CATEGORY_ICONS } from '@/components/courses/category-icons';
import { PublicHeader } from '@/components/layout/public-header';
import { Brand } from '@/components/layout/brand';

const STUDIO_COPY = {
  ru:{lesson:'Ваш первый проект',workspace:'Учебная мастерская',day:'День 1 · HTML',instruction:'Создайте страницу. Посмотрите результат.',preview:'Предпросмотр',heading:'Привет, мир!',description:'Мой путь в разработку начинается здесь.',step:'Урок → Код → Проверка → Новый день',tracks:'Веб · Бэкенд · Python · Мобильная разработка · C++'},
  en:{lesson:'Your first project',workspace:'Learning workspace',day:'Day 1 · HTML',instruction:'Build a page. See the result.',preview:'Preview',heading:'Hello, world!',description:'My developer journey starts here.',step:'Learn → Code → Check → Next day',tracks:'Web · Backend · Python · Mobile · C++'},
  tg:{lesson:'Лоиҳаи аввалини шумо',workspace:'Муҳити омӯзиш',day:'Рӯзи 1 · HTML',instruction:'Саҳифа созед. Натиҷаро бинед.',preview:'Пешнамоиш',heading:'Салом, ҷаҳон!',description:'Роҳи ман дар барномасозӣ аз ҳамин ҷо оғоз мешавад.',step:'Дарс → Код → Санҷиш → Рӯзи нав',tracks:'Веб · Бэкенд · Python · Мобилӣ · C++'},
  uk:{lesson:'Ваш перший проєкт',workspace:'Навчальна майстерня',day:'День 1 · HTML',instruction:'Створіть сторінку. Перегляньте результат.',preview:'Попередній перегляд',heading:'Привіт, світе!',description:'Мій шлях у розробку починається тут.',step:'Урок → Код → Перевірка → Новий день',tracks:'Веб · Бекенд · Python · Мобільна розробка · C++'},
  ja:{lesson:'最初のプロジェクト',workspace:'学習ワークスペース',day:'1日目 · HTML',instruction:'ページを作り、結果を確認しましょう。',preview:'プレビュー',heading:'こんにちは、世界！',description:'ここからプログラミングの旅が始まります。',step:'学ぶ → 書く → 確認 → 次の日へ',tracks:'ウェブ · バックエンド · Python · モバイル · C++'},
  ko:{lesson:'첫 번째 프로젝트',workspace:'학습 작업 공간',day:'1일차 · HTML',instruction:'페이지를 만들고 결과를 확인하세요.',preview:'미리 보기',heading:'안녕, 세상!',description:'개발자로서의 여정이 여기서 시작됩니다.',step:'학습 → 코딩 → 확인 → 다음 날',tracks:'웹 · 백엔드 · Python · 모바일 · C++'},
};

const icons = [BookOpen, Code2, Sparkles] as const;
const stepIcons = [BookOpen, Code2, CheckCircle2, CalendarCheck] as const;
const insideIcons = [Terminal, CalendarCheck, ListChecks, RotateCcw, NotebookPen, Sparkles, Languages] as const;

export default async function Page() {
  const locale=await getRequestLocale();
  const copy=PUBLIC_COPY[locale], studio=STUDIO_COPY[locale], landing=LANDING_COPY[locale], membership=MEMBERSHIP_COPY[locale];
  // Match the catalog: JavaScript's second month is reached through its first card.
  const courses=COURSE_CATALOG.filter(course=>course.id!=='javascript-2');
  const headerCopy={directions:landing.directions,how:landing.how,plans:landing.plans,questions:landing.questions,signIn:landing.signIn,openMenu:landing.openMenu,closeMenu:landing.closeMenu,start:copy.start,startShort:landing.startShort,platform:landing.footerPlatform};
  return <PageTransition><main className="public-home">
    <PublicHeader copy={headerCopy}/>
    <div className="public-hero-layout"><section className="public-hero">
      <p className="public-eyebrow">{copy.eyebrow}</p>
      <h1>{copy.heroLead} <span>{copy.heroEmphasis}</span> {copy.heroEnd}</h1>
      <p>{copy.heroDescription}</p>
      <div className="public-actions"><Link href="/login" transitionTypes={['nav-forward']} className="button primary">{copy.start} <ArrowRight size={18}/></Link><Link href="#directions" className="button subtle">{copy.seePlatform}</Link></div>
      <div className="public-facts">{[landing.courses(courses.length),landing.categories(COURSE_CATEGORIES.length),landing.languages(INTERFACE_LOCALES.length),landing.guest].map(fact=><span key={fact}>{fact}</span>)}</div>
    </section>
    <section className="studio-preview" aria-label={studio.workspace}><div className="studio-top"><span className="window-dots" aria-hidden="true"><i/><i/><i/></span><span>{studio.workspace}</span><Code2 size={16}/></div><div className="studio-task"><span className="eyebrow">{studio.day}</span><h2>{studio.lesson}</h2><p>{studio.instruction}</p></div><div className="studio-file"><FileCode2 size={14}/>index.html</div><pre className="studio-code"><code><span className="code-comment">&lt;!doctype html&gt;</span>{'\n'}<span className="code-tag">&lt;main&gt;</span>{'\n'}  <span className="code-tag">&lt;h1&gt;</span>{studio.heading}<span className="code-tag">&lt;/h1&gt;</span>{'\n'}  <span className="code-tag">&lt;p&gt;</span>{studio.description}<span className="code-tag">&lt;/p&gt;</span>{'\n'}<span className="code-tag">&lt;/main&gt;</span></code></pre><div className="studio-result"><span>{studio.preview}</span><h3>{studio.heading}</h3><p>{studio.description}</p></div><div className="studio-flow"><CheckCircle2 size={16}/>{studio.step}</div></section></div>
    <section className="public-section public-reveal" id="directions" aria-labelledby="public-directions-heading"><div className="public-section-heading"><h2 id="public-directions-heading">{landing.directionTitle}</h2><p>{landing.directionIntro}</p></div><div className="public-direction-grid">{COURSE_CATEGORIES.map(category=>{const Icon=CATEGORY_ICONS[category.id];const count=courses.filter(course=>course.category===category.id).length;return <Link className="public-direction-card" key={category.id} href="/courses"><span className="public-direction-icon"><Icon size={20}/></span><span><strong>{category.labels[locale]}</strong><small>{landing.courses(count)}</small></span><ArrowRight size={16}/></Link>;})}</div></section>
    <section className="public-section public-reveal" id="how-it-works" aria-labelledby="public-how-heading"><div className="public-section-heading"><h2 id="public-how-heading">{landing.howTitle}</h2></div><ol className="public-steps">{landing.steps.map((step,index)=>{const Icon=stepIcons[index];return <li key={step.title}><span className="public-step-icon"><Icon size={20}/></span><span className="public-step-number">{String(index+1).padStart(2,'0')}</span><h3>{step.title}</h3><p>{step.description}</p></li>;})}</ol></section>
    <section className="public-features public-reveal" aria-labelledby="public-features-heading">
      <h2 id="public-features-heading">{copy.featuresTitle}</h2>
      <div className="public-feature-grid">{copy.features.map((feature,index)=>{
        const Icon=icons[index];
        return <article key={feature.title}><Icon size={24}/><h3>{feature.title}</h3><p>{feature.description}</p></article>;
      })}</div>
    </section>
    <section className="public-section public-reveal" aria-labelledby="public-inside-heading"><div className="public-section-heading"><h2 id="public-inside-heading">{landing.insideTitle}</h2></div><ul className="public-capabilities">{landing.inside.map((item,index)=>{const Icon=insideIcons[index];return <li key={item}><Icon size={19}/><span>{item}</span></li>;})}</ul></section>
    <section className="public-section public-reveal" id="plans" aria-labelledby="public-plans-heading"><div className="public-section-heading"><h2 id="public-plans-heading">{landing.plans}</h2><p>{membership.note}</p></div><div className="public-plan-grid">{[{name:membership.starter,status:membership.free},{name:membership.pro,status:membership.planned},{name:membership.expert,status:membership.planned}].map((plan,index)=><div className="public-plan-card" key={plan.name}><strong>{plan.name}</strong><span>{plan.status}</span>{index>0&&<small>{membership.unavailable}</small>}</div>)}</div><Link className="button subtle public-plans-link" href="/plans">{membership.plans}<ArrowRight size={16}/></Link></section>
    <section className="public-section public-reveal" id="faq" aria-labelledby="public-faq-heading"><div className="public-section-heading"><h2 id="public-faq-heading">{landing.faqTitle}</h2></div><div className="public-faq">{landing.faq.map(item=><details key={item.question}><summary>{item.question}<ChevronDown size={18}/></summary><p>{item.answer}</p></details>)}</div></section>
    <section className="public-cta public-reveal"><div><h2>{copy.ctaTitle}</h2><p>{copy.ctaDescription}</p></div><Link className="button primary" href="#directions">{copy.ctaLink} <ArrowRight size={18}/></Link></section>
    <footer className="public-footer"><div className="public-footer-brand"><Brand variant="public"/><p>{copy.description}</p><small>© {new Date().getFullYear()} {BRAND_NAME}</small></div><div className="public-footer-column"><strong>{landing.footerPlatform}</strong><Link href="#directions">{landing.directions}</Link><Link href="#how-it-works">{landing.how}</Link><Link href="#plans">{landing.plans}</Link><Link href="#faq">{landing.questions}</Link></div><div className="public-footer-column"><strong>{landing.footerDocuments}</strong><Link href="/privacy">{copy.privacyLabel}</Link><Link href="/terms">{copy.termsLabel}</Link></div></footer>
  </main></PageTransition>;
}
