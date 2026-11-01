This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Окружение

| переменная | зачем |
|---|---|
| `DATABASE_URL` | база бота; нужна и при сборке (`prisma generate`), и в работе |
| `ADMIN_LOGIN`, `ADMIN_PASSWORD` | вход в админку |
| `AI_API_URL` | адрес сервиса генерации — для барьера содержания |
| `AI_API_TOKEN` | его токен; тот же, что у бота |

Последние две — для раздела «Барьер содержания». Барьер живёт в сервисе
генерации, а не в этой базе: решение «проверять ли запрос» принимает сам
сервис, в том числе на запросах не от бота. Поэтому админка ходит к нему по
HTTP (`lib/ai-api.ts`), и без этих переменных раздел честно скажет, что барьер
недоступен, а таблица пользователей покажет в графе «Барьер» прочерк —
остальные страницы работают как работали.

Запросы к сервису идут **с сервера**, из обработчиков Next.js: токен в браузер
не попадает.

## Деплой

`.github/workflows/deployment.yml`, на каждый push в `master` (и вручную через
workflow_dispatch): образ собирается на раннере, уезжает на VDS через `scp`
архивом и запускается там `docker run`.

Значения в проде — **секреты репозитория**, а не `.env` на машине:
`DB_URL`, `ADMIN_LOGIN`, `ADMIN_PASSWORD`, `AI_API_URL`, `AI_API_TOKEN`.

Отсюда правило: **новая переменная требует двух правок** — секрет в настройках
репозитория и строка `-e` в workflow. Переменную, которой нет в том списке,
контейнер не увидит, сколько её ни заводи в секретах.

Новая модель prisma доезжает только пересборкой: `prisma generate` живёт в
`Dockerfile`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
