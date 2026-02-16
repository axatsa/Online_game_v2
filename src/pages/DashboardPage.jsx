import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useClassContext } from '../contexts/ClassContext'
import { Sparkles, Wrench, Gamepad2, BookOpen, Settings, ArrowRight } from 'lucide-react'
import ClassProfileModal from '../components/ClassProfileModal'
import { useState } from 'react'

const ENTRY_CARDS = [
    {
        title: 'AI Генераторы',
        desc: 'Математика, кроссворды, рабочие листы',
        icon: Sparkles,
        link: '/generators',
        color: 'var(--cp-blue)',
        bg: 'var(--cp-blue-light)'
    },
    {
        title: 'Инструменты',
        desc: 'Рулетка, битва знаний, таймер',
        icon: Wrench,
        link: '/tools',
        color: 'var(--cp-amber)',
        bg: 'var(--cp-amber-light)'
    },
    {
        title: 'Библиотека игр',
        desc: 'Образовательные игры для класса',
        icon: Gamepad2,
        link: '/games',
        color: 'var(--cp-purple)',
        bg: 'var(--cp-purple-light)'
    }
]

export default function DashboardPage() {
    const { user } = useAuth()
    const { classCtx, hasContext } = useClassContext()
    const [showProfile, setShowProfile] = useState(false)

    const firstName = user?.name?.split(' ')[0] || 'Учитель'

    return (
        <div className="page animate-fade">
            {/* Welcome */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                    Здравствуйте, {firstName} 👋
                </h1>
                <p className="text-secondary" style={{ marginTop: 4 }}>
                    Чем займемся сегодня?
                </p>
            </div>

            {/* AI Context Card - Hide for Admin */}
            {user?.role !== 'admin' && (
                <div className="card card-elevated" style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="flex items-center gap-md">
                        <div style={{
                            width: 48, height: 48, borderRadius: 12,
                            background: hasContext ? 'var(--cp-green-light)' : 'var(--cp-amber-light)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: hasContext ? 'var(--cp-green)' : 'var(--cp-amber)'
                        }}>
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <div className="font-bold" style={{ fontSize: '0.9375rem' }}>
                                {hasContext ? 'Контекст класса настроен' : 'Настройте контекст класса'}
                            </div>
                            <div className="text-sm text-secondary">
                                {hasContext
                                    ? `${classCtx.grade} • ${classCtx.topic} • ${classCtx.language === 'uz' ? 'Узб.' : 'Рус.'}`
                                    : 'AI будет генерировать материалы под ваш класс'
                                }
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowProfile(true)}>
                        <Settings size={16} /> {hasContext ? 'Изменить' : 'Настроить'}
                    </button>
                </div>
            )}

            {/* Entry Point Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                {ENTRY_CARDS.map(card => (
                    <Link key={card.link} to={card.link} className="card card-hover" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: 16,
                            background: card.bg, color: card.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: 16
                        }}>
                            <card.icon size={28} />
                        </div>
                        <h3 style={{ marginBottom: 8 }}>{card.title}</h3>
                        <p className="text-secondary text-sm">{card.desc}</p>
                        <div className="flex items-center gap-xs" style={{ marginTop: 16, color: card.color, fontWeight: 600, fontSize: '0.875rem' }}>
                            Перейти <ArrowRight size={16} />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Class Profile Modal */}
            {showProfile && <ClassProfileModal onClose={() => setShowProfile(false)} />}
        </div>
    )
}
