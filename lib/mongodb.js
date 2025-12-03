import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

// Helper function to get database
export async function getDb() {
  const client = await clientPromise
  return client.db('python_course')
}

// Helper functions for courses
export async function getCourses() {
  const db = await getDb()
  const data = await db.collection('courses').findOne({ _id: 'main' })
  return data?.courses || []
}

export async function saveCourses(courses) {
  const db = await getDb()
  await db.collection('courses').updateOne(
    { _id: 'main' },
    { $set: { courses } },
    { upsert: true }
  )
}

// Helper functions for exercises
export async function getExercises() {
  const db = await getDb()
  const data = await db.collection('exercises').findOne({ _id: 'main' })
  return data?.exercises || []
}

export async function saveExercises(exercises) {
  const db = await getDb()
  await db.collection('exercises').updateOne(
    { _id: 'main' },
    { $set: { exercises } },
    { upsert: true }
  )
}

// Helper functions for about
export async function getAbout() {
  const db = await getDb()
  const data = await db.collection('about').findOne({ _id: 'main' })
  return data?.about || {}
}

export async function saveAbout(about) {
  const db = await getDb()
  await db.collection('about').updateOne(
    { _id: 'main' },
    { $set: { about } },
    { upsert: true }
  )
}
