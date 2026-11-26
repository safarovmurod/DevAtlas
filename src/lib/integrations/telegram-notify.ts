/** Server-only Telegram Bot API helpers (notifications, admin alerts, Mini App keyboards). */

export type TelegramInlineButton =
  | { text: string; url: string }
  | { text: string; web_app: { url: string } };

export function telegramBotToken(): string {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || '';
}

export function telegramAdminChatId(): string {
  return process.env.TELEGRAM_ADMIN_CHAT_ID?.trim() || '';
}

export function isTelegramBotConfigured(): boolean {
  return telegramBotToken().length > 10;
}

export function resolveSiteOrigin(request?: Request): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.REACT_MENTOR_SITE_URL?.trim() ||
    '';
  if (/^https?:\/\//i.test(envUrl)) return envUrl.replace(/\/+$/, '');
  if (request) {
    try {
      return new URL(request.url).origin;
    } catch {
      // fallback below
    }
  }
  return 'https://devatlas.app';
}

export async function sendTelegramMessage(params: {
  chatId: string | number;
  text: string;
  buttons?: TelegramInlineButton[][];
}): Promise<boolean> {
  const token = telegramBotToken();
  if (!token) return false;
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: params.chatId,
        text: params.text.slice(0, 3900),
        disable_web_page_preview: true,
        ...(params.buttons?.length
          ? { reply_markup: { inline_keyboard: params.buttons } }
          : {}),
      }),
      signal: AbortSignal.timeout(7000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function notifyTelegramAdmin(text: string): Promise<boolean> {
  const chatId = telegramAdminChatId();
  if (!chatId || !isTelegramBotConfigured()) return false;
  return sendTelegramMessage({ chatId, text });
}
