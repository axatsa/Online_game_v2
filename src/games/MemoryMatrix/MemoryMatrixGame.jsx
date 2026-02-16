import { useState, useEffect, useRef } from 'react'
import { Pause, Play, RotateCcw, Clock, Trophy, ArrowLeft } from 'lucide-react'

export default function MemoryMatrixGame({ config, onFinish, onExit }) {
    const [cards, setCards] = useState(() => {
        const activeCards = config.cards.slice(0, config.totalPairs)
        const deck = [...activeCards, ...activeCards]
            .map((symbol, i) => ({ id: i, symbol, flipped: false, matched: false }))
            .sort(() => Math.random() - 0.5)
        return deck
    })

    const [flippedIds, setFlippedIds] = useState([])
    const [moves, setMoves] = useState(0)
    const [matchedPairs, setMatchedPairs] = useState(0)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [paused, setPaused] = useState(false)
    const [gameOver, setGameOver] = useState(false)
    const timerRef = useRef()

    useEffect(() => {
        timerRef.current = setInterval(() => {
            if (!paused && !gameOver) setElapsedTime(p => p + 1)
        }, 1000)
        return () => clearInterval(timerRef.current)
    }, [paused, gameOver])

    useEffect(() => {
        if (matchedPairs === config.totalPairs) {
            setGameOver(true)
            clearInterval(timerRef.current)
        }
    }, [matchedPairs, config.totalPairs])

    const handleCardClick = (id) => {
        if (paused || gameOver) return
        if (flippedIds.length >= 2 || flippedIds.includes(id)) return
        if (cards.find(c => c.id === id).matched) return

        const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c)
        setCards(newCards)
        const newFlipped = [...flippedIds, id]
        setFlippedIds(newFlipped)

        if (newFlipped.length === 2) {
            setMoves(m => m + 1)
            const [id1, id2] = newFlipped
            const c1 = newCards.find(c => c.id === id1)
            const c2 = newCards.find(c => c.id === id2)

            if (c1.symbol === c2.symbol) {
                setTimeout(() => {
                    setCards(prev => prev.map(c => (c.id === id1 || c.id === id2) ? { ...c, matched: true } : c))
                    setMatchedPairs(p => p + 1)
                    setFlippedIds([])
                }, 500)
            } else {
                setTimeout(() => {
                    setCards(prev => prev.map(c => (c.id === id1 || c.id === id2) ? { ...c, flipped: false } : c))
                    setFlippedIds([])
                }, 1000)
            }
        }
    }

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

    if (gameOver) {
        return (
            <div style={{ padding: 40, background: 'white', borderRadius: 24, boxShadow: 'var(--cp-shadow-lg)', maxWidth: 400, margin: '80px auto', textAlign: 'center' }} className="animate-fade">
                <Trophy size={80} color="#F59E0B" style={{ marginBottom: 16 }} />
                <h2 style={{ marginBottom: 8, fontSize: '2rem' }}>Ты справился! 🎉</h2>
                <div style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: 24 }}>
                    Время: {formatTime(elapsedTime)} | Ходы: {moves}
                </div>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                    <button className="btn btn-primary" onClick={onExit}>Отлично</button>
                    <button className="btn btn-secondary" onClick={() => window.location.reload()}><RotateCcw size={18} /> Еще раз</button>
                </div>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '18px' }}>
                        <Clock size={20} className="text-secondary" /> {formatTime(elapsedTime)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '18px' }}>
                        <RotateCcw size={20} className="text-secondary" /> {moves}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                    <button className="btn btn-icon" onClick={() => setPaused(!paused)}>{paused ? <Play size={20} /> : <Pause size={20} />}</button>
                    <button className="btn btn-secondary btn-sm" onClick={onExit}><ArrowLeft size={16} /> Выход</button>
                </div>
            </div>

            {/* Grid */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${config.cols}, 1fr)`, gap: 16, width: '100%', maxWidth: 500 }}>
                    {cards.map(card => (
                        <div key={card.id} onClick={() => handleCardClick(card.id)}
                            style={{
                                aspectRatio: '3/4', perspective: '1000px', cursor: 'pointer',
                                opacity: card.matched ? 0 : 1, pointerEvents: card.matched ? 'none' : 'auto',
                                transition: 'opacity 0.5s'
                            }}
                        >
                            <div style={{
                                position: 'relative', width: '100%', height: '100%',
                                transformStyle: 'preserve-3d', transition: 'transform 0.6s',
                                transform: card.flipped ? 'rotateY(180deg)' : 'rotateY(0)'
                            }}>
                                {/* Front (Back of card) */}
                                <div style={{
                                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                                    background: '#4f46e5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '2px solid #818cf8', color: 'rgba(255,255,255,0.3)', fontSize: '32px'
                                }}>?</div>
                                {/* Back (Face of card) */}
                                <div style={{
                                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                                    background: 'white', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '2px solid #e0e7ff', transform: 'rotateY(180deg)',
                                    fontSize: '48px'
                                }}>{card.symbol}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {paused && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)', borderRadius: 16 }}>
                    <button className="btn btn-primary btn-lg" onClick={() => setPaused(false)} style={{ transform: 'scale(1.2)' }}>
                        <Play size={24} /> Продолжить
                    </button>
                </div>
            )}
        </div>
    )
}
