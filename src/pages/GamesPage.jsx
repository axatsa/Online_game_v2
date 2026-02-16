import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Star, Play } from 'lucide-react'

const GAMES_DATA = [
    { id: 'jeopardy', title: 'Своя Игра', desc: 'Командная викторина', category: 'Все', rating: 5.0, gradient: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)', coverUrl: '' },
    { id: 'balance', title: 'Весы', desc: 'Найди равновесие', category: 'Математика', rating: 4.7, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', coverUrl: '' },
    { id: 'word-search', title: 'Филворд', desc: 'Найди слова', category: 'Язык', rating: 4.4, gradient: 'linear-gradient(135deg, #10b981, #059669)', coverUrl: '' },
    { id: 'brain-tug', title: 'Битва знаний', desc: 'Математическая дуэль двух команд', category: 'Математика', rating: 4.8, gradient: 'linear-gradient(135deg, #2563EB, #1D4ED8)', coverUrl: '' },
    { id: 'memory-matrix', title: 'Memory Matrix', desc: 'Найди пары карточек', category: 'Логика', rating: 4.5, gradient: 'linear-gradient(135deg, #7C3AED, #6D28D9)', coverUrl: '' },
]

const CATEGORIES = ['Все', 'Математика', 'Логика', 'Язык', 'Наука']

export default function GamesPage() {
    const [filter, setFilter] = useState('Все')

    const filtered = filter === 'Все' ? GAMES_DATA : GAMES_DATA.filter(g => g.category === filter)

    return (
        <div className="page animate-fade">
            <div style={{ marginBottom: 24 }}>
                <h1>Библиотека игр</h1>
                <p className="text-secondary" style={{ marginTop: 4 }}>
                    Образовательные игры для вашего класса
                </p>
            </div>

            {/* Filter Pills */}
            <div className="filter-pills" style={{ marginBottom: 24 }}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        className={`filter-pill ${filter === cat ? 'active' : ''}`}
                        onClick={() => setFilter(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Games Grid */}
            <div className="game-grid">
                {filtered.map(game => (
                    <Link key={game.id} to={`/game/${game.id}`} className="card card-flush card-hover" style={{ textDecoration: 'none', color: 'inherit', overflow: 'hidden' }}>
                        <div style={{
                            height: 140,
                            background: game.coverUrl ? `url(${game.coverUrl}) center/cover` : game.gradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                        }}>
                            {!game.coverUrl && <Play size={48} color="white" />}
                        </div>
                        <div style={{ padding: 20 }}>
                            <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                                <span className="badge badge-primary">{game.category}</span>
                                <span className="flex items-center gap-xs text-sm" style={{ color: 'var(--cp-amber)' }}>
                                    <Star size={14} fill="currentColor" /> {game.rating}
                                </span>
                            </div>
                            <h3 style={{ marginBottom: 4 }}>{game.title}</h3>
                            <p className="text-secondary text-sm">{game.desc}</p>
                            <button className="btn btn-primary btn-sm btn-full" style={{ marginTop: 16 }}>
                                Играть
                            </button>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
