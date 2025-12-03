// Хранилище пользователей в JSON файле
import fs from 'fs'
import path from 'path'

const usersFilePath = path.join(process.cwd(), 'data', 'users.json')

function loadUsers() {
  try {
    if (fs.existsSync(usersFilePath)) {
      const data = fs.readFileSync(usersFilePath, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error)
  }
  return []
}

function saveUsers(users) {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2))
  } catch (error) {
    console.error('Ошибка сохранения пользователей:', error)
  }
}

export function getUsers() {
  return loadUsers()
}

export function addUser(user) {
  const users = loadUsers()
  users.push(user)
  saveUsers(users)
}

export function findUserByUsername(username) {
  const users = loadUsers()
  return users.find(u => u.username.toLowerCase() === username.toLowerCase())
}

export function findUserByCredentials(username, password) {
  const users = loadUsers()
  return users.find(u => 
    u.username.toLowerCase() === username.toLowerCase() && 
    u.password === password
  )
}
