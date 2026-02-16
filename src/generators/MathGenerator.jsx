import { useState, useEffect } from 'react'
import { useClassContext } from '../contexts/ClassContext'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Sparkles, Download, Printer, Loader2, RefreshCw, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function MathGenerator() {
    const { classCtx, buildPrompt } = useClassContext()
    const { token } = useAuth()
    const navigate = useNavigate()

    const [settings, setSettings] = useState({
        numQuestions: 10,
        operations: ['add', 'sub'],
        difficulty: 'medium',
        includeWordProblems: true
    })
    const [worksheet, setWorksheet] = useState(null)
    const [loading, setLoading] = useState(false)
    const [editIdx, setEditIdx] = useState(null)
    const [savedItems, setSavedItems] = useState([])

    const set = (k, v) => setSettings(p => ({ ...p, [k]: v }))

    useEffect(() => {
        if (token) fetchSaved()
    }, [token])

    const fetchSaved = async () => {
        try {
            const res = await fetch('/api/saved/math', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) setSavedItems(await res.json())
        } catch (e) {
            console.error(e)
        }
    }

    const saveWorksheet = async () => {
        if (!worksheet) return
        const name = prompt('Введите название для сохранения:', worksheet.title)
        if (!name) return

        try {
            await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ type: 'math', name, data: worksheet })
            })
            fetchSaved()
            alert('Сохранено!')
        } catch (e) {
            alert('Ошибка сохранения')
        }
    }

    const loadItem = async (id) => {
        try {
            const res = await fetch(`/api/saved/item/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const item = await res.json()
            setWorksheet(item.data)
        } catch (e) { console.error(e) }
    }

    const toggleOp = (op) => {
        set('operations', settings.operations.includes(op)
            ? settings.operations.filter(o => o !== op)
            : [...settings.operations, op]
        )
    }

    const generateWorksheet = async () => {
        setLoading(true)
        try {
            // Try API first
            const res = await fetch('/api/generate/math', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ settings, classContext: buildPrompt() })
            })
            const data = await res.json()
            setWorksheet(data)
        } catch {
            // Fallback: generate locally
            const problems = generateLocal(settings, classCtx)
            setWorksheet({ title: `Рабочий лист: ${classCtx.topic || 'Математика'}`, problems })
        }
        setLoading(false)
    }

    const editProblem = (idx, newText) => {
        setWorksheet(prev => ({
            ...prev,
            problems: prev.problems.map((p, i) => i === idx ? { ...p, question: newText } : p)
        }))
        setEditIdx(null)
    }

    const printSheet = () => window.print()

    const downloadPDF = async () => {
        const { default: jsPDF } = await import('jspdf')
        const doc = new jsPDF()
        const isTwoCol = worksheet.problems.length > 15
        const midPoint = Math.ceil(worksheet.problems.length / 2)

        // --- Page 1: Student Sheet ---
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(18)
        doc.text(worksheet.title, 105, 20, { align: 'center' })

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(`Имя: ____________________   Дата: __________`, 20, 35)

        doc.setFontSize(12)

        worksheet.problems.forEach((p, i) => {
            let x = 20
            let y = 60 + (i * 12)

            if (isTwoCol) {
                if (i < midPoint) {
                    x = 20
                    y = 60 + (i * 12)
                } else {
                    x = 115
                    y = 60 + ((i - midPoint) * 12)
                }
            } else {
                if (y > 260) { doc.addPage(); y = 60 }
            }

            doc.text(`${i + 1}.  ${p.question} = ______`, x, y)
        })

        // Footer
        doc.setFontSize(8)
        doc.text('Создано с помощью ClassPlay AI', 105, 285, { align: 'center' })

        // --- Page 2: Answer Key ---
        doc.addPage()
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(16)
        doc.text(`Ответы: ${worksheet.title}`, 105, 20, { align: 'center' })
        doc.setTextColor(153, 27, 27) // Burgundy for answers

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(12)

        worksheet.problems.forEach((p, i) => {
            let x = 20
            let y = 60 + (i * 10)

            if (isTwoCol) {
                if (i < midPoint) {
                    x = 20
                    y = 60 + (i * 10)
                } else {
                    x = 115
                    y = 60 + ((i - midPoint) * 10)
                }
            }

            doc.text(`${i + 1}.  ${p.answer}`, x, y)
        })

        doc.save(`${worksheet.title}.pdf`)
    }

    return (
        <div className="split-view">
            {/* Sidebar */}
            <div className="split-sidebar">
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/generators')} style={{ marginBottom: 24 }}>
                    <ArrowLeft size={16} /> Назад
                </button>

                <h2 style={{ marginBottom: 4 }}>Математика</h2>
                <p className="text-secondary text-sm" style={{ marginBottom: 24 }}>Генератор рабочих листов</p>

                {/* Operations */}
                <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label">Операции</label>
                    <div className="flex gap-xs" style={{ flexWrap: 'wrap' }}>
                        {[
                            { id: 'add', label: '+ Сложение' },
                            { id: 'sub', label: '- Вычитание' },
                            { id: 'mul', label: '× Умножение' },
                            { id: 'div', label: '÷ Деление' },
                        ].map(op => (
                            <button key={op.id}
                                className={`btn btn-sm ${settings.operations.includes(op.id) ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => toggleOp(op.id)}
                            >{op.label}</button>
                        ))}
                    </div>
                </div>

                {/* Num questions */}
                <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label">Количество примеров: {settings.numQuestions}</label>
                    <input type="range" min="5" max="30" step="5" value={settings.numQuestions}
                        onChange={e => set('numQuestions', +e.target.value)}
                        style={{ width: '100%', accentColor: 'var(--cp-primary)' }}
                    />
                </div>

                {/* Difficulty */}
                <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label">Сложность</label>
                    <div className="flex gap-xs">
                        {[
                            { id: 'easy', label: 'Легко' },
                            { id: 'medium', label: 'Средне' },
                            { id: 'hard', label: 'Сложно' },
                        ].map(d => (
                            <button key={d.id}
                                className={`btn btn-sm ${settings.difficulty === d.id ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => set('difficulty', d.id)}
                                style={{ flex: 1 }}
                            >{d.label}</button>
                        ))}
                    </div>
                </div>

                <button className="btn btn-primary btn-lg btn-full" onClick={generateWorksheet} disabled={loading}>
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
                {!worksheet ? (
                    <div className="text-center text-secondary" style={{ marginTop: 120 }}>
                        <Sparkles size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                        <p>Настройте параметры и нажмите "Сгенерировать"</p>
                    </div>
                ) : (
                    <>
                        {/* Toolbar */}
                        <div className="doc-toolbar">
                            <button className="btn btn-ghost btn-sm" onClick={generateWorksheet} title="Перегенерировать">
                                <RefreshCw size={14} />
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={saveWorksheet} title="Сохранить">
                                <Save size={14} /> Сохранить
                            </button>
                            <div style={{ flex: 1 }} />
                            <button className="btn btn-ghost btn-sm" onClick={printSheet}>
                                <Printer size={14} /> Печать
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={downloadPDF}>
                                <Download size={14} /> Скачать PDF
                            </button>
                        </div>

                        {/* Paper */}
                        <div className="paper-preview animate-slide" style={settings.numQuestions > 15 ? { display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 40 } : {}}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <h2 style={{ fontFamily: 'var(--cp-font-heading)', textAlign: 'center' }}>{worksheet.title}</h2>
                                <div style={{ borderBottom: '1px solid var(--cp-border)', marginBottom: 24 }} />
                            </div>

                            {worksheet.problems.map((p, i) => (
                                <div key={i}
                                    onClick={() => setEditIdx(i)}
                                    style={{
                                        padding: '10px 0',
                                        fontSize: '1.0625rem',
                                        cursor: 'pointer',
                                        borderBottom: '1px dotted var(--cp-border)',
                                        display: 'flex', justifyContent: 'space-between',
                                        breakInside: 'avoid'
                                    }}
                                >
                                    {editIdx === i ? (
                                        <input
                                            className="input"
                                            defaultValue={p.question}
                                            onBlur={e => editProblem(i, e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && editProblem(i, e.target.value)}
                                            autoFocus
                                            style={{ fontSize: '1.0625rem' }}
                                        />
                                    ) : (
                                        <>
                                            <span>{i + 1}. {p.question}</span>
                                            <span style={{ color: 'var(--cp-text-muted)' }}>= ____</span>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

function generateLocal(settings, ctx) {
    const ops = settings.operations
    const n = settings.numQuestions
    const diff = settings.difficulty
    const maxNum = diff === 'easy' ? 10 : diff === 'medium' ? 50 : 100

    return Array.from({ length: n }).map(() => {
        const op = ops[Math.floor(Math.random() * ops.length)]
        let a, b, q, ans
        switch (op) {
            case 'add':
                a = r(1, maxNum); b = r(1, maxNum);
                q = `${a} + ${b}`; ans = a + b;
                break
            case 'sub':
                a = r(10, maxNum); b = r(1, a);
                q = `${a} - ${b}`; ans = a - b;
                break
            case 'mul':
                a = r(2, diff === 'easy' ? 5 : 12); b = r(2, diff === 'easy' ? 5 : 12);
                q = `${a} × ${b}`; ans = a * b;
                break
            case 'div':
                b = r(2, 9); let res = r(1, diff === 'easy' ? 5 : 12);
                a = b * res;
                q = `${a} ÷ ${b}`; ans = res;
                break
            default:
                a = r(1, 10); b = r(1, 10);
                q = `${a} + ${b}`; ans = a + b
        }
        return { question: q, answer: ans }
    })
}

function r(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
