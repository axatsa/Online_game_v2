import { useState, useEffect } from 'react'
import { ArrowLeft, X, Eye, Plus, Minus, Trophy } from 'lucide-react'

// Mock Data
const MOCK_DATA = {
    categories: [
        {
            name: 'История',
            questions: [
                { points: 100, q: 'Кто был первым президентом Узбекистана?', a: 'Ислам Каримов' },
                { points: 200, q: 'В каком году была провозглашена независимость?', a: '1991' },
                { points: 300, q: 'Древний город, столица империи Тимуридов', a: 'Самарканд' },
                { points: 400, q: 'Великий ученый, внук Амира Тимура', a: 'Улугбек' },
                { points: 500, q: 'Автор "Бабур-наме"', a: 'Захириддин Мухаммад Бабур' }
            ]
        },
        {
            name: 'География',
            questions: [
                { points: 100, q: 'Самая длинная река в Средней Азии', a: 'Сырдарья' },
                { points: 200, q: 'Столица Узбекистана', a: 'Ташкент' },
                { points: 300, q: 'Море, которое почти исчезло', a: 'Аральское море' },
                { points: 400, q: 'Пустыня, занимающая большую часть страны', a: 'Кызылкум' },
                { points: 500, q: 'Город-музей под открытым небом', a: 'Хива' }
            ]
        },
        {
            name: 'Литература',
            questions: [
                { points: 100, q: 'Кто написал "Хамса"?', a: 'Алишер Навои' },
                { points: 200, q: 'Известный узбекский поэт и писатель 20 века', a: 'Абдулла Кадыри' },
                { points: 300, q: 'Автор гимна Узбекистана', a: 'Абдулла Арипов' },
                { points: 400, q: 'Произведение "Минувшие дни"', a: 'Абдулла Кадыри' },
                { points: 500, q: 'Знаменитый сатирик и поэт', a: 'Гайрати' }
            ]
        },
        {
            name: 'Природа',
            questions: [
                { points: 100, q: 'Национальный фрукт (символ плодородия)', a: 'Гранат' },
                { points: 200, q: 'Белое золото Узбекистана', a: 'Хлопок' },
                { points: 300, q: 'Горная цепь на востоке страны', a: 'Тянь-Шань' },
                { points: 400, q: 'Редкая антилопа, обитающая в степях', a: 'Сайгак' },
                { points: 500, q: 'Заповедник в Ташкентской области', a: 'Чаткальский' }
            ]
        }
    ]
}

