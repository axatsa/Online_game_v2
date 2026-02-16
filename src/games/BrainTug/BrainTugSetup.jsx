import { useState } from 'react'
import { Users, Swords, ArrowLeft, Zap, Plus, Minus, X, Divide } from 'lucide-react'

const TOPICS = [
    { value: 'math', label: 'Математика', icon: '🧮' },
    { value: 'logic', label: 'Логика', icon: '🧩' },
    { value: 'science', label: 'Наука', icon: '🔬' },
]

const MATH_OPS = [
    { value: 'add', label: 'Сложение', icon: <Plus size={16} /> },
    { value: 'sub', label: 'Вычитание', icon: <Minus size={16} /> },
    { value: 'mul', label: 'Умножение', icon: <X size={16} /> },
    { value: 'div', label: 'Деление', icon: <Divide size={16} /> },
]

export default function BrainTugSetup({ onStart, onExit }) {
    const [team1, setTeam1] = useState('')
    const [team2, setTeam2] = useState('')
    const [topic, setTopic] = useState('math')
    const [selectedOps, setSelectedOps] = useState(['add', 'sub']) // Default ops
    const [error, setError] = useState('')

    const toggleOp = (op) => {
        setSelectedOps(prev =>
            prev.includes(op)
                ? prev.filter(p => p !== op)
                : [...prev, op]
        )
    }

    const handleStart = () => {
        if (!team1.trim() || !team2.trim()) {
            setError('Введите названия обеих команд')
            return
        }
        if (topic === 'math' && selectedOps.length === 0) {
            setError('Выберите хотя бы одну операцию')
            return
        }
        onStart({
            team1: team1.trim(),
            team2: team2.trim(),
            topic,
            mathOps: topic === 'math' ? selectedOps : null
        })
    }

    return (
        <div className="bt-setup">
            <div className="bt-setup-card animate-slide-up">
                <button className="btn-ghost bt-back" onClick={onExit}>
                    <ArrowLeft size={18} /> Назад
                </button>

                <div className="bt-setup-header">
                    <div className="bt-setup-icon">
                        <Swords size={40} />
                    </div>
                    <h1>Brain Tug</h1>
                    <p>Подготовим команды к битве</p>
                </div>

                {error && <div className="bt-error animate-slide-down">{error}</div>}

                {/* Team Names */}
                <div className="bt-teams-row">
                    <div className="bt-team-input">
                        <div className="bt-team-label">
                            <div className="bt-team-dot bt-team-dot-1" />
                            Команда 1 (Синие)
                        </div>
                        <input
                            className="input"
                            placeholder="Название..."
                            value={team1}
                            onChange={e => { setTeam1(e.target.value); setError('') }}
                            maxLength={20}
                        />
                    </div>
                    <div className="bt-vs">VS</div>
                    <div className="bt-team-input">
                        <div className="bt-team-label">
                            <div className="bt-team-dot bt-team-dot-2" />
                            Команда 2 (Красные)
                        </div>
                        <input
                            className="input"
                            placeholder="Название..."
                            value={team2}
                            onChange={e => { setTeam2(e.target.value); setError('') }}
                            maxLength={20}
                        />
                    </div>
                </div>

                {/* Topic */}
                <div className="bt-section">
                    <h3>Тема</h3>
                    <div className="bt-topic-grid">
                        {TOPICS.map(t => (
                            <button
                                key={t.value}
                                className={`bt-topic-card ${topic === t.value ? 'active' : ''}`}
                                onClick={() => setTopic(t.value)}
                            >
                                <span className="bt-topic-icon">{t.icon}</span>
                                <span>{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Math Operations (Only for Math topic) */}
                {topic === 'math' && (
                    <div className="bt-section animate-slide-down">
                        <h3>Операции</h3>
                        <div className="bt-diff-row">
                            {MATH_OPS.map(op => (
                                <button
                                    key={op.value}
                                    className={`bt-diff-card ${selectedOps.includes(op.value) ? 'active' : ''}`}
                                    onClick={() => toggleOp(op.value)}
                                >
                                    <span className="bt-topic-icon" style={{ fontSize: '1.2rem' }}>{op.icon}</span>
                                    <span className="bt-diff-label">{op.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <button className="btn btn-primary btn-lg btn-full" onClick={handleStart}>
                    <Zap size={20} /> Начать битву!
                </button>
            </div>
        </div>
    )
}
