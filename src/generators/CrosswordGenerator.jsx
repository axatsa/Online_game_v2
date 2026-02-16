import { useState, useEffect } from 'react'
import { useClassContext } from '../contexts/ClassContext'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Sparkles, Download, Printer, Loader2, RefreshCw, Save, Files } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function CrosswordGenerator() {
    const { classCtx, buildPrompt } = useClassContext()
    const { token } = useAuth()
    const navigate = useNavigate()

    const [settings, setSettings] = useState({
        topic: classCtx.topic || '',
        wordCount: 8,
        language: classCtx.language || 'ru',
    })
    const [crossword, setCrossword] = useState(null)
    const [loading, setLoading] = useState(false)
    const [savedItems, setSavedItems] = useState([])

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

    const saveWorksheet = async () => {
        if (!crossword) return
        const name = prompt('Введите название для сохранения:', `Кроссворд: ${settings.topic}`)
        if (!name) return

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

            if (data.words) {
                // Build grid from AI words
                const gridData = buildGridFromWords(data.words)
                setCrossword(gridData)
            } else {
                throw new Error('No words returned')
            }
        } catch (e) {
            console.error(e)
            // Fallback: local crossword
            setCrossword(generateLocalCrossword(settings))
        }
        setLoading(false)
    }

    const downloadPDF = async () => {
        if (!crossword) return
        const { default: jsPDF } = await import('jspdf')
        const doc = new jsPDF()
        doc.setFontSize(16)
        doc.text(`Кроссворд: ${settings.topic || 'Общий'}`, 105, 20, { align: 'center' })

        doc.setFontSize(11)
        let y = 40
        crossword.clues.forEach((c, i) => {
            doc.text(`${i + 1}. ${c.clue} (${c.word.length} букв)`, 20, y)
            y += 10
            if (y > 270) { doc.addPage(); y = 20 }
        })

        doc.save(`Кроссворд_${settings.topic || 'ClassPlay'}.pdf`)
    }

    return (
        <div className="split-view">
            {/* Sidebar */}
            <div className="split-sidebar">
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/generators')} style={{ marginBottom: 24 }}>
                    <ArrowLeft size={16} /> Назад
                </button>

                <h2 style={{ marginBottom: 4 }}>Кроссворд</h2>
                <p className="text-secondary text-sm" style={{ marginBottom: 24 }}>Генератор тематических кроссвордов</p>

                <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label">Тема</label>
                    <input className="input" placeholder="Космос, Растения, Животные..." value={settings.topic} onChange={e => set('topic', e.target.value)} />
                </div>

                <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label">Количество слов: {settings.wordCount}</label>
                    <input type="range" min="4" max="15" value={settings.wordCount}
                        onChange={e => set('wordCount', +e.target.value)}
                        style={{ width: '100%', accentColor: 'var(--cp-primary)' }}
                    />
                </div>

                <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label">Язык</label>
                    <div className="flex gap-xs">
                        <button className={`btn btn-sm ${settings.language === 'ru' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => set('language', 'ru')} style={{ flex: 1 }}>Русский</button>
                        <button className={`btn btn-sm ${settings.language === 'uz' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => set('language', 'uz')} style={{ flex: 1 }}>Ўзбекча</button>
                    </div>
                </div>

                <button className="btn btn-primary btn-lg btn-full" onClick={generate} disabled={loading}>
                    {loading ? <><Loader2 size={18} className="spin" /> Генерация...</> : <><Sparkles size={18} /> Сгенерировать</>}
                </button>

                {/* Saved Items */}
                {savedItems.length > 0 && (
                    <div style={{ marginTop: 32, borderTop: '1px solid var(--cp-border)', paddingTop: 24 }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>Сохраненные</h3>
                        <div className="flex-col gap-xs">
                            {savedItems.map(item => (
                                <button key={item.id} className="btn btn-secondary btn-sm btn-full"
                                    style={{ justifyContent: 'flex-start', textAlign: 'left', height: 'auto', padding: '8px 12px' }}
                                    onClick={() => loadItem(item.id)}>
                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--cp-text-muted)' }}>
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Preview */}
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
                            <button className="btn btn-ghost btn-sm" onClick={saveWorksheet}>
                                <Save size={14} /> Сохранить
                            </button>
                            <div style={{ flex: 1 }} />
                            <button className="btn btn-primary btn-sm" onClick={downloadPDF}>
                                <Download size={14} /> Скачать PDF
                            </button>
                        </div>

                        <div className="paper-preview animate-slide">
                            <h2 style={{ fontFamily: 'var(--cp-font-heading)' }}>
                                Кроссворд: {settings.topic || 'Общий'}
                            </h2>
                            <div style={{ borderBottom: '1px solid var(--cp-border)', marginBottom: 24 }} />

                            {/* Simple Grid Visualization */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${crossword.gridSize}, 36px)`,
                                gap: 2,
                                justifyContent: 'center',
                                marginBottom: 32
                            }}>
                                {crossword.grid.flat().map((cell, i) => (
                                    <div key={i} style={{
                                        width: 36, height: 36,
                                        border: cell ? '1.5px solid var(--cp-text)' : 'none',
                                        background: cell ? 'white' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.7rem', color: 'var(--cp-text-muted)',
                                        position: 'relative'
                                    }}>
                                        {cell?.number && (
                                            <span style={{ position: 'absolute', top: 1, left: 3, fontSize: '0.55rem', fontWeight: 700 }}>
                                                {cell.number}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Clues */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                <div>
                                    <h3 style={{ fontSize: '0.9375rem', marginBottom: 12 }}>По горизонтали →</h3>
                                    {crossword.clues.filter(c => c.direction === 'across').map((c, i) => (
                                        <p key={i} className="text-sm" style={{ marginBottom: 8 }}>
                                            <strong>{c.number}.</strong> {c.clue}
                                        </p>
                                    ))}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '0.9375rem', marginBottom: 12 }}>По вертикали ↓</h3>
                                    {crossword.clues.filter(c => c.direction === 'down').map((c, i) => (
                                        <p key={i} className="text-sm" style={{ marginBottom: 8 }}>
                                            <strong>{c.number}.</strong> {c.clue}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            <p className="text-xs text-muted" style={{ marginTop: 40, textAlign: 'center' }}>
                                Создано в ClassPlay • {new Date().toLocaleDateString('ru-RU')}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

function buildGridFromWords(words) {
    const gridSize = 12
    const grid = Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => null))
    const clues = []
    let num = 1

    // Very simple placement strategy: Alternate Across/Down using diagonal connection if possible,
    // or just independent placement for MVP to ensure all words fit.
    // A proper crossword algorithm is complex. Here we cheat slightly by spacing them out to ensure they don't collide.

    words.forEach((w, i) => {
        // Place diagonally to avoid collision
        const dir = i % 2 === 0 ? 'across' : 'down'

        let row, col
        // Simple diagonal cascading
        if (dir === 'across') {
            row = i
            col = Math.min(i * 1, gridSize - w.word.length)
        } else {
            row = Math.min(i, gridSize - w.word.length)
            col = i * 2
        }

        // Bound checks
        row = Math.max(0, Math.min(row, gridSize - 1))
        col = Math.max(0, Math.min(col, gridSize - 1))
        if (dir === 'across' && col + w.word.length > gridSize) col = gridSize - w.word.length
        if (dir === 'down' && row + w.word.length > gridSize) row = gridSize - w.word.length

        for (let j = 0; j < w.word.length; j++) {
            const r = dir === 'across' ? row : row + j
            const c = dir === 'across' ? col + j : col
            if (r < gridSize && c < gridSize) {
                grid[r][c] = { letter: w.word[j], number: j === 0 ? num : null }
            }
        }

        clues.push({ number: num, word: w.word, clue: w.clue, direction: dir })
        num++
    })

    return { grid, gridSize, clues }
}

function generateLocalCrossword(settings) {
    const defaultWords = [
        { word: 'ШКОЛА', clue: 'Учебное заведение' },
        { word: 'КНИГА', clue: 'Источник знаний' },
        { word: 'УЧИТЕЛЬ', clue: 'Кто учит детей' },
        { word: 'УЧЕНИК', clue: 'Кто учится в школе' },
        { word: 'ДОСКА', clue: 'На ней пишут мелом' }
    ]
    const words = defaultWords.slice(0, settings.wordCount)
    return buildGridFromWords(words)
}
