import Link from 'next/link'
import { ArrowUpRight, Compass, Video, Sparkles, Smartphone, LucideIcon } from 'lucide-react'

export interface ServicePillar {
  id: string
  number: string
  title: string
  subtitle: string
  description: string
  icon: 'strategy' | 'production' | 'event' | 'short-form'
  deliverables: string[]
  approach: string
}

const ICON_MAP: Record<string, LucideIcon> = {
  strategy: Compass,
  production: Video,
  event: Sparkles,
  'short-form': Smartphone,
}

interface ServiceCardProps {
  service: ServicePillar
}

export function ServiceCard({ service }: ServiceCardProps) {
  const IconComponent = ICON_MAP[service.icon] || Compass

  return (
    <div className="group relative p-8 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-all duration-500 hover:shadow-2xl flex flex-col justify-between">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-xl bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-neutral-950 transition-all duration-300">
            <IconComponent className="w-6 h-6" />
          </div>
          <span className="text-sm font-mono font-bold text-neutral-600 group-hover:text-amber-400 transition-colors">
            {service.number}
          </span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors">
            {service.title}
          </h3>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/90">
            {service.subtitle}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-neutral-400 leading-relaxed">
          {service.description}
        </p>

        {/* Approach */}
        <div className="pt-2 border-t border-neutral-800/80">
          <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
            Strategic Approach
          </h4>
          <p className="text-xs text-neutral-400 italic">
            &ldquo;{service.approach}&rdquo;
          </p>
        </div>

        {/* Deliverables Pills */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Key Deliverables
          </h4>
          <div className="flex flex-wrap gap-2">
            {service.deliverables.map((item) => (
              <span
                key={item}
                className="text-xs bg-neutral-800/90 text-neutral-300 px-3 py-1 rounded-md border border-neutral-700/50"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-6 mt-6 border-t border-neutral-800/60 relative z-10 flex items-center justify-between">
        <Link
          href="/contact"
          className="text-xs font-semibold uppercase tracking-wider text-white group-hover:text-amber-400 inline-flex items-center gap-1.5 transition-colors"
        >
          Discuss Capability <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  )
}
