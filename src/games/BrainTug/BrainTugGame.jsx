import { useState, useEffect, useRef } from 'react'
import { TeamBlue, TeamRed } from './BrainTugAssets'
import { Clock, Check, X, ArrowLeft } from 'lucide-react'

/* =========================================
   HELPER: Generate Math/Logic/Science Question
   ========================================= */
function generateQuestion(topic, ops, difficulty = 'medium') {
    const max = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 50 : 100

    // Logic Questions (Sequences)
    if (topic === 'logic') {
        const type = Math.random() > 0.5 ? 'seq' : 'pattern'
        if (type === 'seq') {
            const start = Math.floor(Math.random() * max / 2) + 1
            const step = Math.floor(Math.random() * 5) + 1
            return { text: `${start}, ${start + step}, ${start + step * 2}, ?`, correct: start + step * 3, id: Math.random() }
        } else {
            const a = Math.floor(Math.random() * (max / 5)) + 1
            return { text: `${a} -> ${a * 2}, ${a + 1} -> ?`, correct: (a + 1) * 2, id: Math.random() }
        }
    }

    // Science Questions (Facts with numeric answers) - Static for now, could be expanded
    if (topic === 'science') {
        const facts = [
            { q: 'Ног у паука?', a: 8 },
            { q: 'Ног у насекомого?', a: 6 },
            { q: 'Планет в системе?', a: 8 },
            { q: 'Кипение воды (°C)?', a: 100 },
            { q: 'Зубов у человека?', a: 32 },
            { q: 'Пальцев на руке?', a: 5 },
            { q: 'Цветов радуги?', a: 7 },
            { q: 'Колес у машины?', a: 4 },
            { q: 'Литри в 1 кг воды?', a: 1 },
            { q: 'Глаз у циклопа?', a: 1 }
        ]
        const f = facts[Math.floor(Math.random() * facts.length)]
        return { text: f.q, correct: f.a, id: Math.random() }
    }

    // Math (Default)
    const op = (ops && ops.length > 0) ? ops[Math.floor(Math.random() * ops.length)] : 'add'
    let a, b, ans, sign

    switch (op) {
        case 'add':
            a = Math.floor(Math.random() * max) + 1
            b = Math.floor(Math.random() * max) + 1
            ans = a + b
            sign = '+'
            break
        case 'sub':
            a = Math.floor(Math.random() * max) + 5
            b = Math.floor(Math.random() * a) + 1 // Ensure positive result
            ans = a - b
            sign = '-'
            break
        case 'mul':
            const mMax = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 12
            a = Math.floor(Math.random() * mMax) + 1
            b = Math.floor(Math.random() * mMax) + 1
            ans = a * b
            sign = '×'
            break
        case 'div':
            b = Math.floor(Math.random() * (difficulty === 'easy' ? 5 : 9)) + 2
            ans = Math.floor(Math.random() * (difficulty === 'easy' ? 5 : 10)) + 1
            a = b * ans
            sign = '÷'
            break
        default:
            a = 1; b = 1; ans = 2; sign = '+'
    }
    return { text: `${a} ${sign} ${b} = ?`, correct: ans, id: Math.random() }
}

/* =========================================
   COMPONENT: Player Panel
   ========================================= */
const PlayerPanel = ({ teamName, color, score, question, input, onInput, onClear, onSubmit, isBlocked }) => {
    const isBlue = color === 'blue'
    const theme = isBlue ? {
        bg: '#3B82F6',
        soft: '#EFF6FF',
        border: '#BFDBFE',
        btn: '#2563EB'
    } : {
        bg: '#EF4444',
        soft: '#FEF2F2',
        border: '#FECACA',
        btn: '#DC2626'
    }

    return (
        <div className={`bt-player-card ${isBlue ? 'blue-side' : 'red-side'}`}>
            {/* Header */}
            <div className="bt-p-header" style={{ background: theme.bg }}>
                <span className="bt-p-name">{teamName}</span>
                <div className="bt-p-score-badge">{score}</div>
            </div>

            {/* Question */}
            <div className="bt-p-question-box" style={{ background: theme.soft }}>
                {question.text}
            </div>

            {/* Input Display */}
            <div className="bt-p-input-display">
                {input || <span className="placeholder">0</span>}
            </div>

            {/* NumPad */}
            <div className="bt-numpad-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <button key={n} className="bt-num-btn" onClick={() => onInput(n)}>{n}</button>
                ))}

                <button className="bt-action-btn clear" onClick={onClear} style={{ background: theme.bg }}>
                    <X size={24} />
                </button>

                <button className="bt-num-btn" onClick={() => onInput(0)}>0</button>

                <button className="bt-action-btn submit" onClick={onSubmit} style={{ background: theme.bg }}>
                    <Check size={24} />
                </button>
            </div>
        </div>
    )
}

/* =========================================
   MAIN GAME COMPONENT
   ========================================= */
