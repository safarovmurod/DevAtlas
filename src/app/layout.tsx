import type { Metadata } from 'next';
import { getRequestLocale } from '@/lib/request-locale';
import { PUBLIC_COPY } from '@/lib/public-copy';
import localFont from 'next/font/local';
import './globals.css';
import { LearningProvider } from '@/components/providers/learning-provider';
import { AccountProvider } from '@/components/account/account-provider';
import { AccountShell } from '@/components/account/account-shell';

const inter = localFont({ src: './fonts/Inter.woff2', weight: '100 900', variable: '--font-inter', display: 'optional' });
// Next's automatic Arial shim would precede our explicit Inter glyph fallback
// on Windows. Keep that system-font shim out of the code-font chain.
const jetbrains = localFont({ src: './fonts/JetBrainsMono.ttf', weight: '100 800', variable: '--font-jetbrains', display: 'swap', adjustFontFallback: false });
// This small presentation-only cache lets the browser paint the last theme
// before account-scoped progress has finished loading. The store remains the
// source of truth once the active account is ready.
const themeBootstrap = `(function(){try{var theme=localStorage.getItem('devatlas-theme');if(!theme){var saved=localStorage.getItem('react-mentor-learning-v2');theme=saved?JSON.parse(saved).state?.theme:null}if(theme==='dark'||theme==='light')document.documentElement.dataset.theme=theme}catch(_){}})();`;

export async function generateMetadata(): Promise<Metadata> {
  const copy=PUBLIC_COPY[await getRequestLocale()];
  return {title:copy.title,description:copy.description};
}
export default async function RootLayout({children}:{children:React.ReactNode}) {
  const locale=await getRequestLocale();
  return <html lang={locale} suppressHydrationWarning className={`${inter.variable} ${jetbrains.variable}`}><head><script dangerouslySetInnerHTML={{__html:themeBootstrap}}/></head><body><AccountProvider initialLocale={locale}><LearningProvider initialLocale={locale}><AccountShell>{children}</AccountShell></LearningProvider></AccountProvider></body></html>;
}
