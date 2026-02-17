import { useState, useEffect, useRef } from 'react'
import { TeamBlue, TeamRed } from './BrainTugAssets'
import { Clock, Check, X, ArrowLeft } from 'lucide-react'

/* =========================================
   HELPER: Generate Math/Logic/Science Question
   ========================================= */
/* =========================================
   HELPER: Generate Question based on Grade (1-6)
   ========================================= */
function generateQuestion(grade) {
    const id = Math.random()

    // Grade 1: Simple Addition/Subtraction (0-20)
    if (grade === 1) {
        const op = Math.random() > 0.5 ? '+' : '-'
        if (op === '+') {
            const a = Math.floor(Math.random() * 10) + 1
            const b = Math.floor(Math.random() * 10) + 1
            return { text: `${a} + ${b} = ?`, correct: a + b, id }
        } else {
            const a = Math.floor(Math.random() * 10) + 5
            const b = Math.floor(Math.random() * 5) + 1
            return { text: `${a} - ${b} = ?`, correct: a - b, id }
        }
    }

    // Grade 2: Add/Sub (0-100)
    if (grade === 2) {
        const op = Math.random() > 0.5 ? '+' : '-'
        const a = Math.floor(Math.random() * 40) + 10
        const b = Math.floor(Math.random() * 40) + 10
        if (op === '+') return { text: `${a} + ${b} = ?`, correct: a + b, id }
        // Ensure positive
        const big = Math.max(a, b), small = Math.min(a, b)
        return { text: `${big} - ${small} = ?`, correct: big - small, id }
    }

    // Grade 3: + Multiplication Table (1-10)
    if (grade === 3) {
        const type = Math.random()
        if (type < 0.4) { // Add/Sub
            const a = Math.floor(Math.random() * 80) + 10
            const b = Math.floor(Math.random() * 80) + 10
            return { text: `${a} + ${b} = ?`, correct: a + b, id }
        } else { // Mul
            const a = Math.floor(Math.random() * 9) + 2
            const b = Math.floor(Math.random() * 9) + 2
            return { text: `${a} × ${b} = ?`, correct: a * b, id }
        }
    }

    // Grade 4: + Division & logic
    if (grade === 4) {
        const type = Math.random()
        if (type < 0.3) { // Mul
            const a = Math.floor(Math.random() * 12) + 2
            const b = Math.floor(Math.random() * 12) + 2
            return { text: `${a} × ${b} = ?`, correct: a * b, id }
        } else if (type < 0.6) { // Div
            const b = Math.floor(Math.random() * 9) + 2
            const ans = Math.floor(Math.random() * 9) + 2
            return { text: `${b * ans} : ${b} = ?`, correct: ans, id }
        } else { // Logic
            const start = Math.floor(Math.random() * 20) + 1
            const step = Math.floor(Math.random() * 5) + 2
            return { text: `${start}, ${start + step}, ${start + step * 2}, ?`, correct: start + step * 3, id }
        }
    }

    // Grade 5-6: Harder Math + Science/General
    const subject = Math.random()
    if (subject < 0.7) { // Math
        const type = Math.random()
        if (type < 0.3) {
            const a = Math.floor(Math.random() * 20) + 10
            const b = Math.floor(Math.random() * 9) + 2
            return { text: `${a} × ${b} = ?`, correct: a * b, id }
        } else if (type < 0.6) {
            // Order of ops: 2 + 2 * 2
            const a = Math.floor(Math.random() * 5) + 2
            const b = Math.floor(Math.random() * 5) + 2
            const c = Math.floor(Math.random() * 5) + 2
            return { text: `${a} + ${b} × ${c} = ?`, correct: a + b * c, id }
        } else {
            // Square
            const a = Math.floor(Math.random() * 10) + 1
            return { text: `${a}² = ?`, correct: a * a, id }
        }
    } else { // General Knowledge
        const facts = [
            { q: '50% от 100?', a: 50 },
            { q: 'Углов у квадрата?', a: 4 },
            { q: 'Углов у треугольника?', a: 3 },
            { q: '1 час = ? мин', a: 60 },
            { q: '1 кг = ? гр', a: 1000 },
            { q: 'В сутках часов?', a: 24 },
            { q: 'Дней в году (обычном)?', a: 365 },
            { q: 'Какой месяц 1-й?', a: 1 },
            { q: 'Сколько материков?', a: 6 }
        ]
        const f = facts[Math.floor(Math.random() * facts.length)]
        return { text: f.q, correct: f.a, id }
    }
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
        const grade = config.grade || 1 // Default to Grade 1
        setP1Q(generateQuestion(grade))
        setP2Q(generateQuestion(grade))
    }, [config])

    // Generate new question on correct answer
    const nextQuestion = (isP1) => {
        const grade = config.grade || 1
        if (isP1) setP1Q(generateQuestion(grade))
        else setP2Q(generateQuestion(grade))
    }

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
            if (isP1) {
                setP1Score(s => s + 1)
                setRopePos(p => Math.max(p - 10, -100)) // Blue pulls Left (negative)
                setAnimState('pull-blue')
                nextQuestion(true)
                setP1Input('')
            } else {
                setP2Score(s => s + 1)
                setRopePos(p => Math.min(p + 10, 100)) // Red pulls Right (positive)
                setAnimState('pull-red')
                nextQuestion(false)
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
