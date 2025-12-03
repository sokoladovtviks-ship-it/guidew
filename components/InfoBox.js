import { Info, AlertTriangle, Lightbulb, CheckCircle } from 'lucide-react'

export default function InfoBox({ type = 'info', title, children }) {
  const styles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Info,
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-700',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      titleColor: 'text-amber-700',
    },
    tip: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: Lightbulb,
      iconColor: 'text-green-500',
      titleColor: 'text-green-700',
    },
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
      titleColor: 'text-emerald-700',
    },
  }

  const style = styles[type] || styles.info
  const Icon = style.icon

  return (
    <div className={`${style.bg} ${style.border} border rounded-xl p-4 my-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${style.iconColor} flex-shrink-0 mt-0.5`} />
        <div>
          {title && (
            <h4 className={`font-semibold ${style.titleColor} mb-1`}>{title}</h4>
          )}
          <div className="text-gray-700 text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  )
}
