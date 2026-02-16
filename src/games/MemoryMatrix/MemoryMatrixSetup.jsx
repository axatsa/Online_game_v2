import { useState } from 'react'
import { Brain, ArrowLeft, Zap } from 'lucide-react'

const GRID_SIZES = [
    { value: '3x3', label: '3 × 3', cells: 9, desc: 'Лёгкий' },
    { value: '4x4', label: '4 × 4', cells: 16, desc: 'Средний' },
    { value: '5x5', label: '5 × 5', cells: 25, desc: 'Сложный' },
]

const CATEGORIES = [
    {
        value: 'emoji', label: 'Эмодзи', icon: '😊',
        items: ['🍎', '🍐', '🍋', '🍉', '🍊', '🫐', '🍑', '🍒', '🥝', '🍍', '🥭', '🍓', '🫒', '🥥', '🍈']
    },
    {
        value: 'flags', label: 'Флаги', icon: '🏳️',
        items: ['🇺🇿', '🇷🇺', '🇬🇧', '🇺🇸', '🇩🇪', '🇫🇷', '🇯🇵', '🇰🇷', '🇨🇳', '🇮🇹', '🇪🇸', '🇦🇺', '🇧🇷', '🇨🇦', '🇮🇳']
    },
    {
        value: 'animals', label: 'Животные', icon: '🐱',
        items: ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐮', '🐷', '🐸', '🐵', '🐔']
    },
    {
        value: 'science', label: 'Наука', icon: '🔬',
        items: ['⚛️', '🧬', '🔬', '🧪', '💊', '🧲', '🔭', '🌡️', '⚗️', '🧫', '🔋', '💡', '🛸', '🌍', '🪐']
    },
]

export default function MemoryMatrixSetup({ onStart, onExit }) {
    const [gridSize, setGridSize] = useState('4x4')
    const [category, setCategory] = useState('emoji')

    const handleStart = () => {
        const grid = GRID_SIZES.find(g => g.value === gridSize)
        const cat = CATEGORIES.find(c => c.value === category)
        const pairsNeeded = Math.floor(grid.cells / 2)

        // Shuffle and pick items for pairs
        const shuffled = [...cat.items].sort(() => Math.random() - 0.5)
        const picked = shuffled.slice(0, pairsNeeded)
        const cards = [...picked, ...picked].sort(() => Math.random() - 0.5)

        onStart({
            gridSize: gridSize,
            cols: parseInt(gridSize[0]),
            rows: parseInt(gridSize[2]),
            cards,
            category: cat.label,
            totalPairs: pairsNeeded,
        })
    }

    return (
        <div className="mm-setup">
            <div className="mm-setup-card animate-slide-up">
                <button className="btn-ghost bt-back" onClick={onExit}>
                    <ArrowLeft size={18} /> Назад
                </button>

                <div className="mm-setup-header">
                    <div className="mm-setup-icon">
                        <Brain size={40} />
                    </div>
                    <h1>Memory Matrix</h1>
                    <p>Найди все пары! Тренируй зрительную память</p>
                </div>

                {/* Grid Size */}
                <div className="bt-section">
                    <h3>Размер поля</h3>
                    <div className="bt-diff-row">
                        {GRID_SIZES.map(g => (
                            <button
                                key={g.value}
                                className={`bt-diff-card ${gridSize === g.value ? 'active' : ''}`}
                                onClick={() => setGridSize(g.value)}
                            >
                                <span className="bt-diff-label">{g.label}</span>
                                <span className="bt-diff-desc">{g.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category */}
                <div className="bt-section">
                    <h3>Категория карточек</h3>
                    <div className="bt-topic-grid">
                        {CATEGORIES.map(c => (
                            <button
                                key={c.value}
                                className={`bt-topic-card ${category === c.value ? 'active' : ''}`}
                                onClick={() => setCategory(c.value)}
                            >
                                <span className="bt-topic-icon">{c.icon}</span>
                                <span>{c.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <button className="btn btn-primary btn-lg btn-full" onClick={handleStart}>
                    <Zap size={20} /> Начать игру!
                </button>
            </div>
        </div>
    )
}
