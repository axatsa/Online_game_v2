import { useState, useEffect, useCallback, useMemo } from 'react'
import { ArrowLeft, RotateCcw, Trophy, Check } from 'lucide-react'

const TOPICS = {
    'География': ['ТОШКЕНТ', 'САМАРКАНД', 'ДАРЬЯ', 'ГОРА', 'СТЕПЬ', 'АРАЛ', 'ХИВА', 'БУХАРА'],
    'Школа': ['УРОК', 'ПАРТА', 'КНИГА', 'РУЧКА', 'КЛАСС', 'ДОСКА', 'МЕЛ', 'ЗВОНОК'],
    'Животные': ['ТИГР', 'СЛОН', 'ВОЛК', 'ЛИСА', 'ЗАЯЦ', 'МЕДВЕДЬ', 'ЕНОТ', 'БЕЛКА']
}

const GRID_SIZE = 10
const CELL_SIZE = 40

export default function WordSearchGame({ config, onFinish, onExit }) {
    const topic = config.topic && TOPICS[config.topic] ? config.topic : 'География'
    const words = useMemo(() => TOPICS[topic], [topic])

    const [grid, setGrid] = useState([])
    const [foundWords, setFoundWords] = useState([])
    const [foundRanges, setFoundRanges] = useState([])
    const [selection, setSelection] = useState([])
    const [isSelecting, setIsSelecting] = useState(false)
    const [gameOver, setGameOver] = useState(false)

    const generateGrid = useCallback(() => {
        const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''))
        const canPlace = (word, r, c, dr, dc) => {
            for (let i = 0; i < word.length; i++) {
                const nr = r + dr * i
                const nc = c + dc * i
                if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) return false
                if (newGrid[nr][nc] !== '' && newGrid[nr][nc] !== word[i]) return false
            }
            return true
        }

        const sortedWords = [...words].sort((a, b) => b.length - a.length)
        for (const word of sortedWords) {
            let placed = false, attempts = 0
            while (!placed && attempts < 100) {
                const r = Math.floor(Math.random() * GRID_SIZE)
                const c = Math.floor(Math.random() * GRID_SIZE)
                const dirs = [[0, 1], [1, 0], [1, 1], [-1, 1]]
                const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)]
                if (canPlace(word, r, c, dr, dc)) {
                    for (let i = 0; i < word.length; i++) newGrid[r + dr * i][c + dc * i] = word[i]
                    placed = true
                }
                attempts++
            }
        }

        const letters = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ'
        for (let r = 0; r < GRID_SIZE; r++)
            for (let c = 0; c < GRID_SIZE; c++)
                if (newGrid[r][c] === '') newGrid[r][c] = letters[Math.floor(Math.random() * letters.length)]

        setGrid(newGrid)
        setFoundWords([])
        setFoundRanges([])
        setSelection([])
        setGameOver(false)
    }, [words])

    useEffect(() => { generateGrid() }, [generateGrid])
    useEffect(() => {
        if (foundWords.length > 0 && foundWords.length === words.length)
            setTimeout(() => setGameOver(true), 500)
    }, [foundWords, words])

    const handleStart = (r, c) => { setIsSelecting(true); setSelection([{ r, c }]) }
    const handleEnter = (r, c) => {
        if (!isSelecting || selection.length === 0) return
        const start = selection[0]
        const dr = r - start.r, dc = c - start.c
        if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
            const steps = Math.max(Math.abs(dr), Math.abs(dc))
            if (steps === 0) return
            const stepR = dr === 0 ? 0 : dr / Math.abs(dr)
            const stepC = dc === 0 ? 0 : dc / Math.abs(dc)
            const newSelection = []
            for (let i = 0; i <= steps; i++) newSelection.push({ r: start.r + stepR * i, c: start.c + stepC * i })
            setSelection(newSelection)
        }
    }
    const handleEnd = () => {
        setIsSelecting(false)
        if (selection.length < 2) { setSelection([]); return }
        const word = selection.map(({ r, c }) => grid[r][c]).join('')
        const reversed = word.split('').reverse().join('')

        if (words.includes(word) && !foundWords.includes(word)) {
            setFoundWords(p => [...p, word])
            setFoundRanges(p => [...p, selection])
        } else if (words.includes(reversed) && !foundWords.includes(reversed)) {
            setFoundWords(p => [...p, reversed])
            setFoundRanges(p => [...p, selection])
        }
        setSelection([])
    }

    if (gameOver) {
        return (
            <div style={{ padding: 40, background: 'white', borderRadius: 24, boxShadow: 'var(--cp-shadow-lg)', maxWidth: 400, margin: '80px auto', textAlign: 'center' }} className="animate-fade">
                <Trophy size={64} color="#F59E0B" style={{ marginBottom: 16 }} />
                <h2 style={{ marginBottom: 8, fontSize: '1.5rem' }}>Все слова найдены! 🕵️‍♂️</h2>
                <button className="btn btn-primary" onClick={generateGrid} style={{ marginTop: 24 }}><RotateCcw size={18} /> Новая игра</button>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', padding: 24, gap: 32 }}>
            <div style={{ display: 'flex', gap: 40, alignItems: 'start', flexWrap: 'wrap', justifyContent: 'center' }}>
                {/* Grid */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                        gap: 4, background: 'white', padding: 16, borderRadius: 16, boxShadow: 'var(--cp-shadow-md)',
                        userSelect: 'none'
                    }}
                    onMouseLeave={() => setIsSelecting(false)}
                    onMouseUp={handleEnd}
                >
                    {grid.map((row, r) => row.map((letter, c) => {
                        const isSelected = selection.some(s => s.r === r && s.c === c)
                        const isFound = foundRanges.some(range => range.some(s => s.r === r && s.c === c))
                        return (
                            <div key={`${r}-${c}`}
                                style={{
                                    width: CELL_SIZE, height: CELL_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '18px', fontWeight: 'bold', borderRadius: 6, cursor: 'pointer',
                                    background: isSelected ? '#3b82f6' : isFound ? '#dcfce7' : '#f1f5f9',
                                    color: isSelected ? 'white' : isFound ? '#15803d' : '#334155',
                                    border: isSelected ? '2px solid #2563eb' : isFound ? '2px solid #86efac' : '2px solid transparent',
                                    transition: 'background 0.1s'
                                }}
                                onMouseDown={() => handleStart(r, c)}
                                onMouseEnter={() => handleEnter(r, c)}
                            >
                                {letter}
                            </div>
                        )
                    }))}
                </div>

                {/* Sidebar */}
                <div style={{ width: 260, background: 'white', padding: 24, borderRadius: 16, boxShadow: 'var(--cp-shadow-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h3 style={{ margin: 0 }}>Слова ({foundWords.length}/{words.length})</h3>
                        <button className="btn btn-icon btn-sm" onClick={generateGrid}><RotateCcw size={16} /></button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {words.map(w => (
                            <div key={w} style={{
                                display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8,
                                background: foundWords.includes(w) ? '#f0fdf4' : '#f8fafc',
                                color: foundWords.includes(w) ? '#16a34a' : '#475569',
                                textDecoration: foundWords.includes(w) ? 'line-through' : 'none',
                                border: '1px solid', borderColor: foundWords.includes(w) ? '#bbf7d0' : '#e2e8f0'
                            }}>
                                {w} {foundWords.includes(w) && <Check size={16} />}
                            </div>
                        ))}
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={onExit} style={{ width: '100%', marginTop: 24 }}>
                        <ArrowLeft size={16} /> Выход
                    </button>
                </div>
            </div>
        </div>
    )
}
