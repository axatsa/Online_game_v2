import { useState, useEffect, useCallback, useMemo } from 'react'
import { ArrowLeft, RotateCcw, Trophy, Check } from 'lucide-react'

// Extended Topics
const TOPICS = {
    'География': ['ТОШКЕНТ', 'САМАРКАНД', 'ДАРЬЯ', 'ГОРА', 'СТЕПЬ', 'АРАЛ', 'ХИВА', 'БУХАРА', 'НАВОИ', 'ФЕРГАНА'],
    'Школа': ['УРОК', 'ПАРТА', 'КНИГА', 'РУЧКА', 'КЛАСС', 'ДОСКА', 'МЕЛ', 'ЗВОНОК', 'ПЕНАЛ', 'ОЦЕНКА'],
    'Животные': ['ТИГР', 'СЛОН', 'ВОЛК', 'ЛИСА', 'ЗАЯЦ', 'МЕДВЕДЬ', 'ЕНОТ', 'БЕЛКА', 'ЁЖИК', 'ЛЕВ'],
    'Еда': ['ПЛОВ', 'ХЛЕБ', 'МЯСО', 'СУП', 'ЧАЙ', 'САЛАТ', 'ТОРТ', 'ДЫНЯ', 'ЯБЛОКО', 'ОРЕХ'],
    'Космос': ['МАРС', 'ЛУНА', 'ЗВЕЗДА', 'КОМЕТА', 'РАКЕТА', 'СОЛНЦЕ', 'НЕБО', 'ЗЕМЛЯ', 'САТУРН', 'ОРБИТА']
}

const GRID_SIZE = 12 // Increased grid size
const CELL_SIZE = 48 // Increased cell size

