import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useClassContext } from '../contexts/ClassContext'

// Games
import BrainTugGame from '../games/BrainTug/BrainTugGame'
import MemoryMatrixGame from '../games/MemoryMatrix/MemoryMatrixGame'
import JeopardyGame from '../games/Jeopardy/JeopardyGame'
import BalanceGame from '../games/Balance/BalanceGame'
import WordSearchGame from '../games/WordSearch/WordSearchGame'

const GAMES_META = {
    'brain-tug': { title: 'Битва знаний', component: BrainTugGame },
    'memory-matrix': { title: 'Memory Matrix', component: MemoryMatrixGame },
    'jeopardy': { title: 'Своя Игра', component: JeopardyGame },
    'balance': { title: 'Весы', component: BalanceGame },
    'word-search': { title: 'Филворд', component: WordSearchGame },
}

export default function GamePage() {
    const { gameId } = useParams()
    const navigate = useNavigate()
    const { classCtx } = useClassContext()

    const [gameState, setGameState] = useState('setup') // setup, playing
    const [config, setConfig] = useState({
        team1: 'Команда 1',
        team2: 'Команда 2',
        team3: '', // Optional
        team4: '', // Optional
        topic: classCtx.topic || 'Общий',
        difficulty: 'medium',
        // Memory Matrix specific
        gridSize: 4,
        totalPairs: 8,
        cols: 4,
        cards: ['🍎', '🍌', '🍇', '🍓', '🍒', '🥝', '🍍', '🥭', '🍎', '🍌', '🍇', '🍓', '🍒', '🥝', '🍍', '🥭']
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

    if (gameState === 'setup') {
        return (
            <div className="page animate-fade" style={{ maxWidth: 800 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/games')} style={{ marginBottom: 24 }}>
                    <ArrowLeft size={16} /> Назад
                </button>

                <div className="card">
                    <h1 className="text-center" style={{ marginBottom: 32 }}>{game.title}</h1>

                    {gameId === 'brain-tug' ? (
                        <div className="flex gap-md" style={{ marginBottom: 32 }}>
                            <div style={{ flex: 1, padding: 20, background: '#EFF6FF', borderRadius: 12, border: '2px solid #3B82F6' }}>
                                <h3 className="text-center" style={{ color: '#1D4ED8', marginBottom: 16 }}>Синяя команда</h3>
                                <div className="form-group">
                                    <input className="input" value={config.team1} onChange={e => setConfig({ ...config, team1: e.target.value })} style={{ textAlign: 'center' }} />
                                </div>
                            </div>
                            <div style={{ flex: 1, padding: 20, background: '#FEF2F2', borderRadius: 12, border: '2px solid #EF4444' }}>
                                <h3 className="text-center" style={{ color: '#B91C1C', marginBottom: 16 }}>Красная команда</h3>
                                <div className="form-group">
                                    <input className="input" value={config.team2} onChange={e => setConfig({ ...config, team2: e.target.value })} style={{ textAlign: 'center' }} />
                                </div>
                            </div>
                        </div>
                    ) : gameId === 'jeopardy' ? (
                        <div className="flex flex-col gap-m mb-xl">
                            <div className="grid grid-cols-2 gap-m">
                                <div className="form-group">
                                    <label className="form-label">Команда 1</label>
                                    <input className="input" value={config.team1} onChange={e => setConfig({ ...config, team1: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Команда 2</label>
                                    <input className="input" value={config.team2} onChange={e => setConfig({ ...config, team2: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Команда 3 (опционально)</label>
                                    <input className="input" value={config.team3} onChange={e => setConfig({ ...config, team3: e.target.value })} placeholder="Не играет" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Команда 4 (опционально)</label>
                                    <input className="input" value={config.team4} onChange={e => setConfig({ ...config, team4: e.target.value })} placeholder="Не играет" />
                                </div>
                            </div>
                            <div className="form-group mt-m">
                                <label className="form-label">Тема викторины</label>
                                <input className="input" value={config.topic} onChange={e => setConfig({ ...config, topic: e.target.value })} />
                                <p className="text-xs text-secondary mt-1">Пока используется демо-набор "Узбекистан"</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-m mb-xl">
                            <div className="form-group">
                                <label className="form-label">Тема игры</label>
                                <input className="input" value={config.topic} onChange={e => setConfig({ ...config, topic: e.target.value })} />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-md mb-xl">
                        <div style={{ flex: 1 }}>
                            <label className="form-label">Сложность</label>
                            <select className="select" value={config.difficulty} onChange={e => setConfig({ ...config, difficulty: e.target.value })}>
                                <option value="easy">Легко</option>
                                <option value="medium">Средне</option>
                                <option value="hard">Сложно</option>
                            </select>
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg btn-full" onClick={() => setGameState('playing')}>
                        Начать игру
                    </button>
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
