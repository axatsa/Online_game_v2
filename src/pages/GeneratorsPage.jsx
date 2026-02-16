import { Link } from 'react-router-dom'
import { Calculator, Grid3X3, FileText, ArrowRight } from 'lucide-react'

const GENERATORS = [
    {
        id: 'math',
        title: 'Математика',
        desc: 'Примеры, уравнения, текстовые задачи',
        icon: Calculator,
        color: 'var(--cp-blue)',
        bg: 'var(--cp-blue-light)'
    },
    {
        id: 'crossword',
        title: 'Кроссворд',
        desc: 'Тематические кроссворды на RU/UZ',
        icon: Grid3X3,
        color: 'var(--cp-purple)',
        bg: 'var(--cp-purple-light)'
    }
]

export default function GeneratorsPage() {
    return (
        <div className="page animate-fade">
            <div style={{ marginBottom: 32 }}>
                <h1>AI Генераторы</h1>
                <p className="text-secondary" style={{ marginTop: 4 }}>
                    Создавайте материалы с помощью AI, адаптированные под ваш класс
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                {GENERATORS.map(gen => (
                    <Link key={gen.id} to={`/generator/${gen.id}`} className="card card-hover" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: 16,
                            background: gen.bg, color: gen.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: 16
                        }}>
                            <gen.icon size={28} />
                        </div>
                        <h3 style={{ marginBottom: 8 }}>{gen.title}</h3>
                        <p className="text-secondary text-sm">{gen.desc}</p>
                        <div className="flex items-center gap-xs" style={{ marginTop: 16, color: gen.color, fontWeight: 600, fontSize: '0.875rem' }}>
                            Создать <ArrowRight size={16} />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
