import Database from 'better-sqlite3'
import path from 'path'

// Создаем базу данных
const dbPath = path.join(process.cwd(), 'data', 'app.db')
const db = new Database(dbPath)

// Создаем таблицы при первом запуске
function initDatabase() {
  // Таблица пользователей
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Таблица прогресса
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      progress_key TEXT NOT NULL,
      progress_data TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(user_id, progress_key)
    )
  `)

  console.log('✅ База данных инициализирована')
}

// Функции для работы с пользователями
const userQueries = {
  // Создать пользователя
  create: db.prepare(`
    INSERT INTO users (username, password) 
    VALUES (?, ?)
  `),

  // Найти пользователя по имени
  findByUsername: db.prepare(`
    SELECT * FROM users WHERE username = ?
  `),

  // Найти пользователя по ID
  findById: db.prepare(`
    SELECT * FROM users WHERE id = ?
  `),

  // Получить всех пользователей
  getAll: db.prepare(`
    SELECT id, username, created_at FROM users
  `)
}

// Функции для работы с прогрессом
const progressQueries = {
  // Сохранить прогресс
  upsert: db.prepare(`
    INSERT INTO user_progress (user_id, progress_key, progress_data)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, progress_key) 
    DO UPDATE SET 
      progress_data = excluded.progress_data,
      updated_at = CURRENT_TIMESTAMP
  `),

  // Получить прогресс пользователя
  getByUser: db.prepare(`
    SELECT progress_key, progress_data 
    FROM user_progress 
    WHERE user_id = ?
  `),

  // Удалить прогресс
  delete: db.prepare(`
    DELETE FROM user_progress 
    WHERE user_id = ? AND progress_key = ?
  `)
}

// Инициализируем базу при импорте
initDatabase()

export {
  db,
  userQueries,
  progressQueries
}
