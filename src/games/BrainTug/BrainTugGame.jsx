import { useState, useEffect } from 'react'
import { Clock, Check, X, ArrowLeft, RotateCcw } from 'lucide-react'

/* =========================================
   HELPER: Generate Question
   ========================================= */
function generateQuestion(grade) {
    const id = Math.random()

    // Simplified for brevity, keeping core logic
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
    // Default fallback
    const a = Math.floor(Math.random() * 20) + 1
    const b = Math.floor(Math.random() * 9) + 1
    return { text: `${a} + ${b} = ?`, correct: a + b, id }
}

/* =========================================
   COMPONENT: Player Calculator Panel
   ========================================= */
const PlayerPanel = ({ teamName, color, score, question, input, onInput, onClear, onSubmit, shake }) => {
    const isBlue = color === 'blue'

    // Theme configurations
    const bgClass = isBlue ? 'bg-blue-600' : 'bg-red-600'
    const btnClass = isBlue
        ? 'bg-blue-500 hover:bg-blue-400 active:bg-blue-700 text-white'
        : 'bg-red-500 hover:bg-red-400 active:bg-red-700 text-white'
    const actionBtnClass = isBlue ? 'bg-blue-800 text-blue-200' : 'bg-red-800 text-red-200'

    return (
        <div className={`
             flex flex-col h-full w-full p-4 relative overflow-hidden transition-transform duration-100 mb-safe
             ${shake ? 'translate-x-2' : ''} ${bgClass}
        `}>
            {/* Header / Score */}
            <div className="flex justify-between items-center mb-6 text-white">
                <h2 className="text-xl font-bold truncate max-w-[70%]">{teamName}</h2>
                <div className="text-4xl font-black bg-black/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                    {score}
                </div>
            </div>

            {/* Question Display */}
            <div className="flex-1 flex flex-col items-center justify-center mb-6">
                <div className="text-6xl font-black text-white drop-shadow-md mb-4 text-center">
                    {question?.text}
                </div>
                {/* Input Display */}
                <div className={`
                    h-20 w-full bg-black/20 rounded-2xl flex items-center justify-center
                    text-5xl font-mono text-white tracking-widest border-2 border-white/10
                `}>
                    {input || <span className="opacity-30">0</span>}
                </div>
            </div>

            {/* Calculator Grid */}
            <div className="grid grid-cols-3 gap-3 h-1/2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                        key={num}
                        onClick={() => onInput(num)}
                        className={`
                            rounded-xl text-3xl font-bold shadow-sm transition-all
                            active:scale-95 touch-manipulation
                            ${btnClass}
                        `}
                    >
                        {num}
                    </button>
                ))}

                {/* Bottom Row */}
                <button
                    onClick={onClear}
                    className={`rounded-xl flex items-center justify-center active:scale-95 transition-all ${actionBtnClass}`}
                >
                    <X size={32} />
                </button>

                <button
                    onClick={() => onInput(0)}
                    className={`
                        rounded-xl text-3xl font-bold shadow-sm transition-all
                        active:scale-95
                        ${btnClass}
                    `}
                >
                    0
                </button>

                <button
                    onClick={onSubmit}
                    className="bg-green-500 hover:bg-green-400 active:bg-green-600 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
                >
                    <Check size={40} strokeWidth={3} />
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
    const [ropePos, setRopePos] = useState(0)
    const [time, setTime] = useState(0)
    const [winner, setWinner] = useState(null)

    // Player States
    const [p1State, setP1] = useState({ score: 0, q: null, input: '', shake: false })
    const [p2State, setP2] = useState({ score: 0, q: null, input: '', shake: false })

    // Init
    useEffect(() => {
        const grade = config.grade || 1
        setP1(prev => ({ ...prev, q: generateQuestion(grade) }))
        setP2(prev => ({ ...prev, q: generateQuestion(grade) }))

        const timer = setInterval(() => {
            if (!winner) setTime(t => t + 1)
        }, 1000)
        return () => clearInterval(timer)
    }, [config, winner])

    // Check Win
    useEffect(() => {
        if (Math.abs(ropePos) >= 100 && !winner) {
            handleWin(ropePos < 0 ? 1 : 2) // -100 is Blue (Left), +100 is Red (Right)
        }
    }, [ropePos])

    const handleWin = (teamId) => {
        setWinner(teamId)
        setTimeout(() => {
            onFinish({
                winner: teamId,
                team1XP: p1State.score * 10,
                team2XP: p2State.score * 10
            })
        }, 1500)
    }

    const handleInput = (player, val) => {
        if (winner) return
        const minput = (input) => input.length < 3 ? input + val : input

        if (player === 1) setP1(p => ({ ...p, input: minput(p.input) }))
        else setP2(p => ({ ...p, input: minput(p.input) }))
    }

    const handleAction = (player, action) => {
        if (winner) return
        const setter = player === 1 ? setP1 : setP2
        const state = player === 1 ? p1State : p2State

        if (action === 'clear') {
            setter(p => ({ ...p, input: '' }))
            return
        }

        if (action === 'submit') {
            const val = parseInt(state.input, 10)
            if (isNaN(val)) return

            if (val === state.q.correct) {
                // Correct
                setter(p => ({
                    ...p,
                    score: p.score + 1,
                    input: '',
                    q: generateQuestion(config.grade || 1)
                }))
                setRopePos(pos => player === 1 ? pos - 10 : pos + 10) // P1 pulls left (-), P2 pulls right (+)
            } else {
                // Wrong
                setter(p => ({ ...p, input: '', shake: true }))
                setTimeout(() => setter(p => ({ ...p, shake: false })), 500)
            }
        }
    }

    const formatTime = (s) => {
        const m = Math.floor(s / 60)
        const sec = s % 60
        return `${m}:${sec < 10 ? '0' : ''}${sec}`
    }

    if (!p1State.q || !p2State.q) return null

    return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex overflow-hidden">
            {/* Left Panel (Blue) */}
            <div className="w-1/4 min-w-[300px] border-r border-slate-800 z-10">
                <PlayerPanel
                    teamName={config.team1}
                    color="blue"
                    {...p1State}
                    question={p1State.q}
                    onInput={(v) => handleInput(1, v)}
                    onClear={() => handleAction(1, 'clear')}
                    onSubmit={() => handleAction(1, 'submit')}
                />
            </div>

            {/* Center Stage */}
            <div className="flex-1 relative flex flex-col items-center justify-center bg-slate-900 overflow-hidden">
                {/* Top Bar */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20">
                    <button onClick={onExit} className="p-3 bg-white/10 text-white hover:bg-white/20 rounded-full backdrop-blur transition">
                        <ArrowLeft size={24} />
                    </button>

                    <div className="flex flex-col items-center">
                        <div className="px-6 py-2 bg-slate-800 rounded-full border border-slate-700 text-slate-300 font-mono text-xl flex items-center gap-2 shadow-lg">
                            <Clock size={20} />
                            {formatTime(time)}
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="p-3 bg-white/10 text-white hover:bg-white/20 rounded-full backdrop-blur transition"
                    >
                        <RotateCcw size={24} />
                    </button>
                </div>

                {/* Rope & Visuals */}
                <div className="w-full relative flex items-center justify-center">
                    {/* Rope Line */}
                    <div className="absolute h-2 bg-slate-700 w-full top-1/2 -translate-y-1/2 left-0 z-0"></div>

                    {/* Center Marker */}
                    <div className="absolute h-full w-0.5 bg-white/20 left-1/2 top-0 z-0 border-l border-dashed border-white/30"></div>

                    {/* The Image (Pulling) */}
                    <div
                        className="relative z-10 transition-transform duration-500 ease-out will-change-transform"
                        style={{ transform: `translateX(${ropePos * 3}px)` }}
                    >
                        <img
                            src="/images/tug-of-war-gameplay.png"
                            alt="Tug of War"
                            className="max-w-[600px] drop-shadow-2xl"
                        />
                    </div>
                </div>

                {/* Footer/Hint */}
                <div className="absolute bottom-8 text-slate-500 text-sm">
                    Решайте быстрее соперника, чтобы перетянуть канат!
                </div>
            </div>

            {/* Right Panel (Red) */}
            <div className="w-1/4 min-w-[300px] border-l border-slate-800 z-10">
                <PlayerPanel
                    teamName={config.team2}
                    color="red"
                    {...p2State}
                    question={p2State.q}
                    onInput={(v) => handleInput(2, v)}
                    onClear={() => handleAction(2, 'clear')}
                    onSubmit={() => handleAction(2, 'submit')}
                />
            </div>

            {/* Winner Overlay */}
            {winner && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center animate-fade-in">
                    <div className="text-center">
                        <div className="text-6xl mb-4 animate-bounce">🏆</div>
                        <h1 className={`text-6xl font-black mb-4 ${winner === 1 ? 'text-blue-500' : 'text-red-500'}`}>
                            {winner === 1 ? config.team1 : config.team2} Победили!
                        </h1>
                        <p className="text-white/50 text-xl">Возвращение в меню...</p>
                    </div>
                </div>
            )}
        </div>
    )
}
