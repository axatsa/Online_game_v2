import { Trophy, RotateCcw, Home, Zap, Star } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function BrainTugResult({ result, onRestart, onExit }) {
    const { user, isGuest, updateGuestXP } = useAuth()

    // Save XP for the winning team's player (in a real app, both players would be logged in)
    // For now XP goes to the current logged-in user
    const totalXP = Math.max(result.team1XP, result.team2XP)

    const handleSaveXP = async () => {
        if (isGuest) {
            updateGuestXP(totalXP, {
                game: 'brain-tug',
                xp: totalXP,
                date: new Date().toISOString(),
                result: result.winner === 1 ? `${result.team1} победил` : result.winner === 2 ? `${result.team2} победил` : 'Ничья'
            })
        } else {
            try {
                const token = localStorage.getItem('thompson_token')
                await fetch('/api/sessions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        gameId: 'brain-tug',
                        score: result.ropePos,
                        xpEarned: totalXP,
                        data: result
                    })
                })
            } catch (e) {
                console.error('Failed to save session', e)
            }
        }
    }

    // Auto-save on mount
    useState(() => { handleSaveXP() })

    const winnerName = result.winner === 1 ? result.team1 : result.winner === 2 ? result.team2 : null

    return (
        <div className="bt-result">
            <div className="bt-result-content animate-slide-up">
                {/* Trophy / Draw */}
                <div className="bt-result-trophy">
                    {winnerName ? (
                        <>
                            <Trophy size={64} color="var(--accent-gold)" />
                            <h1>Победа!</h1>
                            <h2 className="bt-result-winner">{winnerName}</h2>
                        </>
                    ) : (
                        <>
                            <Star size={64} color="var(--muted-light)" />
                            <h1>Ничья!</h1>
                            <p>Обе команды сыграли на равных</p>
                        </>
                    )}
                </div>

                {/* Stats */}
                <div className="bt-result-stats">
                    <div className={`bt-result-team ${result.winner === 1 ? 'winner' : ''}`}>
                        <h3>{result.team1}</h3>
                        <div className="bt-result-stat">
                            <span className="bt-result-stat-label">Верных ответов</span>
                            <span className="bt-result-stat-value">{result.team1Correct}</span>
                        </div>
                        <div className="bt-result-stat">
                            <span className="bt-result-stat-label">Заработано XP</span>
                            <span className="bt-result-stat-value bt-xp-value">
                                <Zap size={16} /> {result.team1XP}
                            </span>
                        </div>
                        {result.winner === 1 && <span className="badge badge-gold">+50 бонус за победу</span>}
                    </div>

                    <div className="bt-result-vs">VS</div>

                    <div className={`bt-result-team ${result.winner === 2 ? 'winner' : ''}`}>
                        <h3>{result.team2}</h3>
                        <div className="bt-result-stat">
                            <span className="bt-result-stat-label">Верных ответов</span>
                            <span className="bt-result-stat-value">{result.team2Correct}</span>
                        </div>
                        <div className="bt-result-stat">
                            <span className="bt-result-stat-label">Заработано XP</span>
                            <span className="bt-result-stat-value bt-xp-value">
                                <Zap size={16} /> {result.team2XP}
                            </span>
                        </div>
                        {result.winner === 2 && <span className="badge badge-gold">+50 бонус за победу</span>}
                    </div>
                </div>

                {/* XP Formula */}
                <div className="bt-result-formula">
                    <p>Формула: <strong>Победа (+50) + Верные ответы × 5 XP</strong></p>
                    <p className="bt-result-total">Всего вопросов: {result.totalQuestions}</p>
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
