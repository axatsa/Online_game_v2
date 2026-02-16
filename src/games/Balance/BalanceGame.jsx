import { useState, useEffect } from 'react'
import { ArrowLeft, RotateCcw, Trophy, CheckCircle2, XCircle } from 'lucide-react'

// Physics constants
const MAX_TILT = 20 // degrees
const SENSITIVITY = 1.5

const LEVELS = [
    {
        id: 1,
        target: 50,
        options: [
            { id: 'o1', val: 50, label: '25 + 25' },
            { id: 'o2', val: 45, label: '40 + 5' },
            { id: 'o3', val: 55, label: '60 - 5' },
            { id: 'o4', val: 50, label: '100 : 2' },
        ]
    },
    {
        id: 2,
        target: 80,
        options: [
            { id: 'o1', val: 80, label: '40 x 2' },
            { id: 'o2', val: 70, label: '35 + 35' },
            { id: 'o3', val: 90, label: '100 - 10' },
            { id: 'o4', val: 80, label: '20 + 60' },
        ]
    },
    {
        id: 3,
        target: 24,
        options: [
            { id: 'o1', val: 24, label: '12 + 12' },
            { id: 'o2', val: 20, label: '4 x 5' },
            { id: 'o3', val: 24, label: '3 x 8' },
            { id: 'o4', val: 25, label: '5 x 5' },
        ]
    },
]

export default function BalanceGame({ config, onFinish, onExit }) {
    const [levelIndex, setLevelIndex] = useState(0)
    const [leftWeight, setLeftWeight] = useState(0)
    const [rightWeight, setRightWeight] = useState(0)
    const [rightItems, setRightItems] = useState([])

    const [draggedItem, setDraggedItem] = useState(null)
    const [tilt, setTilt] = useState(-MAX_TILT)
    const [feedback, setFeedback] = useState(null)
    const [gameOver, setGameOver] = useState(false)

    const level = LEVELS[levelIndex]

    useEffect(() => {
        setLeftWeight(level.target)
        setRightWeight(0)
        setRightItems([])
        setTilt(-MAX_TILT)
        setFeedback(null)
    }, [levelIndex])

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
                if (levelIndex < LEVELS.length - 1) setLevelIndex(prev => prev + 1)
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

    if (gameOver) {
        return (
            <div style={{ padding: 40, background: 'white', borderRadius: 24, boxShadow: 'var(--cp-shadow-lg)', maxWidth: 400, margin: '80px auto', textAlign: 'center' }} className="animate-fade">
                <Trophy size={64} color="#F59E0B" style={{ marginBottom: 16 }} />
                <h2 style={{ marginBottom: 8, fontSize: '1.5rem' }}>Баланс найден! ⚖️</h2>
                <button className="btn btn-primary" onClick={() => { setLevelIndex(0); setGameOver(false) }} style={{ marginTop: 24 }}>
                    <RotateCcw size={18} /> Сначала
                </button>
            </div>
        )
    }

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <span style={{ color: 'var(--cp-text-secondary)', fontWeight: 'bold' }}>Уровень {levelIndex + 1} / {LEVELS.length}</span>
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
