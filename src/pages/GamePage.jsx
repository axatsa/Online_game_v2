import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import BrainTugGame from '../games/BrainTug/BrainTugGame'
import { useState } from 'react'
import { useClassContext } from '../contexts/ClassContext'

export default function GamePage() {
    const { gameId } = useParams()
    const navigate = useNavigate()
    const { classCtx } = useClassContext()

    // Game config state
    const [gameState, setGameState] = useState('setup') // setup, playing, result
    const [config, setConfig] = useState({
        team1: 'Синие',
        team2: 'Красные',
        topic: 'math',
        difficulty: 'medium'
    })

    if (gameId !== 'brain-tug') {
        return (
            <div className="page text-center" style={{ paddingTop: 80 }}>
                <h2>Игра: {gameId}</h2>
                <p className="text-secondary" style={{ marginTop: 8, marginBottom: 24 }}>
                    Эта игра скоро будет доступна
                </p>
                <button className="btn btn-secondary" onClick={() => navigate('/games')}>
                    <ArrowLeft size={16} /> Назад к играм
                </button>
            </div>
        )
    }

    // Brain Tug Specific Logic
    if (gameState === 'setup') {
        return (
            <div className="page animate-fade" style={{ maxWidth: 600 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/games')} style={{ marginBottom: 24 }}>
                    <ArrowLeft size={16} /> Назад
                </button>

                <div className="card" style={{ maxWidth: 800 }}>
                    <h1 className="text-center" style={{ marginBottom: 32 }}>Битва знаний</h1>

                    <div className="flex gap-md" style={{ marginBottom: 32 }}>
                        {/* Blue Team */}
                        <div style={{ flex: 1, padding: 20, background: '#EFF6FF', borderRadius: 12, border: '2px solid #3B82F6' }}>
                            <h3 className="text-center" style={{ color: '#1D4ED8', marginBottom: 16 }}>Синяя команда</h3>
                            <div className="form-group">
                                <label className="form-label">Название</label>
                                <input
                                    className="input"
                                    value={config.team1}
                                    onChange={e => setConfig({ ...config, team1: e.target.value })}
                                    style={{ textAlign: 'center', fontWeight: 'bold', color: '#1D4ED8' }}
                                />
                            </div>
                        </div>

                        {/* Red Team */}
                        <div style={{ flex: 1, padding: 20, background: '#FEF2F2', borderRadius: 12, border: '2px solid #EF4444' }}>
                            <h3 className="text-center" style={{ color: '#B91C1C', marginBottom: 16 }}>Красная команда</h3>
                            <div className="form-group">
                                <label className="form-label">Название</label>
                                <input
                                    className="input"
                                    value={config.team2}
                                    onChange={e => setConfig({ ...config, team2: e.target.value })}
                                    style={{ textAlign: 'center', fontWeight: 'bold', color: '#B91C1C' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-md" style={{ marginBottom: 32 }}>
                        <div style={{ flex: 1 }}>
                            <label className="form-label">Сложность</label>
                            <div className="flex gap-xs">
                                {['easy', 'medium', 'hard'].map(d => (
                                    <button key={d}
                                        className={`btn btn-sm ${config.difficulty === d ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setConfig({ ...config, difficulty: d })}
                                        style={{ flex: 1, textTransform: 'capitalize' }}
                                    >
                                        {d === 'easy' ? 'Легко' : d === 'medium' ? 'Средне' : 'Сложно'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="form-label">Предмет</label>
                            <select className="select" value={config.topic} onChange={e => setConfig({ ...config, topic: e.target.value })}>
                                <option value="math">Математика</option>
                                <option value="logic">Логика</option>
                                <option value="science">Окружающий мир</option>
                            </select>
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg btn-full" onClick={() => setGameState('playing')} style={{ height: 56, fontSize: 18 }}>
                        Начать битву
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div style={{ height: 'calc(100vh - 64px)', background: '#F0F9FF', position: 'relative' }}>
            <BrainTugGame
                config={config}
                onFinish={(res) => {
                    console.log(res)
                    alert(`Победила команда ${res.winner === 1 ? config.team1 : config.team2}!`)
                    setGameState('setup')
                }}
                onExit={() => setGameState('setup')}
            />
        </div>
    )
}
