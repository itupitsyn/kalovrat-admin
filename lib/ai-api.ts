/**
 * Сервис генерации (ai-api-stuff): барьер содержания.
 *
 * Барьер живёт ТАМ, а не в базе бота, и это не случайность: решение
 * «проверять ли этот запрос» принимает сам сервис, в том числе на запросах,
 * которые пришли не от бота (стенд стикеров, страница замены, прямой вызов
 * API). Поэтому админка не правит таблицу, а ходит к сервису по HTTP — иначе
 * выключатель действовал бы только на бота.
 *
 * Адрес и токен берутся ТОЛЬКО из окружения контейнера админки:
 *
 *     AI_API_URL=https://...   адрес сервиса (тот же, что у бота)
 *     AI_API_TOKEN=...         тот же токен, что у бота
 *
 * Не заданы — страница честно скажет, что барьер недоступен, вместо того
 * чтобы нарисовать переключатель, который никуда не ведёт.
 */

export interface ModerationState {
  /** Общая цензура: проверяются все, в том числе запросы без id. */
  all: boolean;
  /** Кому барьер адресован поимённо. */
  users: number[];
  /**
   * MODERATION_ENABLED в окружении сервиса. Это пол: барьер у всех, и отсюда
   * его не снять — только убрать переменную и пересоздать контейнер.
   */
  forced: boolean;
  /** Путь к файлу состояния на сервисе: видно, что именно правим. */
  file: string;
  /** Человеческая строка состояния — ту же сервис пишет в журнал при старте. */
  state: string;
}

/**
 * Запрос недолгий нарочно: страница админки не должна висеть из-за того, что
 * домашняя машина недоступна.
 */
const TIMEOUT_MS = 5000;

const base = () => (process.env.AI_API_URL ?? '').trim().replace(/\/+$/, '');

export const isAiApiConfigured = () => !!base();

const call = async (path: string, init?: RequestInit) => {
  const url = base();
  if (!url) {
    throw new Error('AI_API_URL не задан у админки');
  }

  const token = (process.env.AI_API_TOKEN ?? '').trim();

  const res = await fetch(`${url}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      // Пустой токен не подставляем вовсе: у сервиса пустой API_TOKEN
      // означает «проверки нет», и посылать в таком случае пустой заголовок
      // незачем.
      ...(token ? { 'X-API-Token': token } : {}),
      ...init?.headers,
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`${path} ответил ${res.status}`);
  }

  return (await res.json()) as ModerationState;
};

export const getModeration = () => call('/api/moderation');

export const setModerationAll = (all: boolean) =>
  call('/api/moderation', { method: 'PUT', body: JSON.stringify({ all }) });

/**
 * Человек переключается по одному, а не списком целиком: админка бывает
 * открыта в двух вкладках, и запись всего списка затирала бы правку, сделанную
 * из другой секунду назад. Сервис на этом адресе перечитывает файл под замком
 * и меняет одну запись, см. moderation.set_user.
 */
export const setModerationUser = (userId: string, enabled: boolean) =>
  call(`/api/moderation/user/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    body: JSON.stringify({ enabled }),
  });
