import { useState, useEffect, useCallback } from 'react'
import { RotateCcw, CheckCircle2, Trophy, ArrowRight } from 'lucide-react'

const WORDS_BY_TOPIC = {
    'Космос': ['ПЛАНЕТА', 'ЗВЕЗДА', 'РАКЕТА', 'ГАЛАКТИКА', 'ОРБИТА'],
    'Животные': ['ТИГР', 'СЛОН', 'ЖИРАФ', 'МЕДВЕДЬ', 'ВОЛК'],
    'Математика': ['ЧИСЛО', 'СУММА', 'ГРАФИК', 'КВАДРАТ', 'МИНУС'],
}

export default function WordBuilderGame({ config, onFinish, onExit }) {
    const topic = config.topic || 'Животные'
    const words = WORDS_BY_TOPIC[topic] || WORDS_BY_TOPIC['Животные']

    const [currentWordIndex, setCurrentWordIndex] = useState(0)
    const [scrambledLetters, setScrambledLetters] = useState([])
    const [userLetters, setUserLetters] = useState([])
    const [gameOver, setGameOver] = useState(false)
    const [message, setMessage] = useState('')
    const [score, setScore] = useState(0)

    const targetWord = words[currentWordIndex]

    const scramble = useCallback((word) => {
        return word.split('').map((char, id) => ({ char, id, used: false }))
            .sort(() => Math.random() - 0.5)
    }, [])

    useEffect(() => {
        setScrambledLetters(scramble(targetWord))
        setUserLetters([])
        setMessage('')
    }, [currentWordIndex, targetWord, scramble])

    const handleLetterClick = (letterObj) => {
        if (letterObj.used) return

        setUserLetters(prev => [...prev, letterObj])
        setScrambledLetters(prev => prev.map(l => l.id === letterObj.id ? { ...l, used: true } : l))
    }

    const removeLetter = (letterObj) => {
        setUserLetters(prev => prev.filter(l => l.id !== letterObj.id))
        setScrambledLetters(prev => prev.map(l => l.id === letterObj.id ? { ...l, used: false } : l))
    }

    const checkResult = () => {
        const result = userLetters.map(l => l.char).join('')
        if (result === targetWord) {
            setScore(s => s + 10)
            if (currentWordIndex < words.length - 1) {
                setMessage('Правильно! 🎉')
                setTimeout(() => {
                    setCurrentWordIndex(i => i + 1)
                }, 1000)
            } else {
                setGameOver(true)
            }
        } else {
            setMessage('Попробуй еще раз! ❌')
            setTimeout(() => setMessage(''), 1000)
        }
    }

    if (gameOver) {
        return (
            <div className="flex flex-col items-center justify-center p-xl text-center bg-white rounded-xl shadow-lg m-auto" style={{ maxWidth: 400 }}>
                <Trophy size={64} color="var(--cp-amber)" className="mb-m" />
                <h2 className="mb-xs">Победа! 🏆</h2>
                <p className="text-secondary mb-m">Вы собрали все слова в теме "{topic}"!</p>
                <div className="flex gap-m">
                    <button className="btn btn-primary" onClick={() => {
                        setCurrentWordIndex(0)
                        setScore(0)
                        setGameOver(false)
                    }}>
                        <RotateCcw size={18} /> Сначала
                    </button>
                    <button className="btn btn-secondary" onClick={onExit}>Выход</button>
                </div>
            </div>
        )
    }

    return (
        <div className="word-builder-game p-m">
            <div className="flex justify-between items-center mb-xl">
                <div>
                    <span className="badge badge-primary">{topic}</span>
                    <h2 className="mt-xs">Собери слово</h2>
                </div>
                <div className="text-right">
                    <span className="text-secondary text-sm">СЛОВО</span>
                    <div className="text-2xl font-bold">{currentWordIndex + 1} / {words.length}</div>
                </div>
            </div>

            {/* Target Word Display (Slots) */}
            <div className="flex justify-center gap-s mb-xl">
                {targetWord.split('').map((_, i) => (
                    <div
                        key={i}
                        onClick={() => userLetters[i] && removeLetter(userLetters[i])}
                        style={{
                            width: 50,
                            height: 60,
                            border: '2px dashed #cbd5e1',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            background: userLetters[i] ? 'var(--cp-primary)' : 'white',
                            color: userLetters[i] ? 'white' : 'transparent',
                            cursor: userLetters[i] ? 'pointer' : 'default',
                            transition: 'all 0.2s'
                        }}
                    >
                        {userLetters[i]?.char}
                    </div>
                ))}
            </div>

            {/* Scrambled Letters (Available) */}
            <div className="flex flex-wrap justify-center gap-m mb-xl">
                {scrambledLetters.map((l) => (
                    <button
                        key={l.id}
                        disabled={l.used}
                        onClick={() => handleLetterClick(l)}
                        className={`btn btn-lg ${l.used ? 'opacity-20' : ''}`}
                        style={{
                            width: 50,
                            height: 60,
                            fontSize: '24px',
                            fontWeight: 'bold',
                            boxShadow: l.used ? 'none' : '0 4px 0 var(--cp-primary-dark)',
                            transform: l.used ? 'translateY(4px)' : 'none'
                        }}
                    >
                        {l.char}
                    </button>
                ))}
            </div>

            <div className="flex flex-col items-center gap-m">
                {message && <div className={`text-xl font-bold ${message.includes('Правильно') ? 'text-green-600' : 'text-red-500'}`}>{message}</div>}
                <button
                    className="btn btn-primary btn-lg px-xl"
                    onClick={checkResult}
                    disabled={userLetters.length !== targetWord.length}
                >
                    <CheckCircle2 size={20} /> Проверить
                </button>
            </div>

            <p className="text-center text-sm text-secondary mt-xl">
                Нажимай на буквы, чтобы составить слово 🧩
            </p>
        </div>
    )
}
