import { useState, useEffect, useRef } from 'react'
import { Pause, Play, RotateCcw, Clock } from 'lucide-react'

export default function MemoryMatrixGame({ config, onFinish, onExit }) {
    const [cards, setCards] = useState(() =>
        config.cards.map((symbol, i) => ({
            id: i,
            symbol,
            flipped: false,
            matched: false,
        }))
    )
    const [flippedIds, setFlippedIds] = useState([])
    const [moves, setMoves] = useState(0)
    const [matchedPairs, setMatchedPairs] = useState(0)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [paused, setPaused] = useState(false)
    const [gameOver, setGameOver] = useState(false)
    const timerRef = useRef(null)

    // Timer
    useEffect(() => {
        timerRef.current = setInterval(() => {
            if (!paused && !gameOver) {
                setElapsedTime(prev => prev + 1)
            }
        }, 1000)
        return () => clearInterval(timerRef.current)
    }, [paused, gameOver])

    // Check win
    useEffect(() => {
        if (matchedPairs === config.totalPairs) {
            setGameOver(true)
            clearInterval(timerRef.current)

            const timeBonus = Math.max(0, 100 - elapsedTime)
            const moveBonus = Math.max(0, 50 - (moves - config.totalPairs) * 2)
            const baseXP = config.totalPairs * 10
            const totalXP = baseXP + Math.floor(timeBonus / 2) + Math.floor(moveBonus / 2)

            setTimeout(() => {
                onFinish({
                    moves,
                    time: elapsedTime,
                    pairs: matchedPairs,
                    totalPairs: config.totalPairs,
                    gridSize: config.gridSize,
                    category: config.category,
                    xp: totalXP,
                    stars: getStars(moves, config.totalPairs, elapsedTime),
                })
            }, 800)
        }
    }, [matchedPairs])

    const getStars = (moveCount, pairs, time) => {
        const optimalMoves = pairs
        const ratio = moveCount / optimalMoves
        if (ratio <= 1.5 && time <= pairs * 4) return 3
        if (ratio <= 2.5 && time <= pairs * 8) return 2
        return 1
    }

    const handleCardClick = (cardId) => {
        if (paused || gameOver) return
        if (flippedIds.length >= 2) return
        if (cards[cardId].flipped || cards[cardId].matched) return

        const newCards = [...cards]
        newCards[cardId].flipped = true
        setCards(newCards)

        const newFlipped = [...flippedIds, cardId]
        setFlippedIds(newFlipped)

        if (newFlipped.length === 2) {
            setMoves(prev => prev + 1)
            const [first, second] = newFlipped

            if (cards[first].symbol === newCards[second].symbol) {
                // Match!
                setTimeout(() => {
                    setCards(prev => prev.map(c =>
                        c.id === first || c.id === second
                            ? { ...c, matched: true }
                            : c
                    ))
                    setMatchedPairs(prev => prev + 1)
                    setFlippedIds([])
                }, 400)
            } else {
                // No match — flip back
                setTimeout(() => {
                    setCards(prev => prev.map(c =>
                        c.id === first || c.id === second
                            ? { ...c, flipped: false }
                            : c
                    ))
                    setFlippedIds([])
                }, 800)
            }
        }
    }

    const formatTime = (s) => {
        const m = Math.floor(s / 60)
        const sec = s % 60
        return `${m}:${sec < 10 ? '0' : ''}${sec}`
    }

    return (
        <div className="mm-game">
            {/* Pause */}
            {paused && (
                <div className="bt-pause-overlay">
                    <div className="bt-pause-modal animate-slide-up">
                        <h2>⏸️ Пауза</h2>
                        <p>Игра приостановлена</p>
                        <button className="btn btn-primary btn-lg" onClick={() => setPaused(false)}>
                            <Play size={20} /> Продолжить
                        </button>
                        <button className="btn btn-secondary" onClick={onExit} style={{ marginTop: 8 }}>
                            Выйти из игры
                        </button>
                    </div>
                </div>
            )}

            {/* Top Bar */}
            <div className="mm-topbar">
                <div className="mm-topbar-stat">
                    <Clock size={16} />
                    <span>{formatTime(elapsedTime)}</span>
                </div>

                <div className="mm-topbar-center">
                    <span className="mm-topbar-pairs">{matchedPairs} / {config.totalPairs} пар</span>
                </div>

                <div className="mm-topbar-stat">
                    <RotateCcw size={16} />
                    <span>{moves} ходов</span>
                </div>

                <button className="btn-icon" onClick={() => setPaused(true)} title="Пауза">
                    <Pause size={18} />
                </button>
            </div>

            {/* Grid */}
            <div className="mm-grid-wrapper">
                <div
                    className="mm-grid"
                    style={{
                        gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
                        maxWidth: config.cols <= 3 ? 320 : config.cols <= 4 ? 440 : 520,
                    }}
                >
                    {cards.map(card => (
                        <button
                            key={card.id}
                            className={`mm-card ${card.flipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`}
                            onClick={() => handleCardClick(card.id)}
                            disabled={card.matched}
                        >
                            <div className="mm-card-inner">
                                <div className="mm-card-front">
                                    <span>?</span>
                                </div>
                                <div className="mm-card-back">
                                    <span>{card.symbol}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
