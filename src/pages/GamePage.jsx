import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useClassContext } from '../contexts/ClassContext'

// Games
import BrainTugGame from '../games/BrainTug/BrainTugGame'
import MemoryMatrixGame from '../games/MemoryMatrix/MemoryMatrixGame'
import JeopardyGame from '../games/Jeopardy/JeopardyGame'
import JeopardySetup from '../games/Jeopardy/JeopardySetup'
import BalanceGame from '../games/Balance/BalanceGame'
import WordSearchGame from '../games/WordSearch/WordSearchGame'

const GAMES_META = {
    'brain-tug': { title: 'Битва знаний', component: BrainTugGame },
    'memory-matrix': { title: 'Memory Matrix', component: MemoryMatrixGame },
    'jeopardy': { title: 'Своя Игра', component: JeopardyGame, setup: JeopardySetup },
    'balance': { title: 'Весы', component: BalanceGame },
    'word-search': { title: 'Филворд', component: WordSearchGame },
}

export default function GamePage() {
    const { gameId } = useParams()
    const navigate = useNavigate()
    const { classCtx } = useClassContext()

    const [gameState, setGameState] = useState('setup') // setup, playing
    const [config, setConfig] = useState({
        // Common
        difficulty: 'medium',
        topic: classCtx.topic || 'Общий',

        // Brain Tug
        team1: 'Команда 1',
        team2: 'Команда 2',
        grade: classCtx.grade || 1,

        // Jeopardy
        team3: '',
        team4: '',
        teams: ['Команда 1', 'Команда 2'],

        // Memory Matrix
        theme: 'fruit',
        gridSize: 4, // calculated from difficulty

        // Word Search
        // ... (uses topic/difficulty)
    })

    const game = GAMES_META[gameId]

    if (!game) {
        return (
            <div className="page text-center" style={{ paddingTop: 80 }}>
                <h2>Игра не найдена</h2>
                <button className="btn btn-secondary" onClick={() => navigate('/games')}>Назад</button>
            </div>
        )
    }

    const GameComponent = game.component
    const SetupComponent = game.setup

    if (gameState === 'setup') {
        // Use custom setup if available (e.g. Jeopardy)
        if (SetupComponent) {
            return (
                <div className="page animate-fade">
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/games')} style={{ marginBottom: 24 }}>
                        <ArrowLeft size={16} /> Назад
                    </button>
                    <SetupComponent
                        config={config}
                        setConfig={setConfig}
                        onStart={() => setGameState('playing')}
                    />
                </div>
            )
        }

        // Generic / Specific Setup for other games
        return (
            <div className="page animate-fade" style={{ maxWidth: 800 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/games')} style={{ marginBottom: 24 }}>
                    <ArrowLeft size={16} /> Назад
                </button>

                <div className="card shadow-xl p-8 bg-white rounded-3xl border border-slate-100">
                    <h1 className="text-3xl font-extrabold text-center mb-8 text-slate-800">{game.title}</h1>

                    {gameId === 'brain-tug' && (
                        <>
                            <div className="flex gap-4 mb-6">
                                <div className="flex-1 p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
                                    <label className="label font-bold text-blue-800">Синяя команда</label>
                                    <input className="input input-bordered w-full" value={config.team1} onChange={e => setConfig({ ...config, team1: e.target.value })} />
                                </div>
                                <div className="flex-1 p-4 bg-red-50 rounded-xl border-2 border-red-100">
                                    <label className="label font-bold text-red-800">Красная команда</label>
                                    <input className="input input-bordered w-full" value={config.team2} onChange={e => setConfig({ ...config, team2: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-control mb-6">
                                <label className="label font-bold">Уровень класса (Сложность)</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[1, 2, 3, 4, 5, 6].map(g => (
                                        <button
                                            key={g}
                                            className={`btn ${config.grade === g ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => setConfig({ ...config, grade: g })}
                                        >
                                            {g} класс
                                        </button>
                                    ))}
                                </div>
                                <div className="w-full flex justify-between text-xs px-2 mt-2 font-bold text-slate-500">
                                </div>
                            </div>
                        </>
                    )}

                    {gameId === 'memory-matrix' && (
                        <>
                            <div className="form-control mb-6">
                                <label className="label font-bold">Тема карточек</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {['fruit', 'animal', 'emoji', 'sport'].map(t => (
                                        <button
                                            key={t}
                                            className={`btn ${config.theme === t ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => setConfig({ ...config, theme: t })}
                                        >
                                            {t === 'fruit' ? '🍎 Фрукты' : t === 'animal' ? '🐶 Животные' : t === 'emoji' ? '😎 Эмодзи' : '⚽ Спорт'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-control mb-6">
                                <label className="label font-bold">Сложность (Размер поля)</label>
                                <select className="select select-bordered w-full" value={config.difficulty} onChange={e => setConfig({ ...config, difficulty: e.target.value })}>
                                    <option value="easy">Легко (3x4)</option>
                                    <option value="medium">Средне (4x4)</option>
                                    <option value="hard">Сложно (5x4)</option>
                                    <option value="expert">Эксперт (6x5)</option>
                                </select>
                            </div>
                        </>
                    )}

                    {gameId === 'balance' && (
                        <div className="form-control mb-6">
                            <label className="label font-bold">Сложность примеров</label>
                            <div className="join w-full">
                                {['easy', 'medium', 'hard'].map(d => (
                                    <button
                                        key={d}
                                        className={`join-item btn flex-1 ${config.difficulty === d ? 'btn-primary' : ''}`}
                                        onClick={() => setConfig({ ...config, difficulty: d })}
                                    >
                                        {d === 'easy' ? 'Легко' : d === 'medium' ? 'Средне' : 'Сложно'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {gameId === 'word-search' && (
                        <>
                            <div className="form-control mb-6">
                                <label className="label font-bold">Тема слов</label>
                                <select className="select select-bordered" value={config.topic} onChange={e => setConfig({ ...config, topic: e.target.value })}>
                                    <option value="География">География</option>
                                    <option value="Школа">Школа</option>
                                    <option value="Животные">Животные</option>
                                    <option value="Еда">Еда</option>
                                    <option value="Космос">Космос</option>
                                </select>
                            </div>
                            <div className="form-control mb-6">
                                <label className="label font-bold">Сложность</label>
                                <div className="join w-full">
                                    {['easy', 'medium', 'hard'].map(d => (
                                        <button
                                            key={d}
                                            className={`join-item btn flex-1 ${config.difficulty === d ? 'btn-primary' : ''}`}
                                            onClick={() => setConfig({ ...config, difficulty: d })}
                                        >
                                            {d === 'easy' ? 'Легко' : d === 'medium' ? 'Средне' : 'Сложно'}
                                        </button>
                                    ))}
                                </div>
                                <label className="label">
                                    <span className="label-text-alt text-gray-500">
                                        {config.difficulty === 'easy' ? 'Только по горизонтали' :
                                            config.difficulty === 'medium' ? 'Горизонтально и вертикально' :
                                                'Во все стороны + диагонали'}
                                    </span>
                                </label>
                            </div>
                        </>
                    )}

                    <button className="btn btn-primary btn-lg w-full shadow-lg shadow-blue-500/30 mt-4" onClick={() => setGameState('playing')}>
                        Начать игру
                    </button>

                    {/* Common Footer */}
                    <div className="mt-4 text-center">
                        <div className="tooltip" data-tip="Правила игры будут здесь">
                            <button className="btn btn-sm btn-ghost gap-2 text-gray-400">
                                <span className="font-serif">i</span> Как играть?
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={{ minHeight: 'calc(100vh - 64px)', background: '#F8FAFC', padding: '40px 20px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <GameComponent
                    config={config}
                    onFinish={(res) => {
                        console.log('Game finished:', res)
                        setGameState('setup')
                    }}
                    onExit={() => setGameState('setup')}
                />
            </div>
        </div>
    )
}
