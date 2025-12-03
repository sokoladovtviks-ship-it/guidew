'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { Github, Mail, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/about')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
          Обо мне
        </h1>

        <article className="prose prose-lg max-w-none">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
            {/* Аватар */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {data.avatar}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-gray-800 mb-1">{data.name}</h2>
              <p className="text-gray-600">{data.subtitle}</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">
            {data.whyTitle}
          </h2>

          <p className="text-gray-700 mb-4">{data.whyText}</p>

          <p className="text-gray-700 mb-4">Здесь я:</p>

          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            {data.whatIDo?.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">
            Что изучаю
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {data.skills?.map((skill, i) => (
              <div key={i} className="p-4 bg-white rounded-xl border border-gray-100">
                <span className="text-2xl mb-2 block">{skill.icon}</span>
                <h4 className="font-semibold text-gray-800">{skill.title}</h4>
                <p className="text-sm text-gray-500">{skill.description}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">
            Связаться
          </h2>

          <div className="flex flex-wrap gap-4 mb-8">
            {data.contacts?.github && (
              <a 
                href={data.contacts.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Github className="w-5 h-5" />
                GitHub
              </a>
            )}
            {data.contacts?.email && (
              <a 
                href={`mailto:${data.contacts.email}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Email
              </a>
            )}
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
            <h3 className="text-xl font-bold mb-3">{data.ctaTitle}</h3>
            <p className="text-blue-100 mb-6">{data.ctaText}</p>
            <Link
              href="/guide"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Перейти к курсу
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </article>
      </main>

      <footer className="py-8 px-4 border-t border-gray-100 mt-12">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2024 Мои заметки по программированию</p>
        </div>
      </footer>
    </div>
  )
}