export default function JeopardyGame({ config, onFinish, onExit }) {
    const teamsList = [config.team1, config.team2, config.team3, config.team4].filter(Boolean)

    const [teams, setTeams] = useState(teamsList.map(name => ({ name, score: 0 })))
    const [gameData] = useState(MOCK_DATA)
    const [answered, setAnswered] = useState(new Set())
    const [activeQuestion, setActiveQuestion] = useState(null)
    const [showAnswer, setShowAnswer] = useState(false)
    const [gameOver, setGameOver] = useState(false)

    const handleQuestionClick = (catIndex, qIndex, question) => {
        if (answered.has(`${catIndex}-${qIndex}`)) return
        setActiveQuestion({ catIndex, qIndex, ...question })
        setShowAnswer(false)
    }

    const handleScore = (teamIndex, points) => {
        setTeams(prev => prev.map((t, i) => i === teamIndex ? { ...t, score: t.score + points } : t))
    }

    const closeQuestion = () => {
        if (activeQuestion) {
            setAnswered(prev => new Set(prev).add(`${activeQuestion.catIndex}-${activeQuestion.qIndex}`))
            setActiveQuestion(null)
        }
    }

    const allAnswered = gameData.categories.every((cat, ci) =>
        cat.questions.every((_, qi) => answered.has(`${ci}-${qi}`))
    )

    useEffect(() => {
        if (allAnswered && !activeQuestion) {
            setGameOver(true)
        }
    }, [allAnswered, activeQuestion])


    // --- GAME OVER VIEW ---
    if (gameOver) {
        const sortedTeams = [...teams].sort((a, b) => b.score - a.score)
        const winner = sortedTeams[0]

        return (
            <div style={{
                fontFamily: "'Inter', sans-serif",
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '40px', background: 'white', borderRadius: '24px',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                maxWidth: '600px', margin: '40px auto', textAlign: 'center'
            }}>
                <Trophy size={80} color="#F59E0B" style={{ marginBottom: '24px' }} />
                <h2 style={{ marginBottom: '16px', fontSize: '32px', color: '#1e293b' }}>Игра окончена!</h2>
                <div style={{ fontSize: '20px', marginBottom: '32px' }}>
                    Победитель: <span style={{ fontWeight: 'bold', color: '#dc2626' }}>{winner.name}</span> ({winner.score})
                </div>

                <div style={{ width: '100%', marginBottom: '32px' }}>
                    {sortedTeams.map((t, i) => (
                        <div key={i} style={{
                            display: 'flex', justifyContent: 'space-between',
                            padding: '12px 0', borderBottom: '1px solid #e2e8f0', fontSize: '18px'
                        }}>
                            <span>{i + 1}. {t.name}</span>
                            <span style={{ fontWeight: 'bold' }}>{t.score}</span>
                        </div>
                    ))}
                </div>

                <button className="btn btn-primary" onClick={onExit} style={{ padding: '12px 32px', fontSize: '18px' }}>Выход</button>
            </div>
        )
    }

    // --- ACTIVE QUESTION VIEW ---
    if (activeQuestion) {
        return (
            <div style={{
                position: 'fixed', inset: 0, zIndex: 100, background: 'white',
                display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif"
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '24px 32px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc'
                }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#64748b' }}>
                        {gameData.categories[activeQuestion.catIndex].name} — {activeQuestion.points}
                    </div>
                    <button style={{
                        background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px',
                        padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                    }} onClick={() => setActiveQuestion(null)}>
                        <X size={20} /> Отмена
                    </button>
                </div>

                {/* Question Content */}
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '40px', textAlign: 'center', overflowY: 'auto'
                }}>
                    <div style={{
                        fontSize: '48px', fontWeight: 'bold', color: '#0f172a', marginBottom: '60px',
                        fontFamily: "'Merriweather', serif", lineHeight: 1.3, maxWidth: '900px'
                    }}>
                        {activeQuestion.q}
                    </div>

                    {showAnswer ? (
                        <div style={{
                            fontSize: '36px', color: '#16a34a', fontWeight: 'bold', background: '#f0fdf4',
                            padding: '30px 60px', borderRadius: '20px', border: '2px solid #bbf7d0',
                            animation: 'slideUp 0.3s ease'
                        }}>
                            {activeQuestion.a}
                        </div>
                    ) : (
                        <button style={{
                            background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px',
                            padding: '16px 32px', fontSize: '20px', fontWeight: '600', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.5)'
                        }} onClick={() => setShowAnswer(true)}>
                            <Eye size={24} /> Показать ответ
                        </button>
                    )}
                </div>

                {/* Footer Controls (Score) */}
                <div style={{ padding: '24px', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{
                        display: 'flex', justifyContent: 'center', gap: '32px',
                        maxWidth: '1000px', margin: '0 auto 24px auto', flexWrap: 'wrap'
                    }}>
                        {teams.map((team, idx) => (
                            <div key={idx} style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                background: '#f8fafc', padding: '16px', borderRadius: '12px', minWidth: '140px'
                            }}>
                                <span style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '12px', color: '#334155' }}>
                                    {team.name}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <button style={{
                                        width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#fee2e2', color: '#ef4444',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                    }} onClick={() => handleScore(idx, -activeQuestion.points)}>
                                        <Minus size={20} />
                                    </button>

                                    <span style={{ fontFamily: 'monospace', fontSize: '24px', fontWeight: 'bold', minWidth: '60px', textAlign: 'center' }}>
                                        {team.score}
                                    </span>

                                    <button style={{
                                        width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#dcfce7', color: '#16a34a',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                    }} onClick={() => handleScore(idx, activeQuestion.points)}>
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <button style={{
                            background: 'white', border: '2px solid #e2e8f0', color: '#475569',
                            padding: '12px 40px', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer'
                        }} onClick={closeQuestion}>
                            Завершить раунд
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // --- GRID VIEW ---
    return (
        <div style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>
            {/* Scoreboard Header */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '20px', background: 'white', padding: '16px 24px', borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
                <div style={{ display: 'flex', gap: '32px' }}>
                    {teams.map((t, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', minWidth: '80px' }}>
                            <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                                {t.name}
                            </span>
                            <span style={{ fontWeight: '900', fontSize: '24px', color: '#0f172a' }}>
                                {t.score}
                            </span>
                        </div>
                    ))}
                </div>
                <button style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                    background: '#f1f5f9', border: 'none', borderRadius: '10px', color: '#475569', fontWeight: '600', cursor: 'pointer'
                }} onClick={onExit}>
                    <ArrowLeft size={18} /> Выход
                </button>
            </div>

            {/* Game Grid */}
            <div style={{
                flex: 1, background: '#1e3a8a', padding: '24px', borderRadius: '24px',
                boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.2)', overflow: 'auto',
                border: '4px solid #1e40af'
            }}>
                <div style={{
                    display: 'grid',
                    gap: '16px',
                    gridTemplateColumns: `repeat(${gameData.categories.length}, 1fr)`,
                    height: '100%',
                    minWidth: '800px' // Preserve layout on small screens
                }}>
                    {gameData.categories.map((cat, colIndex) => (
                        <div key={colIndex} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {/* Category Header */}
                            <div style={{
                                background: '#172554',
                                color: '#93c5fd',
                                padding: '16px',
                                borderRadius: '12px',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                fontSize: '18px',
                                border: '2px solid #3b82f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '80px',
                                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                lineHeight: 1.2
                            }}>
                                {cat.name}
                            </div>

                            {/* Questions */}
                            {cat.questions.map((q, rowIndex) => {
                                const isAnswered = answered.has(`${colIndex}-${rowIndex}`)
                                return (
                                    <button
                                        key={rowIndex}
                                        disabled={isAnswered}
                                        onClick={() => handleQuestionClick(colIndex, rowIndex, q)}
                                        style={{
                                            flex: 1,
                                            margin: 0,
                                            background: isAnswered ? 'rgba(30, 58, 138, 0.5)' : '#2563eb', // Darker if answered
                                            color: isAnswered ? 'transparent' : '#fcd34d', // Hide text if answered
                                            border: isAnswered ? '2px dashed #1e40af' : '2px solid #60a5fa',
                                            borderRadius: '12px',
                                            fontSize: '32px',
                                            fontWeight: '700',
                                            fontFamily: 'monospace',
                                            cursor: isAnswered ? 'default' : 'pointer',
                                            boxShadow: isAnswered ? 'none' : '0 6px 0 #1d4ed8',
                                            transition: 'transform 0.1s, box-shadow 0.1s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transform: isAnswered ? 'scale(0.95)' : 'scale(1)',
                                            position: 'relative'
                                        }}
                                        onMouseDown={e => {
                                            if (!isAnswered) {
                                                e.currentTarget.style.transform = 'translateY(4px)'
                                                e.currentTarget.style.boxShadow = '0 2px 0 #1d4ed8'
                                            }
                                        }}
                                        onMouseUp={e => {
                                            if (!isAnswered) {
                                                e.currentTarget.style.transform = 'translateY(0)'
                                                e.currentTarget.style.boxShadow = '0 6px 0 #1d4ed8'
                                            }
                                        }}
                                        onMouseEnter={e => {
                                            if (!isAnswered) {
                                                e.currentTarget.style.filter = 'brightness(1.1)'
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (!isAnswered) {
                                                e.currentTarget.style.filter = 'brightness(1)'
                                                e.currentTarget.style.transform = 'translateY(0)'
                                                e.currentTarget.style.boxShadow = '0 6px 0 #1d4ed8'
                                            }
                                        }}
                                    >
                                        {!isAnswered && q.points}
                                    </button>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
