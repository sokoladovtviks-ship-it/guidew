import './globals.css'
import Providers from '@/components/Providers'

export const metadata = {
  title: 'Мои заметки по программированию',
  description: 'Персональный сайт с заметками и объяснениями по программированию',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
