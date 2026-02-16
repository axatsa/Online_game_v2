import { useState, useEffect, useRef } from 'react'
import { useClassContext } from '../contexts/ClassContext'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Sparkles, Download, Printer, Loader2, RefreshCw, Save, Files } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SaveModal from '../components/SaveModal'
import html2canvas from 'html2canvas'

export default function CrosswordGenerator() {
    const { classCtx, buildPrompt } = useClassContext()
    const { token } = useAuth()
    const navigate = useNavigate()

    // Refs for PDF capture
    const puzzleRef = useRef(null)
    const answerRef = useRef(null)

    const [settings, setSettings] = useState({
        topic: classCtx.topic || '',
        wordCount: 10,
        language: classCtx.language || 'ru',
    })
    const [crossword, setCrossword] = useState(null)
    const [loading, setLoading] = useState(false)
    const [savedItems, setSavedItems] = useState([])
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)

    const set = (k, v) => setSettings(p => ({ ...p, [k]: v }))

    useEffect(() => {
        if (token) fetchSaved()
    }, [token])

    const fetchSaved = async () => {
        try {
            const res = await fetch('/api/saved/crossword', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) setSavedItems(await res.json())
        } catch (e) { console.error(e) }
    }

    const handleSave = async (name) => {
        if (!crossword) return
        try {
            await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ type: 'crossword', name, data: crossword })
            })
            fetchSaved()
            alert('Сохранено!')
        } catch (e) { alert('Ошибка сохранения') }
    }

    const loadItem = async (id) => {
        try {
            const res = await fetch(`/api/saved/item/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const item = await res.json()
            setCrossword(item.data)
        } catch (e) { console.error(e) }
    }

    const generate = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/generate/crossword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...settings, classContext: buildPrompt() })
            })
            const data = await res.json()

            if (data.words && data.words.length > 0) {
                const gridData = buildGridFromWords(data.words)
                setCrossword(gridData)
            } else {
                throw new Error('AI не вернул слова')
            }
        } catch (e) {
            console.error(e)
            alert('Не удалось сгенерировать кроссворд через AI. Использую запасной вариант.')
            setCrossword(generateLocalCrossword(settings))
        }
        setLoading(false)
    }

    const downloadPDF = async () => {
        if (!puzzleRef.current || !answerRef.current) return
        const { default: jsPDF } = await import('jspdf')

        try {
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pdfWidth = pdf.internal.pageSize.getWidth()

            // Capture Puzzle Page
            const canvas1 = await html2canvas(puzzleRef.current, { scale: 2, useCORS: true })
            const imgData1 = canvas1.toDataURL('image/png')
            const h1 = (canvas1.height * pdfWidth) / canvas1.width
            pdf.addImage(imgData1, 'PNG', 0, 0, pdfWidth, h1)

            // Add Answer Page
            pdf.addPage()
            const canvas2 = await html2canvas(answerRef.current, { scale: 2, useCORS: true })
            const imgData2 = canvas2.toDataURL('image/png')
            const h2 = (canvas2.height * pdfWidth) / canvas2.width
            pdf.addImage(imgData2, 'PNG', 0, 0, pdfWidth, h2)

            pdf.save(`Кроссворд_${settings.topic || 'ClassPlay'}.pdf`)
        } catch (e) {
            console.error("PDF Error", e)
            alert("Ошибка создания PDF")
        }
    }

    return (
        <div className="split-view">
            <SaveModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onSave={handleSave}
                defaultValue={`Кроссворд: ${settings.topic || ''}`}
            />

            {/* Sidebar with New Order */}
            <div className="split-sidebar">
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/generators')} style={{ marginBottom: 24 }}>
                    <ArrowLeft size={16} /> Назад
                </button>

                <h2 style={{ marginBottom: 4 }}>Кроссворд</h2>
                <p className="text-secondary text-sm" style={{ marginBottom: 24 }}>Генератор тематических кроссвордов</p>

                <button className="btn btn-primary btn-lg btn-full" onClick={generate} disabled={loading} style={{ marginBottom: 32 }}>
                    {loading ? <><Loader2 size={18} className="spin" /> Генерация...</> : <><Sparkles size={18} /> Сгенерировать</>}
                </button>

                {/* 1. Topic */}
                <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label">Тема</label>
                    <input className="input" placeholder="Космос, Растения, Животные..." value={settings.topic} onChange={e => set('topic', e.target.value)} />
                </div>

                {/* 2. Word Count */}
                <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label">Количество слов: {settings.wordCount}</label>
                    <input type="range" min="4" max="15" value={settings.wordCount}
                        onChange={e => set('wordCount', +e.target.value)}
                        style={{ width: '100%', accentColor: 'var(--cp-primary)' }}
                    />
                </div>

                {/* 3. Language */}
                <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label">Язык</label>
                    <div className="flex gap-xs">
                        <button className={`btn btn-sm ${settings.language === 'ru' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => set('language', 'ru')} style={{ flex: 1 }}>Русский</button>
                        <button className={`btn btn-sm ${settings.language === 'uz' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => set('language', 'uz')} style={{ flex: 1 }}>Ўзбекча</button>
                    </div>
                </div>

                {/* 4. Saved Items (At Bottom) */}
                <div style={{ borderTop: '1px solid var(--cp-border)', paddingTop: 24, marginBottom: 32 }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Сохраненные</h3>
                    {savedItems.length === 0 ? (
                        <div className="text-sm text-secondary text-center" style={{ padding: 20, background: 'var(--cp-bg)', borderRadius: 8 }}>
                            Вы пока ничего не сохранили
                        </div>
                    ) : (
                        <div className="flex-col gap-xs">
                            {savedItems.map(item => (
                                <button key={item.id} className="btn btn-secondary btn-sm btn-full"
                                    style={{ justifyContent: 'flex-start', textAlign: 'left', height: 'auto', padding: '10px 12px' }}
                                    onClick={() => loadItem(item.id)}>
                                    <Files size={16} style={{ flexShrink: 0, color: 'var(--cp-text-secondary)' }} />
                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', marginLeft: 8 }}>
                                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--cp-text-muted)' }}>
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Preview Area */}
            <div className="split-main">
                {!crossword ? (
                    <div className="text-center text-secondary" style={{ marginTop: 120 }}>
                        <Sparkles size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                        <p>Укажите тему и нажмите "Сгенерировать"</p>
                        <p className="text-sm text-muted">ИИ подберет слова под вашу тему</p>
                    </div>
                ) : (
                    <>
                        <div className="doc-toolbar">
                            <button className="btn btn-ghost btn-sm" onClick={generate}>
                                <RefreshCw size={14} /> Перегенерировать
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setIsSaveModalOpen(true)}>
                                <Save size={14} /> Сохранить
                            </button>
                            <div style={{ flex: 1 }} />
                            <button className="btn btn-primary btn-sm" onClick={downloadPDF}>
                                <Download size={14} /> Скачать PDF
                            </button>
                        </div>

                        {/* Container for Visual Previews */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#F0F9FF', padding: 40, gap: 40, overflow: 'auto' }}>

                            {/* PAGE 1: PUZZLE */}
                            <div ref={puzzleRef} className="paper-preview animate-slide" style={{
                                background: 'white',
                                padding: '40px',
                                width: '595px',
                                minHeight: '842px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                position: 'relative'
                            }}>
                                <h1 style={{ fontFamily: 'Merriweather, serif', fontSize: '24px', textAlign: 'center', marginBottom: 8 }}>
                                    Кроссворд: {settings.topic || 'Общий'}
                                </h1>
                                <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: 32 }}>
                                    Решите кроссворд, используя подсказки ниже
                                </p>

                                <div style={{ borderBottom: '2px solid #ccc', marginBottom: 32 }} />

                                {/* Grid (Empty Cells) */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${crossword.gridSize}, 30px)`,
                                    gap: 0, // No gap, borders handle it
                                    width: 'fit-content',
                                    margin: '0 auto 40px auto',
                                    border: '2px solid #000' // Outer border
                                }}>
                                    {crossword.grid.flat().map((cell, i) => (
                                        <div key={i} style={{
                                            width: 30, height: 30,
                                            background: 'transparent',
                                            // Only render border if it's a valid cell
                                            border: cell ? '1px solid #000' : 'none',
                                            display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start',
                                            position: 'relative'
                                        }}>
                                            {cell?.number && (
                                                <span style={{ position: 'absolute', top: 1, left: 2, fontSize: '9px', fontWeight: 'bold' }}>
                                                    {cell.number}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Clues */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                                    <div>
                                        <h3 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: 4, marginBottom: 12 }}>По горизонтали</h3>
                                        {crossword.clues.filter(c => c.direction === 'across').map((c, i) => (
                                            <div key={i} style={{ fontSize: '12px', marginBottom: 8 }}>
                                                <strong>{c.number}.</strong> {c.clue}
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: 4, marginBottom: 12 }}>По вертикали</h3>
                                        {crossword.clues.filter(c => c.direction === 'down').map((c, i) => (
                                            <div key={i} style={{ fontSize: '12px', marginBottom: 8 }}>
                                                <strong>{c.number}.</strong> {c.clue}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* PAGE 2: ANSWERS (Visible for Teacher) */}
                            <div ref={answerRef} className="paper-preview" style={{
                                background: 'white',
                                padding: '40px',
                                width: '595px',
                                minHeight: '842px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                position: 'relative'
                            }}>
                                <h1 style={{ fontFamily: 'Merriweather, serif', fontSize: '24px', textAlign: 'center', marginBottom: 8, color: '#DC2626' }}>
                                    Ответы: {settings.topic || 'Общий'}
                                </h1>
                                <div style={{ borderBottom: '2px solid #DC2626', marginBottom: 32 }} />

                                {/* Grid (Filled Cells) */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${crossword.gridSize}, 30px)`,
                                    gap: 0,
                                    width: 'fit-content',
                                    margin: '0 auto 40px auto',
                                    border: '2px solid #000'
                                }}>
                                    {crossword.grid.flat().map((cell, i) => (
                                        <div key={i} style={{
                                            width: 30, height: 30,
                                            background: 'transparent',
                                            border: cell ? '1px solid #000' : 'none',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            position: 'relative',
                                            fontWeight: 'bold',
                                            fontSize: '14px'
                                        }}>
                                            {cell?.letter && cell.letter}
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

// Fixed Grid Algorithm
function buildGridFromWords(wordList) {
    const gridSize = 15
    const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(null))
    const placedWords = []

    // Sort words by length
    const sortedWords = [...wordList].sort((a, b) => b.word.length - a.word.length)
        .map(w => ({ ...w, word: w.word.toUpperCase() }))

    // Place first word
    if (sortedWords.length > 0) {
        const first = sortedWords[0]
        const r = Math.floor(gridSize / 2)
        const c = Math.floor((gridSize - first.word.length) / 2)
        if (canPlace(grid, first.word, r, c, 'across')) {
            placeWord(grid, first.word, r, c, 'across')
            placedWords.push({ ...first, row: r, col: c, dir: 'across' })
        }
    }

    // Place remaining words
    for (let i = 1; i < sortedWords.length; i++) {
        const wordObj = sortedWords[i]
        let best = null

        // Try to intersect
        for (const pw of placedWords) {
            for (let j = 0; j < pw.word.length; j++) {
                const letter = pw.word[j]
                const pR = pw.row + (pw.dir === 'across' ? 0 : j)
                const pC = pw.col + (pw.dir === 'across' ? j : 0)

                for (let k = 0; k < wordObj.word.length; k++) {
                    if (wordObj.word[k] === letter) {
                        const newDir = pw.dir === 'across' ? 'down' : 'across'
                        const startR = pR - (newDir === 'across' ? 0 : k)
                        const startC = pC - (newDir === 'across' ? k : 0)

                        if (canPlace(grid, wordObj.word, startR, startC, newDir)) {
                            best = { row: startR, col: startC, dir: newDir }
                            break
                        }
                    }
                }
                if (best) break
            }
            if (best) break
        }

        if (best) {
            placeWord(grid, wordObj.word, best.row, best.col, best.dir)
            placedWords.push({ ...wordObj, row: best.row, col: best.col, dir: best.dir })
        }
    }

    // Numbering logic
    let clues = []
    let num = 1

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const startsAcross = placedWords.find(w => w.row === r && w.col === c && w.dir === 'across')
            const startsDown = placedWords.find(w => w.row === r && w.col === c && w.dir === 'down')

            if (startsAcross || startsDown) {
                if (grid[r][c]) grid[r][c].number = num

                if (startsAcross) {
                    clues.push({ number: num, word: startsAcross.word, clue: startsAcross.clue, direction: 'across' })
                }
                if (startsDown) {
                    clues.push({ number: num, word: startsDown.word, clue: startsDown.clue, direction: 'down' })
                }
                num++
            }
        }
    }

    return { grid, gridSize, clues }
}

function canPlace(grid, word, row, col, dir) {
    const H = grid.length
    const W = grid[0].length
    if (row < 0 || col < 0) return false
    if (dir === 'across') {
        if (col + word.length > W) return false
        for (let i = 0; i < word.length; i++) {
            const cell = grid[row][col + i]
            if (cell && cell.letter !== word[i]) return false
        }
    } else {
        if (row + word.length > H) return false
        for (let i = 0; i < word.length; i++) {
            const cell = grid[row + i][col]
            if (cell && cell.letter !== word[i]) return false
        }
    }
    return true
}

function placeWord(grid, word, row, col, dir) {
    for (let i = 0; i < word.length; i++) {
        const r = dir === 'across' ? row : row + i
        const c = dir === 'across' ? col + i : col
        if (!grid[r][c]) grid[r][c] = { letter: word[i], number: null }
    }
}

function generateLocalCrossword(settings) {
    const defaultWords = [
        { word: 'КОСМОС', clue: 'Пространство за пределами Земли' },
        { word: 'ПЛАНЕТА', clue: 'Небесное тело, вращающееся вокруг звезды' },
        { word: 'ЗВЕЗДА', clue: 'Светящийся газовый шар' },
        { word: 'РАКЕТА', clue: 'Летательный аппарат для полетов в космос' },
        { word: 'ЛУНА', clue: 'Спутник Земли' }
    ]
    return buildGridFromWords(defaultWords)
}
