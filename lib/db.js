import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

// Подключение к PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// Флаг инициализации
let isInitialized = false

// Инициализация таблиц
export async function initDatabase() {
  const client = await pool.connect()
  try {
    // Таблица курсов (храним как JSON для простоты)
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses_data (
        id SERIAL PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Таблица упражнений
    await client.query(`
      CREATE TABLE IF NOT EXISTS exercises_data (
        id SERIAL PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Таблица about
    await client.query(`
      CREATE TABLE IF NOT EXISTS about_data (
        id SERIAL PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Таблица пользователей
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('✅ Database tables initialized')
  } finally {
    client.release()
  }
}

// Автоматическая инициализация и миграция данных
async function ensureInitialized() {
  if (isInitialized) return
  
  try {
    await initDatabase()
    
    // Проверяем есть ли данные в базе
    const result = await pool.query('SELECT data FROM courses_data LIMIT 1')
    
    if (result.rows.length === 0) {
      console.log('📦 Database empty, migrating data from JSON files...')
      
      // Мигрируем курсы из JSON
      try {
        const dataDir = path.join(process.cwd(), 'data')
        const coursesPath = path.join(dataDir, 'courses.json')
        
        if (fs.existsSync(coursesPath)) {
          const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'))
          if (coursesData.courses && coursesData.courses.length > 0) {
            await pool.query(
              'INSERT INTO courses_data (data) VALUES ($1)',
              [JSON.stringify({ courses: coursesData.courses })]
            )
            console.log('✅ Courses migrated:', coursesData.courses.length)
          }
        }
      } catch (e) {
        console.log('No courses to migrate:', e.message)
      }
      
      // Мигрируем пользователей
      try {
        const usersPath = path.join(process.cwd(), 'data', 'users.json')
        if (fs.existsSync(usersPath)) {
          const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'))
          const existingUsers = await pool.query('SELECT id FROM users LIMIT 1')
          
          if (existingUsers.rows.length === 0 && usersData.length > 0) {
            for (const user of usersData) {
              await pool.query(
                'INSERT INTO users (username, password) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING',
                [user.username, user.password]
              )
            }
            console.log('✅ Users migrated:', usersData.length)
          }
        }
      } catch (e) {
        console.log('No users to migrate:', e.message)
      }
    }
    
    isInitialized = true
    console.log('✅ Database ready')
  } catch (error) {
    console.error('Database initialization error:', error)
    // Не ставим isInitialized = true, чтобы попробовать снова
  }
}

// ========== COURSES ==========

export async function getCourses() {
  await ensureInitialized()
  const result = await pool.query('SELECT data FROM courses_data ORDER BY id DESC LIMIT 1')
  if (result.rows.length === 0) {
    return []
  }
  return result.rows[0].data.courses || []
}

export async function saveCourses(courses) {
  await ensureInitialized()
  // Проверяем есть ли запись
  const existing = await pool.query('SELECT id FROM courses_data LIMIT 1')
  
  if (existing.rows.length === 0) {
    await pool.query(
      'INSERT INTO courses_data (data) VALUES ($1)',
      [JSON.stringify({ courses })]
    )
  } else {
    await pool.query(
      'UPDATE courses_data SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [JSON.stringify({ courses }), existing.rows[0].id]
    )
  }
}

// ========== EXERCISES ==========

export async function getExercises() {
  await ensureInitialized()
  const result = await pool.query('SELECT data FROM exercises_data ORDER BY id DESC LIMIT 1')
  if (result.rows.length === 0) {
    return []
  }
  return result.rows[0].data.exercises || []
}

export async function saveExercises(exercises) {
  await ensureInitialized()
  const existing = await pool.query('SELECT id FROM exercises_data LIMIT 1')
  
  if (existing.rows.length === 0) {
    await pool.query(
      'INSERT INTO exercises_data (data) VALUES ($1)',
      [JSON.stringify({ exercises })]
    )
  } else {
    await pool.query(
      'UPDATE exercises_data SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [JSON.stringify({ exercises }), existing.rows[0].id]
    )
  }
}

// ========== ABOUT ==========

export async function getAbout() {
  await ensureInitialized()
  const result = await pool.query('SELECT data FROM about_data ORDER BY id DESC LIMIT 1')
  if (result.rows.length === 0) {
    return { title: '', description: '', content: '' }
  }
  return result.rows[0].data
}

export async function saveAbout(about) {
  await ensureInitialized()
  const existing = await pool.query('SELECT id FROM about_data LIMIT 1')
  
  if (existing.rows.length === 0) {
    await pool.query(
      'INSERT INTO about_data (data) VALUES ($1)',
      [JSON.stringify(about)]
    )
  } else {
    await pool.query(
      'UPDATE about_data SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [JSON.stringify(about), existing.rows[0].id]
    )
  }
}

// ========== USERS ==========

export async function getUsers() {
  await ensureInitialized()
  const result = await pool.query('SELECT id, username, password FROM users')
  return result.rows
}

export async function addUser(username, password) {
  await ensureInitialized()
  const result = await pool.query(
    'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
    [username, password]
  )
  return result.rows[0]
}

export async function findUserByCredentials(username, password) {
  await ensureInitialized()
  const result = await pool.query(
    'SELECT id, username FROM users WHERE LOWER(username) = LOWER($1) AND password = $2',
    [username, password]
  )
  return result.rows[0] || null
}

export async function findUserByUsername(username) {
  await ensureInitialized()
  const result = await pool.query(
    'SELECT id, username FROM users WHERE LOWER(username) = LOWER($1)',
    [username]
  )
  return result.rows[0] || null
}

export { pool }
