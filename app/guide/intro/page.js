import Navbar from '@/components/Navbar'
import InfoBox from '@/components/InfoBox'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function IntroPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Навигация */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/guide" className="hover:text-blue-600 transition-colors">
            Курс
          </Link>
          <span>/</span>
          <span className="text-gray-800">Введение</span>
        </div>

        {/* Заголовок */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
          Что такое программирование?
        </h1>

        <article className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            Привет! 👋 Рад, что ты здесь. Давай разберёмся, что такое программирование 
            и почему оно стоит того, чтобы его изучать.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">
            Простыми словами
          </h2>

          <p className="text-gray-700 mb-4">
            Программирование — это <strong>способ общения с компьютером</strong>. 
            Мы пишем инструкции на специальном языке, которые компьютер понимает и выполняет.
          </p>

          <div className="my-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              🧠 Представь это так
            </h3>
            <div className="grid sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white rounded-xl">
                <div className="text-3xl mb-2">👤</div>
                <p className="text-sm text-gray-600">Ты пишешь код</p>
              </div>
              <div className="p-4 bg-white rounded-xl">
                <div className="text-3xl mb-2">💻</div>
                <p className="text-sm text-gray-600">Компьютер читает</p>
              </div>
              <div className="p-4 bg-white rounded-xl">
                <div className="text-3xl mb-2">✨</div>
                <p className="text-sm text-gray-600">Магия происходит!</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">
            Зачем учить программирование?
          </h2>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100">
              <span className="text-2xl">💼</span>
              <div>
                <h4 className="font-semibold text-gray-800">Востребованная профессия</h4>
                <p className="text-gray-600 text-sm">IT-специалисты нужны везде и получают хорошую зарплату</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100">
              <span className="text-2xl">🛠️</span>
              <div>
                <h4 className="font-semibold text-gray-800">Создавай свои проекты</h4>
                <p className="text-gray-600 text-sm">Сайты, приложения, игры, боты — воплощай свои идеи</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100">
              <span className="text-2xl">🧩</span>
              <div>
                <h4 className="font-semibold text-gray-800">Развивай мышление</h4>
                <p className="text-gray-600 text-sm">Учишься решать проблемы и думать логически</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">
            Почему Python?
          </h2>

          <p className="text-gray-700 mb-4">
            Python — один из лучших языков для начинающих:
          </p>

          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Простой и понятный синтаксис (читается как обычный текст)</li>
            <li>Огромное сообщество и много материалов для обучения</li>
            <li>Используется везде: веб, данные, AI, автоматизация</li>
            <li>Быстрый старт — результат видно сразу</li>
          </ul>

          <InfoBox type="success" title="Отличный выбор!">
            Python — это язык, с которого начинали многие успешные разработчики. 
            Ты на правильном пути!
          </InfoBox>

          <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">
            Как я буду объяснять
          </h2>

          <p className="text-gray-700 mb-6">
            В этих заметках я стараюсь:
          </p>

          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">1</span>
              <span className="text-gray-700">Объяснять простым языком, без лишних терминов</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">2</span>
              <span className="text-gray-700">Показывать наглядные схемы и примеры</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">3</span>
              <span className="text-gray-700">Давать код, который можно сразу запустить</span>
            </li>
          </ul>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="font-semibold text-green-800 mb-2">Готов начать?</h3>
            <p className="text-green-700">
              Переходи к следующему уроку — там установим Python и напишем первую программу!
            </p>
          </div>
        </article>

        {/* Навигация */}
        <div className="flex justify-end items-center mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/guide/installation"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <span>Установка Python</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <footer className="py-8 px-4 border-t border-gray-100 mt-12">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2024 Мои заметки по программированию</p>
        </div>
      </footer>
    </div>
  )
}
