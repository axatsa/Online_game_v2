import { Trophy, RotateCcw, Home, Zap, Star, Clock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useState as useStateInit } from 'react'

export default function MemoryMatrixResult({ result, onRestart, onExit }) {
    const { isGuest, updateGuestXP } = useAuth()

    // Auto-save XP
    useStateInit(() => {
        if (isGuest) {
            updateGuestXP(result.xp, {
                game: 'memory-matrix',
                xp: result.xp,
                stars: result.stars,
                date: new Date().toISOString()
            })
        } else {
            const token = localStorage.getItem('thompson_token')
            if (token) {
                fetch('/api/sessions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ gameId: 'memory-matrix', score: result.pairs, xpEarned: result.xp, data: result })
                }).catch(e => console.error('Save error:', e))
            }
        }
    })

    const formatTime = (s) => {
        const m = Math.floor(s / 60)
        const sec = s % 60
        return `${m}:${sec < 10 ? '0' : ''}${sec}`
    }

    return (
        <div className="mm-result">
            <div className="mm-result-content animate-slide-up">
                {/* Stars */}
                <div className="mm-result-stars">
                    {[1, 2, 3].map(s => (
                        <Star
                            key={s}
                            size={48}
                            fill={s <= result.stars ? 'var(--accent-gold)' : 'transparent'}
                            color={s <= result.stars ? 'var(--accent-gold)' : 'rgba(255,255,255,0.2)'}
                            className={s <= result.stars ? 'mm-star-earned' : ''}
                        />
                    ))}
                </div>

                <h1>{result.stars === 3 ? 'Великолепно!' : result.stars === 2 ? 'Отлично!' : 'Молодец!'}</h1>
                <p className="mm-result-subtitle">
                    {result.category} · Поле {result.gridSize}
                </p>

                {/* Stats Grid */}
                <div className="mm-result-grid">
                    <div className="mm-result-stat-card">
                        <Clock size={24} />
                        <span className="mm-result-stat-val">{formatTime(result.time)}</span>
                        <span className="mm-result-stat-label">Время</span>
                    </div>
                    <div className="mm-result-stat-card">
                        <RotateCcw size={24} />
                        <span className="mm-result-stat-val">{result.moves}</span>
                        <span className="mm-result-stat-label">Ходов</span>
                    </div>
                    <div className="mm-result-stat-card">
                        <Trophy size={24} />
                        <span className="mm-result-stat-val">{result.pairs}/{result.totalPairs}</span>
                        <span className="mm-result-stat-label">Пар</span>
                    </div>
                    <div className="mm-result-stat-card mm-xp-card">
                        <Zap size={24} />
                        <span className="mm-result-stat-val">+{result.xp}</span>
                        <span className="mm-result-stat-label">XP</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="bt-result-actions">
                    <button className="btn btn-primary btn-lg" onClick={onRestart}>
                        <RotateCcw size={18} /> Играть снова
                    </button>
                    <button className="btn btn-secondary btn-lg" onClick={onExit}>
                        <Home size={18} /> На главную
                    </button>
                </div>
            </div>
        </div>
    )
}
