import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import GameCard from '../components/GameCard'

const GAMES_DATA = [
    {
        id: 'brain-tug',
        title: 'Битва Знаний',
        desc: 'Эпическое перетягивание каната! Команды решают примеры на скорость.',
        category: 'Математика',
        rating: 4.9,
        gradient: 'linear-gradient(135deg, #ef4444, #991b1b)',
        coverUrl: '/game-covers/brain-tug.png',
        difficulty: 'Любой'
    },
    {
        id: 'jeopardy',
        title: 'Своя Игра',
        desc: 'Классическая викторина. Выбирайте категории и сложность вопросов.',
        category: 'Все',
        rating: 5.0,
        gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        coverUrl: '/game-covers/jeopardy.png',
        difficulty: 'Сложный'
    },
    {
        id: 'memory-matrix',
        title: 'Memory Matrix',
        desc: 'Тренировка визуальной памяти. Запомните расположение плиток.',
        category: 'Логика',
        rating: 4.7,
        gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
        coverUrl: '/game-covers/memory-matrix.png',
        difficulty: 'Хардкор'
    },
    {
        id: 'balance',
        title: 'Весы',
        desc: 'Уравновесьте чаши весов, решая математические уравнения.',
        category: 'Математика',
        rating: 4.6,
        gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
        coverUrl: '/game-covers/balance.png',
        difficulty: 'Средний'
    },
    {
        id: 'word-search',
        title: 'Филворд',
        desc: 'Найдите спрятанные слова в сетке букв. Расширяем словарный запас.',
        category: 'Язык',
        rating: 4.5,
        gradient: 'linear-gradient(135deg, #10b981, #059669)',
        coverUrl: '/game-covers/word-search.png',
        difficulty: 'Легкий'
    },
]

const CATEGORIES = ['Все', 'Математика', 'Логика', 'Язык', 'Наука']

export default function GamesPage() {
    const [filter, setFilter] = useState('Все')

    const filtered = filter === 'Все' ? GAMES_DATA : GAMES_DATA.filter(g => g.category === filter)

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Header */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Библиотека Игр</h1>
                <p className="text-slate-500 max-w-2xl text-sm lg:text-base">
                    Интерактивные игры для вовлечения всего класса. Запускайте прямо на доске.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`
                            px-4 py-2 rounded-full text-sm font-medium transition-all
                            ${filter === cat
                                ? 'bg-slate-900 text-white shadow-md transform scale-105'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}
                        `}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(game => (
                        <GameCard key={game.id} game={game} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 border-dashed">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Sparkles size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">Игр пока нет</h3>
                    <p className="text-slate-500">Попробуйте выбрать другую категорию</p>
                </div>
            )}
        </div>
    )
}
