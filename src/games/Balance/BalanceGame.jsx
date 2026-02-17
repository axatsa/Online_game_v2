import { useState, useEffect, useMemo } from 'react'
import { ArrowLeft, RotateCcw, Trophy, CheckCircle2, XCircle } from 'lucide-react'

// Physics constants
const MAX_TILT = 20 // degrees
const SENSITIVITY = 1.5

const generateLevel = (difficulty, index) => {
    let target, options
    const variance = difficulty === 'hard' ? 20 : difficulty === 'medium' ? 10 : 5

    // Helper to cleanup expressions (e.g. 5 + -3 -> 5 - 3)
    const cleanExpr = (expr) => expr.replace(/\+ -/g, '- ')

    if (difficulty === 'easy') {
        // Numbers 1-20, Add/Sub
        target = Math.floor(Math.random() * 15) + 5 // 5 to 20
        options = []
        // Generate valid options
        for (let i = 0; i < 4; i++) {
            if (i < 2) { // Correct options
                const a = Math.floor(Math.random() * target)
                const b = target - a
                options.push({ val: target, label: `${a} + ${b}` })
            } else { // Distractors
                const val = target + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5 + 1)
                const a = Math.floor(Math.random() * val)
                const b = val - a
                options.push({ val: val, label: `${a} + ${b}` })
            }
        }
    } else if (difficulty === 'medium') {
        // Numbers 1-50, Add/Sub/Mul
        target = Math.floor(Math.random() * 40) + 10 // 10 to 50
        options = []
        for (let i = 0; i < 5; i++) {
            const isCorrect = i < 2
            const val = isCorrect ? target : target + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 8 + 1)

            // Random operation type
            const type = Math.random()
            if (type < 0.4) { // Add
                const a = Math.floor(Math.random() * val)
                options.push({ val, label: `${a} + ${val - a}` })
            } else if (type < 0.7) { // Sub
                const a = val + Math.floor(Math.random() * 20)
                options.push({ val, label: `${a} - ${a - val}` })
            } else { // Mul (simple)
                // Find factors
                const factors = []
                for (let k = 2; k <= Math.sqrt(val); k++) {
                    if (val % k === 0) factors.push(k)
                }
                if (factors.length > 0) {
                    const f = factors[Math.floor(Math.random() * factors.length)]
                    options.push({ val, label: `${f} × ${val / f}` })
                } else {
                    const a = Math.floor(Math.random() * val)
                    options.push({ val, label: `${a} + ${val - a}` })
                }
            }
        }

    } else { // Hard
        // Numbers 1-100, All ops
        target = Math.floor(Math.random() * 80) + 20 // 20 to 100
        options = []
        for (let i = 0; i < 6; i++) {
            const isCorrect = i < 3
            const val = isCorrect ? target : target + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 10 + 2)

            const type = Math.random()
            if (type < 0.25) { // Add
                const a = Math.floor(Math.random() * val)
                options.push({ val, label: `${a} + ${val - a}` })
            } else if (type < 0.5) { // Sub
                const a = val + Math.floor(Math.random() * 30)
                options.push({ val, label: `${a} - ${a - val}` })
            } else if (type < 0.75) { // Mul
                const factors = []
                for (let k = 2; k <= Math.sqrt(val); k++) {
                    if (val % k === 0) factors.push(k)
                }
                if (factors.length > 0) {
                    const f = factors[Math.floor(Math.random() * factors.length)]
                    options.push({ val, label: `${f} × ${val / f}` })
                } else {
                    const a = val + Math.floor(Math.random() * 30)
                    options.push({ val, label: `${a} - ${a - val}` })
                }
            } else { // Div
                const multiplier = Math.floor(Math.random() * 4) + 2
                options.push({ val, label: `${val * multiplier} : ${multiplier}` })
            }
        }
    }

    // Shuffle options and assign IDs
    options = options.sort(() => Math.random() - 0.5).map((o, i) => ({ ...o, id: `opt-${index}-${i}` }))

    return {
        id: index,
        target,
        options
    }
}

