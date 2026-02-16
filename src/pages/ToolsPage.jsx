import { Link } from 'react-router-dom'
import { Disc3, Swords, Timer, ArrowRight } from 'lucide-react'

const TOOLS = [
    {
        id: 'roulette',
        title: 'Рулетка учеников',
        desc: 'Случайный выбор ученика для доски',
        icon: Disc3,
        color: 'var(--cp-amber)',
        bg: 'var(--cp-amber-light)'
    },
]

export default function ToolsPage() {
    return (
        <div className="page animate-fade">
            <div style={{ marginBottom: 32 }}>
                <h1>Инструменты класса</h1>
                <p className="text-secondary" style={{ marginTop: 4 }}>
                    Интерактивные инструменты для доски и уроков
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                {TOOLS.map(tool => (
                    <Link key={tool.id} to={`/tool/${tool.id}`} className="card card-hover" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: 16,
                            background: tool.bg, color: tool.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: 16
                        }}>
                            <tool.icon size={28} />
                        </div>
                        <h3 style={{ marginBottom: 8 }}>{tool.title}</h3>
                        <p className="text-secondary text-sm">{tool.desc}</p>
                        <div className="flex items-center gap-xs" style={{ marginTop: 16, color: tool.color, fontWeight: 600, fontSize: '0.875rem' }}>
                            Открыть <ArrowRight size={16} />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
