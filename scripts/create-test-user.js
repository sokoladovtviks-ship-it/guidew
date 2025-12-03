// Скрипт для создания тестового пользователя
// Запустить в консоли браузера на странице сайта

const testUser = {
  id: 'test-user-1',
  username: 'test',
  password: '1234',
  createdAt: new Date().toISOString(),
  progress: {}
}

// Получаем существующих пользователей
const existingUsers = JSON.parse(localStorage.getItem('users') || '[]')

// Проверяем, есть ли уже тестовый пользователь
if (!existingUsers.find(u => u.username === 'test')) {
  existingUsers.push(testUser)
  localStorage.setItem('users', JSON.stringify(existingUsers))
  console.log('✅ Тестовый пользователь создан!')
  console.log('Логин: test')
  console.log('Пароль: 1234')
} else {
  console.log('ℹ️ Тестовый пользователь уже существует')
  console.log('Логин: test')
  console.log('Пароль: 1234')
}

// Показываем всех пользователей
console.log('👥 Все пользователи:', existingUsers.map(u => ({ id: u.id, username: u.username })))
