# Gym Helper — Vite + React

Мобильное веб-приложение для тренировок, профиля, веса и питания.

## Запуск локально

```bash
npm install
npm run dev
```

## Деплой на Vercel

1. Загрузи файлы проекта в GitHub.
2. Подключи репозиторий к Vercel.
3. Framework Preset: `Vite`.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.

## Авторизация и облачная синхронизация через Supabase

Авторизация уже встроена в приложение. Без Supabase приложение продолжает работать локально через `localStorage`.

### 1. Создай проект Supabase

Создай проект на Supabase и возьми:

- Project URL
- anon/public key

Обычно они находятся в Project Settings -> API.

### 2. Создай таблицу

Открой Supabase Dashboard -> SQL Editor -> New query и выполни SQL из файла:

```text
supabase-schema.sql
```

Таблица называется `app_state`. В ней хранится один JSON-документ на пользователя: профиль, тренировки, вес, питание, избранные продукты и сохраненные меню.

### 3. Добавь переменные окружения в Vercel

В Vercel открой проект -> Settings -> Environment Variables и добавь:

```text
VITE_SUPABASE_URL=твой Project URL
VITE_SUPABASE_ANON_KEY=твой anon/public key
```

После этого сделай Redeploy.

### 4. Как работает синхронизация

- До входа данные хранятся локально в браузере.
- После входа локальные данные объединяются с облаком.
- После этого изменения автоматически сохраняются в Supabase.
- При входе на другом устройстве данные подтягиваются из облака.

## Штрихкод и питание

Сканер ищет продукт в Open Food Facts и заполняет КБЖУ на 100 г. После сканирования проверь граммы и нажми `Добавить`. Если в Open Food Facts нет полного КБЖУ, введи данные с этикетки вручную.

## Основные файлы

- `src/main.jsx` — логика приложения.
- `src/styles.css` — внешний вид.
- `public/exercises` — картинки упражнений.
- `supabase-schema.sql` — таблица и RLS-политики для Supabase.
