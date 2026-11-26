/** Server-only Telegram Bot API helpers (messages, photo cards, callbacks, Mini App keyboards). */

export type TelegramInlineButton =
  | { text: string; url: string }
  | { text: string; web_app: { url: string } }
  | { text: string; callback_data: string };

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
  return 'https://react-mentor-opal.vercel.app';
}

export function escapeTelegramHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function callTelegramApi(method: string, payload: Record<string, unknown>): Promise<boolean> {
  const token = telegramBotToken();
  if (!token) return false;
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function sendTelegramMessage(params: {
  chatId: string | number;
  text: string;
  parseMode?: 'HTML';
  buttons?: TelegramInlineButton[][];
}): Promise<boolean> {
  return callTelegramApi('sendMessage', {
    chat_id: params.chatId,
    text: params.text.slice(0, 3900),
    disable_web_page_preview: true,
    ...(params.parseMode ? { parse_mode: params.parseMode } : {}),
    ...(params.buttons?.length
      ? { reply_markup: { inline_keyboard: params.buttons } }
      : {}),
  });
}

export async function sendTelegramPhoto(params: {
  chatId: string | number;
  photoUrl: string;
  caption: string;
  parseMode?: 'HTML';
  buttons?: TelegramInlineButton[][];
}): Promise<boolean> {
  const ok = await callTelegramApi('sendPhoto', {
    chat_id: params.chatId,
    photo: params.photoUrl,
    caption: params.caption.slice(0, 1000),
    ...(params.parseMode ? { parse_mode: params.parseMode } : {}),
    ...(params.buttons?.length
      ? { reply_markup: { inline_keyboard: params.buttons } }
      : {}),
  });
  if (ok) return true;
  // Graceful fallback to text message if Telegram cannot fetch the banner image.
  return sendTelegramMessage({
    chatId: params.chatId,
    text: params.caption,
    parseMode: params.parseMode,
    buttons: params.buttons,
  });
}

export async function editTelegramCard(params: {
  chatId: string | number;
  messageId: number;
  isPhotoMessage: boolean;
  text: string;
  parseMode?: 'HTML';
  buttons?: TelegramInlineButton[][];
}): Promise<boolean> {
  if (params.isPhotoMessage) {
    return callTelegramApi('editMessageCaption', {
      chat_id: params.chatId,
      message_id: params.messageId,
      caption: params.text.slice(0, 1000),
      ...(params.parseMode ? { parse_mode: params.parseMode } : {}),
      ...(params.buttons?.length
        ? { reply_markup: { inline_keyboard: params.buttons } }
        : {}),
    });
  }
  return callTelegramApi('editMessageText', {
    chat_id: params.chatId,
    message_id: params.messageId,
    text: params.text.slice(0, 3900),
    disable_web_page_preview: true,
    ...(params.parseMode ? { parse_mode: params.parseMode } : {}),
    ...(params.buttons?.length
      ? { reply_markup: { inline_keyboard: params.buttons } }
      : {}),
  });
}

export async function answerTelegramCallback(callbackQueryId: string, text?: string): Promise<boolean> {
  return callTelegramApi('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    ...(text ? { text: text.slice(0, 180) } : {}),
  });
}

export async function notifyTelegramAdmin(text: string): Promise<boolean> {
  const chatId = telegramAdminChatId();
  if (!chatId || !isTelegramBotConfigured()) return false;
  return sendTelegramMessage({ chatId, text });
}