export default function BrainTugGame({ config, onFinish, onExit }) {
    // Game State
    const [ropePos, setRopePos] = useState(0) // -100 (Red wins) to +100 (Blue wins)
    const [time, setTime] = useState(0)
    const [winner, setWinner] = useState(null)

    // Player 1 (Blue) State
    const [p1Score, setP1Score] = useState(0)
    const [p1Q, setP1Q] = useState(null)
    const [p1Input, setP1Input] = useState('')
    const [p1Shake, setP1Shake] = useState(false) // Error shake

    // Player 2 (Red) State
    const [p2Score, setP2Score] = useState(0)
    const [p2Q, setP2Q] = useState(null)
    const [p2Input, setP2Input] = useState('')
    const [p2Shake, setP2Shake] = useState(false)

    // Animation Refs
    const [animState, setAnimState] = useState('idle') // idle, pull-blue, pull-red

    // Init Questions
    useEffect(() => {
        const ops = config.mathOps || ['add']
        const topic = config.topic || 'math'
        const diff = config.difficulty || 'medium'
        setP1Q(generateQuestion(topic, ops, diff))
        setP2Q(generateQuestion(topic, ops, diff))
    }, [config])

    // Timer
    useEffect(() => {
        if (winner) return
        const t = setInterval(() => setTime(s => s + 1), 1000)
        return () => clearInterval(t)
    }, [winner])

    // Check Win
    useEffect(() => {
        if (Math.abs(ropePos) >= 100) {
            handleWin(ropePos > 0 ? 2 : 1) // Positive = Red, Negative = Blue
        }
    }, [ropePos])

    const handleWin = (teamId) => {
        if (winner) return
        setWinner(teamId)
        setTimeout(() => {
            onFinish({
                winner: teamId,
                team1XP: p1Score * 10 + (teamId === 1 ? 50 : 0),
                team2XP: p2Score * 10 + (teamId === 2 ? 50 : 0),
                ropePos,
                time
            })
        }, 1000)
    }

    // --- Handlers ---
    const handleInput = (player, val) => {
        if (winner) return
        if (player === 1) {
            if (p1Input.length < 3) setP1Input(prev => prev + val)
        } else {
            if (p2Input.length < 3) setP2Input(prev => prev + val)
        }
    }

    const handleClear = (player) => {
        if (player === 1) setP1Input('')
        else setP2Input('')
    }

    const handleSubmit = (player) => {
        if (winner) return
        const isP1 = player === 1
        const q = isP1 ? p1Q : p2Q
        const input = isP1 ? p1Input : p2Input
        const val = parseInt(input, 10)

        if (isNaN(val)) return

        if (val === q.correct) {
            // Correct!
            const topic = config.topic || 'math'
            const ops = config.mathOps || ['add']
            const diff = config.difficulty || 'medium'

            if (isP1) {
                setP1Score(s => s + 1)
                setRopePos(p => Math.max(p - 10, -100)) // Blue pulls Left (negative)
                setAnimState('pull-blue')
                setP1Q(generateQuestion(topic, ops, diff))
                setP1Input('')
            } else {
                setP2Score(s => s + 1)
                setRopePos(p => Math.min(p + 10, 100)) // Red pulls Right (positive)
                setAnimState('pull-red')
                setP2Q(generateQuestion(topic, ops, diff))
                setP2Input('')
            }

            // Reset animation
            setTimeout(() => setAnimState('idle'), 500)
        } else {
            // Wrong!
            if (isP1) {
                setP1Shake(true); setTimeout(() => setP1Shake(false), 500)
                setP1Input('')
            } else {
                setP2Shake(true); setTimeout(() => setP2Shake(false), 500)
                setP2Input('')
            }
        }
    }

    const formatTime = (s) => {
        const m = Math.floor(s / 60)
        const sec = s % 60
        return `${m}:${sec < 10 ? '0' : ''}${sec}`
    }

    if (!p1Q || !p2Q) return null

    return (
        <div className="bt-split-layout">
            {/* Back Button */}
            <button className="bt-back-btn" onClick={onExit} title="Выйти в меню">
                <ArrowLeft size={24} />
            </button>

            {/* Player 1 Panel */}
            <div className={`bt-panel-wrapper ${p1Shake ? 'shake' : ''}`}>
                <PlayerPanel
                    teamName={config.team1}
                    color="blue"
                    score={p1Score}
                    question={p1Q}
                    input={p1Input}
                    onInput={(v) => handleInput(1, v)}
                    onClear={() => handleClear(1)}
                    onSubmit={() => handleSubmit(1)}
                />
            </div>

            {/* Center Scene */}
            <div className="bt-center-stage">
                {/* Timer Bar */}
                <div className="bt-timer-bar">
                    <div className="bt-timer-pill">
                        <div className="bt-p1-mini-score">
                            <span>{config.team1}</span>
                            <strong>{p1Score}</strong>
                        </div>
                        <div className="bt-timer-val">
                            <Clock size={16} /> {formatTime(time)}
                        </div>
                        <div className="bt-p2-mini-score">
                            <strong>{p2Score}</strong>
                            <span>{config.team2}</span>
                        </div>
                    </div>
                </div>

                {/* Rope Scene */}
                <div className="bt-scene-box">
                    <div className="bt-center-dashed" />
                    <div className="bt-rope-group" style={{ transform: `translateX(${ropePos * 1.5}px)` }}>
                        <TeamBlue className={`bt-team-svg-blue ${animState === 'pull-blue' ? 'pulling' : ''}`} />
                        <div className="bt-rope-connector"><div className="bt-rope-marker" /></div>
                        <TeamRed className={`bt-team-svg-red ${animState === 'pull-red' ? 'pulling' : ''}`} />
                    </div>
                </div>
            </div>

            {/* Player 2 Panel */}
            <div className={`bt-panel-wrapper ${p2Shake ? 'shake' : ''}`}>
                <PlayerPanel
                    teamName={config.team2}
                    color="red"
                    score={p2Score}
                    question={p2Q}
                    input={p2Input}
                    onInput={(v) => handleInput(2, v)}
                    onClear={() => handleClear(2)}
                    onSubmit={() => handleSubmit(2)}
                />
            </div>
        </div>
    )
}
