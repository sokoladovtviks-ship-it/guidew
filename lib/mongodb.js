import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')
const coursesPath = path.join(dataDir, 'courses.json')
const exercisesPath = path.join(dataDir, 'exercises.json')
const aboutPath = path.join(dataDir, 'about.json')

// Helper functions for courses
export async function getCourses() {
  try {
    const data = fs.readFileSync(coursesPath, 'utf8')
    const parsed = JSON.parse(data)
    return parsed.courses || []
  } catch (error) {
    return []
  }
}

export async function saveCourses(courses) {
  try {
    const data = { courses }
    fs.writeFileSync(coursesPath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error saving courses:', error)
  }
}

// Helper functions for exercises
export async function getExercises() {
  try {
    const data = fs.readFileSync(exercisesPath, 'utf8')
    const parsed = JSON.parse(data)
    return parsed.exercises || []
  } catch (error) {
    return []
  }
}

export async function saveExercises(exercises) {
  try {
    const data = { exercises }
    fs.writeFileSync(exercisesPath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error saving exercises:', error)
  }
}

// Helper functions for about
export async function getAbout() {
  try {
    const data = fs.readFileSync(aboutPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return {}
  }
}

export async function saveAbout(about) {
  try {
    fs.writeFileSync(aboutPath, JSON.stringify(about, null, 2))
  } catch (error) {
    console.error('Error saving about:', error)
  }
}
