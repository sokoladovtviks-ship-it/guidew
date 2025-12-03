import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { ArrowRight, BookOpen, Code, Lightbulb, Rocket } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero секция */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Бейдж */}
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Rocket className="w-4 h-4" />
            Изучаю программирование
          </div>

          {/* Заголовок */}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Мои заметки по{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              программированию
            </span>
          </h1>

          {/* Описание */}
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Здесь я делюсь своим опытом изучения программирования — объясняю темы своими словами, 
            добавляю схемы и примеры кода для лучшего понимания.
          </p>

          {/* CTA кнопки */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/guide"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              Начать обучение
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-3.5 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Обо мне
            </Link>
          </div>
        </div>
      </section>

      {/* Особенности */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-12">
            Что здесь можно найти
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Карточка 1 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Понятные объяснения
              </h3>
              <p className="text-gray-600">
                Каждую тему я стараюсь объяснить простыми словами, как если бы рассказывал другу.
              </p>
            </div>

            {/* Карточка 2 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Lightbulb className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Схемы и диаграммы
              </h3>
              <p className="text-gray-600">
                Визуальные схемы помогают лучше понять сложные концепции и запомнить материал.
              </p>
            </div>

            {/* Карточка 3 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Code className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Примеры кода
              </h3>
              <p className="text-gray-600">
                Практические примеры кода, которые можно сразу попробовать и поэкспериментировать.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Футер */}
      <footer className="py-8 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2024 Мои заметки по программированию</p>
        </div>
      </footer>
    </div>
  )
}