export default function WordSearchGame({ config, onFinish, onExit }) {
    const topic = config.topic && TOPICS[config.topic] ? config.topic : 'География'
    const difficulty = config.difficulty || 'medium'

    // Select subset of words based on difficulty? Or just use all but directions change.
    // Let's use 8 words for easy, 10 for medium/hard.
    const allWords = TOPICS[topic] || TOPICS['География']
    const wordsCount = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 8 : 10

    // Memoize words to prevent regeneration loop
    const words = useMemo(() => {
        // Shuffle and slice
        return [...allWords].sort(() => 0.5 - Math.random()).slice(0, wordsCount)
    }, [allWords, wordsCount])

    const [grid, setGrid] = useState([])
    const [foundWords, setFoundWords] = useState([])
    const [foundRanges, setFoundRanges] = useState([])
    const [selection, setSelection] = useState([])
    const [isSelecting, setIsSelecting] = useState(false)
    const [gameOver, setGameOver] = useState(false)

    const generateGrid = useCallback(() => {
        const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''))

        // Define allowed directions based on difficulty
        let allowedDirs = [[0, 1]] // Horizontal (always allowed)
        if (difficulty !== 'easy') {
            allowedDirs.push([1, 0]) // Vertical
        }
        if (difficulty === 'hard') {
            allowedDirs.push([1, 1], [-1, 1]) // Diagonals
        }

        const canPlace = (word, r, c, dr, dc) => {
            for (let i = 0; i < word.length; i++) {
                const nr = r + dr * i
                const nc = c + dc * i
                if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) return false
                if (newGrid[nr][nc] !== '' && newGrid[nr][nc] !== word[i]) return false
            }
            return true
        }

        // Place Words
        // Sort by length desc to place long words first
        const sortedWords = [...words].sort((a, b) => b.length - a.length)

        for (const word of sortedWords) {
            let placed = false, attempts = 0
            while (!placed && attempts < 200) {
                const r = Math.floor(Math.random() * GRID_SIZE)
                const c = Math.floor(Math.random() * GRID_SIZE)
                const [dr, dc] = allowedDirs[Math.floor(Math.random() * allowedDirs.length)]

                if (canPlace(word, r, c, dr, dc)) {
                    for (let i = 0; i < word.length; i++) {
                        newGrid[r + dr * i][c + dc * i] = word[i]
                    }
                    placed = true
                }
                attempts++
            }
            if (!placed) console.warn(`Could not place word: ${word}`)
        }

        // Fill empty
        const letters = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ'
        for (let r = 0; r < GRID_SIZE; r++)
            for (let c = 0; c < GRID_SIZE; c++)
                if (newGrid[r][c] === '') newGrid[r][c] = letters[Math.floor(Math.random() * letters.length)]

        setGrid(newGrid)
        setFoundWords([])
        setFoundRanges([])
        setSelection([])
        setGameOver(false)
    }, [words, difficulty])

    useEffect(() => { generateGrid() }, [generateGrid])

    useEffect(() => {
        if (words.length > 0 && foundWords.length === words.length) {
            setTimeout(() => setGameOver(true), 1000)
        }
    }, [foundWords, words])

    // --- Interaction Handlers ---
    const handleStart = (r, c) => { setIsSelecting(true); setSelection([{ r, c }]) }

    const handleEnter = (r, c) => {
        if (!isSelecting || selection.length === 0) return
        const start = selection[0]
        const dr = r - start.r
        const dc = c - start.c

        // Lock to 8 directions (horizontal, vertical, diagonal)
        if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
            const steps = Math.max(Math.abs(dr), Math.abs(dc))
            if (steps === 0) { // Same cell
                setSelection([start])
                return
            }

            const stepR = dr === 0 ? 0 : dr / Math.abs(dr)
            const stepC = dc === 0 ? 0 : dc / Math.abs(dc)

            const newSelection = []
            for (let i = 0; i <= steps; i++) {
                newSelection.push({ r: start.r + stepR * i, c: start.c + stepC * i })
            }
            setSelection(newSelection)
        }
    }

    const handleEnd = () => {
        setIsSelecting(false)
        if (selection.length < 2) { setSelection([]); return }

        const word = selection.map(({ r, c }) => grid[r][c]).join('')
        const reversed = word.split('').reverse().join('')

        const isForward = words.includes(word) && !foundWords.includes(word)
        const isBackward = words.includes(reversed) && !foundWords.includes(reversed)

        if (isForward || isBackward) {
            const foundWord = isForward ? word : reversed
            setFoundWords(p => [...p, foundWord])
            setFoundRanges(p => [...p, selection])
            // Play sound?
        }
        setSelection([])
    }

    if (gameOver) {
        return (
            <div style={{ padding: 40, background: 'white', borderRadius: 24, boxShadow: 'var(--cp-shadow-lg)', maxWidth: 400, margin: '80px auto', textAlign: 'center' }} className="animate-fade">
                <Trophy size={64} color="#F59E0B" style={{ marginBottom: 16 }} />
                <h2 style={{ marginBottom: 8, fontSize: '1.5rem' }}>Все слова найдены! 🕵️‍♂️</h2>
                <div style={{ margin: '16px 0', color: '#64748b' }}>
                    Тема: {topic} <br />
                    Сложность: {difficulty === 'easy' ? 'Легко' : difficulty === 'medium' ? 'Средне' : 'Сложно'}
                </div>
                <button className="btn btn-primary" onClick={generateGrid} style={{ marginTop: 24 }}><RotateCcw size={18} /> Новая игра</button>
                <div className="mt-4">
                    <button className="btn btn-ghost btn-sm" onClick={onExit}>Выход</button>
                </div>
            </div>
        )
    }

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center',
            background: '#f8fafc', padding: '20px'
        }}>
            <div style={{
                display: 'flex', gap: 40, alignItems: 'start', justifyContent: 'center',
                maxWidth: '1200px', width: '100%'
            }}>
                {/* Grid Container */}
                <div
                    style={{
                        background: 'white', padding: 20, borderRadius: 24,
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        userSelect: 'none',
                        border: '4px solid #e2e8f0'
                    }}
                    onMouseLeave={() => setIsSelecting(false)}
                    onMouseUp={handleEnd}
                >
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                        gap: 6
                    }}>
                        {grid.map((row, r) => row.map((letter, c) => {
                            const isSelected = selection.some(s => s.r === r && s.c === c)
                            const isFound = foundRanges.some(range => range.some(s => s.r === r && s.c === c))

                            // Check if this cell is part of multiple found words (overlap)
                            // We can just us isFound for now.

                            return (
                                <div key={`${r}-${c}`}
                                    style={{
                                        width: CELL_SIZE, height: CELL_SIZE,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '22px', fontWeight: 'bold', borderRadius: 12, cursor: 'pointer',
                                        background: isSelected ? '#3b82f6' : isFound ? '#dcfce7' : '#f1f5f9',
                                        color: isSelected ? 'white' : isFound ? '#15803d' : '#475569',
                                        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                                        boxShadow: isSelected ? '0 4px 6px rgba(37, 99, 235, 0.3)' : 'none',
                                        transition: 'all 0.15s ease',
                                        zIndex: isSelected ? 10 : 1
                                    }}
                                    onMouseDown={() => handleStart(r, c)}
                                    onMouseEnter={() => handleEnter(r, c)}
                                >
                                    {letter}
                                </div>
                            )
                        }))}
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{
                    width: 300, background: 'white', padding: 24, borderRadius: 24,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    display: 'flex', flexDirection: 'column', height: 'fit-content',
                    border: '1px solid #e2e8f0'
                }}>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 m-0">{topic}</h2>
                            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                                {difficulty === 'easy' ? 'Легко' : difficulty === 'medium' ? 'Средне' : 'Сложно'}
                            </span>
                        </div>
                        <div className="radial-progress text-primary text-xs font-bold"
                            style={{ "--value": (foundWords.length / words.length) * 100, "--size": "3rem" }}>
                            {foundWords.length}/{words.length}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                        {words.map(w => {
                            const found = foundWords.includes(w)
                            return (
                                <div key={w} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '10px 16px', borderRadius: 12,
                                    background: found ? '#f0fdf4' : 'white',
                                    color: found ? '#16a34a' : '#334155',
                                    border: '1px solid', borderColor: found ? '#bbf7d0' : '#e2e8f0',
                                    transition: 'all 0.3s ease',
                                    textDecoration: found ? 'line-through' : 'none',
                                    opacity: found ? 0.8 : 1
                                }}>
                                    <span style={{ fontWeight: 600, fontSize: '16px' }}>{w}</span>
                                    {found && <Check size={18} className="animate-bounce-short" />}
                                </div>
                            )
                        })}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex gap-2">
                        <button className="btn btn-ghost btn-sm flex-1" onClick={generateGrid}>
                            <RotateCcw size={16} /> Сброс
                        </button>
                        <button className="btn btn-secondary btn-sm flex-1" onClick={onExit}>
                            <ArrowLeft size={16} /> Выход
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
