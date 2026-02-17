import { useState, useEffect, useRef } from 'react'
import { Pause, Play, RotateCcw, Clock, Trophy, ArrowLeft } from 'lucide-react'

const THEMES = {
    'fruit': ['🍎', '🍌', '🍇', '🍓', '🍒', '🥝', '🍍', '🥭', '🍐', '🍉', '🍊', '🍋', '🫐', '🍑', '🥥'],
    'animal': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'],
    'emoji': ['😀', '😎', '😍', '🤩', '🤯', '🥳', '🥶', '😡', '😱', '🤖', '💩', '👻', '👽', '💀', '🤡'],
    'sport': ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '🥊', '🥋', '🎽', '🛹']
}

export default function MemoryMatrixGame({ config, onFinish, onExit }) {
    // Determine Grid settings based on difficulty
    const getGridSettings = (diff) => {
        switch (diff) {
            case 'easy': return { cols: 4, rows: 3 } // 12 cards (6 pairs)
            case 'medium': return { cols: 4, rows: 4 } // 16 cards (8 pairs)
            case 'hard': return { cols: 5, rows: 4 } // 20 cards (10 pairs)
            case 'expert': return { cols: 6, rows: 5 } // 30 cards (15 pairs) - tough!
            default: return { cols: 4, rows: 4 }
        }
    }

    const [settings] = useState(() => getGridSettings(config.difficulty || 'medium'))

    const [cards, setCards] = useState(() => {
        const theme = config.theme || 'fruit'
        const pool = THEMES[theme] || THEMES['fruit']
        const totalCards = settings.cols * settings.rows
        const totalPairs = totalCards / 2

        // Pick random symbols for pairs
        const selectedSymbols = [...pool].sort(() => 0.5 - Math.random()).slice(0, totalPairs)

        const deck = [...selectedSymbols, ...selectedSymbols]
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
        const totalPairs = (settings.cols * settings.rows) / 2
        if (matchedPairs === totalPairs) {
            setGameOver(true)
            clearInterval(timerRef.current)
        }
    }, [matchedPairs, settings])

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

    // Helper to calculate card size based on grid
    const getCardSize = () => {
        // We want the grid to fit in roughly 600px width / 600px height max
        // Default base size ~80px, but scale down for larger grids
        if (settings.cols >= 6) return '60px'
        if (settings.cols >= 5) return '70px'
        return '90px'
    }

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
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center' }}>
            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, width: '100%', maxWidth: 800 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', padding: '8px 16px', borderRadius: 12, border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '18px', fontWeight: 'bold', color: '#475569' }}>
                        <Clock size={20} className="text-secondary" /> {formatTime(elapsedTime)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', padding: '8px 16px', borderRadius: 12, border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '18px', fontWeight: 'bold', color: '#475569' }}>
                        <RotateCcw size={20} className="text-secondary" /> {moves}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                    <button className="btn btn-icon" onClick={() => setPaused(!paused)}>{paused ? <Play size={20} /> : <Pause size={20} />}</button>
                    <button className="btn btn-secondary btn-sm" onClick={onExit}><ArrowLeft size={16} /> Выход</button>
                </div>
            </div>

            {/* Grid */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', width: '100%' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${settings.cols}, 1fr)`,
                    gap: 12,
                    userSelect: 'none',
                    padding: 20
                }}>
                    {cards.map(card => (
                        <div key={card.id} onClick={() => handleCardClick(card.id)}
                            style={{
                                width: getCardSize(), height: getCardSize(),
                                perspective: '1000px', cursor: 'pointer',
                                opacity: card.matched ? 0 : 1, pointerEvents: card.matched ? 'none' : 'auto',
                                transition: 'opacity 0.5s'
                            }}
                        >
                            <div style={{
                                position: 'relative', width: '100%', height: '100%',
                                transformStyle: 'preserve-3d', transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                transform: card.flipped ? 'rotateY(180deg)' : 'rotateY(0)'
                            }}>
                                {/* Front (Back of card) */}
                                <div style={{
                                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '2px solid #818cf8', color: 'rgba(255,255,255,0.4)', fontSize: '28px',
                                    fontWeight: 'bold'
                                }}>?</div>
                                {/* Back (Face of card) */}
                                <div style={{
                                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                                    background: 'white', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '2px solid #e0e7ff', transform: 'rotateY(180deg)',
                                    fontSize: parseInt(getCardSize()) * 0.6 + 'px'
                                }}>{card.symbol}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {paused && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
                    <div className="flex flex-col items-center gap-4 animate-bounce-short">
                        <h2 className="text-3xl font-black text-slate-800">ПАУЗА II</h2>
                        <button className="btn btn-primary btn-lg gap-2" onClick={() => setPaused(false)} style={{ transform: 'scale(1.2)' }}>
                            <Play size={24} /> Продолжить
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