export default function BalanceGame({ config, onFinish, onExit }) {
    const [levelIndex, setLevelIndex] = useState(0)
    const [level, setLevel] = useState(null)

    // Physics State
    const [leftWeight, setLeftWeight] = useState(0)
    const [rightWeight, setRightWeight] = useState(0)
    const [rightItems, setRightItems] = useState([])
    const [draggedItem, setDraggedItem] = useState(null)
    const [tilt, setTilt] = useState(-MAX_TILT)
    const [feedback, setFeedback] = useState(null)
    const [gameOver, setGameOver] = useState(false)

    // Setup Level
    useEffect(() => {
        const newLevel = generateLevel(config.difficulty, levelIndex)
        setLevel(newLevel)
        setLeftWeight(newLevel.target)
        setRightWeight(0)
        setRightItems([])
        setTilt(-MAX_TILT)
        setFeedback(null)
    }, [levelIndex, config.difficulty])

    // Physics Loop
    useEffect(() => {
        const interval = setInterval(() => {
            setTilt(prev => {
                const diff = rightWeight - leftWeight
                const targetTilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, diff * SENSITIVITY))
                const dist = targetTilt - prev
                if (Math.abs(dist) < 0.5) return targetTilt
                return prev + dist * 0.1
            })
        }, 16)
        return () => clearInterval(interval)
    }, [leftWeight, rightWeight])

    const handleDragStart = (item) => setDraggedItem(item)
    const handleDragOver = (e) => e.preventDefault()

    const handleDrop = (e) => {
        e.preventDefault()
        if (!draggedItem) return
        if (rightItems.find(i => i.id === draggedItem.id)) return

        const newRightWeight = rightWeight + draggedItem.val
        setRightWeight(newRightWeight)
        setRightItems(prev => [...prev, draggedItem])

        if (newRightWeight === leftWeight) {
            setFeedback('success')
            setTimeout(() => {
                if (levelIndex < 9) setLevelIndex(prev => prev + 1) // Play 10 rounds
                else setGameOver(true)
            }, 1500)
        } else if (newRightWeight > leftWeight) {
            setFeedback('error')
            setTimeout(() => {
                setRightWeight(0)
                setRightItems([])
                setFeedback(null)
            }, 1000)
        }
        setDraggedItem(null)
    }

    if (!level) return <div>Загрузка...</div>

    if (gameOver) {
        return (
            <div style={{ padding: 40, background: 'white', borderRadius: 24, boxShadow: 'var(--cp-shadow-lg)', maxWidth: 400, margin: '80px auto', textAlign: 'center' }} className="animate-fade">
                <Trophy size={64} color="#F59E0B" style={{ marginBottom: 16 }} />
                <h2 style={{ marginBottom: 8, fontSize: '1.5rem' }}>Баланс найден! ⚖️</h2>
                <button className="btn btn-primary" onClick={() => { setLevelIndex(0); setGameOver(false) }} style={{ marginTop: 24 }}>
                    <RotateCcw size={18} /> Сначала
                </button>
                <button className="btn btn-ghost mt-4" onClick={onExit}>Выход</button>
            </div>
        )
    }

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <span style={{ color: 'var(--cp-text-secondary)', fontWeight: 'bold' }}>Уровень {levelIndex + 1} / 10</span>
                <button className="btn btn-secondary btn-sm" onClick={onExit}><ArrowLeft size={16} /> Выход</button>
            </div>

            <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 400 }}>
                {/* Stand */}
                <div style={{ position: 'absolute', bottom: 40, width: 16, height: 160, background: '#94a3b8', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}></div>
                <div style={{ position: 'absolute', bottom: 40, width: 128, height: 16, background: '#94a3b8', borderRadius: 999 }}></div>

                {/* Beam */}
                <div style={{
                    position: 'relative', width: 'min(90%, 500px)', height: 16, background: '#2563eb', borderRadius: 999, zIndex: 10,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px',
                    transform: `rotate(${tilt}deg)`, transition: 'transform 0.075s linear', transformOrigin: 'center'
                }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', width: 24, height: 24, background: '#e2e8f0', border: '4px solid #64748b', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 20 }}></div>

                    {/* Left Pan */}
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: 8, height: 80, background: '#60a5fa', margin: '0 auto', transformOrigin: 'top', transform: `rotate(${-tilt}deg)` }}></div>
                        <div style={{ width: 100, height: 100, background: '#f1f5f9', border: '4px solid #60a5fa', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `rotate(${-tilt}deg)`, boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}>
                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b' }}>ЦЕЛЬ</span>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', background: '#1e293b', color: 'white', padding: '4px 12px', borderRadius: 8 }}>{level.target}</div>
                        </div>
                    </div>

                    {/* Right Pan */}
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: 8, height: 80, background: '#60a5fa', margin: '0 auto', transformOrigin: 'top', transform: `rotate(${-tilt}deg)` }}></div>
                        <div
                            style={{
                                width: 100, height: 100, background: feedback === 'success' ? '#f0fdf4' : feedback === 'error' ? '#fef2f2' : 'white',
                                border: feedback === 'success' ? '4px solid #22c55e' : feedback === 'error' ? '4px solid #ef4444' : '4px solid #60a5fa',
                                borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                transform: `rotate(${-tilt}deg)`, transition: 'all 0.3s', boxShadow: '0 10px 15px rgba(0,0,0,0.1)'
                            }}
                            onDragOver={handleDragOver} onDrop={handleDrop}
                        >
                            <span style={{ position: 'absolute', top: -24, background: 'white', padding: '2px 8px', borderRadius: 12, fontSize: '10px', fontWeight: 'bold' }}>Сюда!</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, width: 80 }}>
                                {rightItems.map((item, i) => (
                                    <div key={i} style={{ background: '#fbbf24', color: 'white', fontSize: '10px', padding: '2px 4px', borderRadius: 4 }}>{item.label}</div>
                                ))}
                            </div>
                            {feedback === 'success' && <CheckCircle2 style={{ position: 'absolute', color: '#22c55e', opacity: 0.8 }} size={48} />}
                            {feedback === 'error' && <XCircle style={{ position: 'absolute', color: '#ef4444', opacity: 0.8 }} size={48} />}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ width: '100%', background: '#f1f5f9', padding: 24, borderRadius: 16, borderTop: '1px solid #e2e8f0' }}>
                <p style={{ textAlign: 'center', color: '#64748b', fontWeight: 'bold', marginBottom: 16 }}>ПЕРЕТАЩИ ГИРЬКИ</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                    {level.options.map((opt) => {
                        const isUsed = rightItems.some(i => i.id === opt.id)
                        return (
                            <div
                                key={opt.id}
                                draggable={!isUsed}
                                onDragStart={() => handleDragStart(opt)}
                                style={{
                                    width: 80, height: 80, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', fontSize: '18px', cursor: isUsed ? 'default' : 'grab',
                                    background: isUsed ? '#cbd5e1' : '#fbbf24', color: isUsed ? '#94a3b8' : 'white',
                                    borderBottom: isUsed ? '4px solid #94a3b8' : '4px solid #d97706',
                                    transform: isUsed ? 'none' : 'translateY(0)', transition: 'transform 0.1s'
                                }}
                                onMouseDown={(e) => !isUsed && (e.currentTarget.style.transform = 'translateY(2px)')}
                                onMouseUp={(e) => !isUsed && (e.currentTarget.style.transform = 'translateY(0)')}
                            >
                                {opt.label}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
