# REST API на Express + MySQL

Сервис авторизации по JWT и управления файлами с локальным хранилищем.

## Быстрый старт

- Скопируйте окружение: `cp .env.example .env` и заполните значения (`JWT_SECRET`, `JWT_REFRESH_SECRET`, реквизиты MySQL).
- Поднимите MySQL: `docker compose up -d mysql` (создаёт пустую БД по переменным окружения).
- Установите зависимости: `npm install`.
- Примените схему через Drizzle: `npm run drizzle:push` (создаст/обновит таблицы по моделям).
- Сборка: `npm run build` (tsc в `dist/`).
- Запуск: `npm start` (или `npm run dev` с `ts-node`/nodemon).
- Swagger UI: доступен на `GET /docs` после запуска сервера.
- Drizzle CLI:
  - `npm run drizzle:generate` — сгенерировать миграции по схемам.
  - `npm run drizzle:push` — применить схему к БД.

## Основные настройки

- CORS открыт для любого домена.
- Access-токен живёт 10 минут (`JWT_ACCESS_EXPIRES`), refresh по умолчанию 30 дней (`JWT_REFRESH_EXPIRES`).
- Директория загрузок настраивается через `UPLOADS_DIR` (по умолчанию `./uploads`).
- Работа с БД через Drizzle ORM (mysql2 драйвер); схема разнесена по файлам в `src/db/schema/`.

## Маршруты

- `POST /signup` — регистрация `{ id, password }`, возвращает `token` и `refresh_token`.
- `POST /signin` — авторизация `{ id, password }`, возвращает новую пару токенов.
- `POST /signin/new_token` — обновление пары по `refresh_token` (в теле).
- `GET /info` — текущий пользователь, `Authorization: Bearer <token>`.
- `GET /logout` — выход, нужен access-токеню. Блокирует текущую пару, другие устройства не затрагивает.

### Работа с файлами (все под авторизацией)

Используйте `Authorization: Bearer <token>`.

- `POST /file/upload` — multipart-поле `file`, сохраняет метаданные в БД.
- `GET /file/list?list_size=10&page=1` — постраничный список файлов пользователя.
- `GET /file/:id` — метаданные файла.
- `GET /file/download/:id` — скачать файл.
- `PUT /file/update/:id` — заменить файл, multipart-поле `file`.
- `DELETE /file/delete/:id` — удалить запись и файл на диске.

## Замечания

- После `logout` access/refresh токены помечаются заблокированными и перестают работать; новая авторизация выдаёт новую пару.
- Хеши паролей/refresh-токенов сохраняются в БД, access-токены проверяются на блокировку по `jti`.
