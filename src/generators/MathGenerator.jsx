import { useState, useEffect, useRef } from 'react'
import { useClassContext } from '../contexts/ClassContext'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Sparkles, Download, Printer, Loader2, RefreshCw, Save, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SaveModal from '../components/SaveModal'
import html2canvas from 'html2canvas'

export default function MathGenerator() {
    const { classCtx, buildPrompt } = useClassContext()
    const { token } = useAuth()
    const navigate = useNavigate()
    const printRef = useRef(null)

    const [settings, setSettings] = useState({
        numQuestions: 20,
        operations: ['add', 'sub'],
        difficulty: 'medium',
        includeWordProblems: true
    })
    const [worksheet, setWorksheet] = useState(null)
    const [loading, setLoading] = useState(false)
    const [editIdx, setEditIdx] = useState(null)
    const [savedItems, setSavedItems] = useState([])

    // Save Modal State
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)

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

    const handleSave = async (name) => {
        if (!worksheet) return
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
        const cappedSettings = { ...settings, numQuestions: Math.min(settings.numQuestions, 30) }

        try {
            // Try API first
            const res = await fetch('/api/generate/math', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ settings: cappedSettings, classContext: buildPrompt() })
            })
            const data = await res.json()

            // Post-process to ensure limit
            if (data.problems && data.problems.length > 30) {
                data.problems = data.problems.slice(0, 30)
            }

            setWorksheet(data)
        } catch {
            // Fallback: generate locally
            const problems = generateLocal(cappedSettings, classCtx)
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
        if (!printRef.current) return
        const { default: jsPDF } = await import('jspdf')

        try {
            const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true })
            const imgData = canvas.toDataURL('image/png')

            // A4 size
            const pdf = new jsPDF('p', 'mm', 'a4')
            const w = pdf.internal.pageSize.getWidth()
            const h = (canvas.height * w) / canvas.width

            pdf.addImage(imgData, 'PNG', 0, 0, w, h)
            pdf.save(`${worksheet.title}.pdf`)
        } catch (e) {
            console.error("PDF Error", e)
            alert("Ошибка создания PDF")
        }
    }

    return (
        <div className="split-view">
            {/* Save Modal */}
            <SaveModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onSave={handleSave}
                defaultValue={worksheet?.title}
            />

            {/* Sidebar */}
            <div className="split-sidebar">
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/generators')} style={{ marginBottom: 24 }}>
                    <ArrowLeft size={16} /> Назад
                </button>

                <h2 style={{ marginBottom: 4 }}>Математика</h2>
                <p className="text-secondary text-sm" style={{ marginBottom: 24 }}>Генератор рабочих листов</p>

                <button className="btn btn-primary btn-lg btn-full" onClick={generateWorksheet} disabled={loading} style={{ marginBottom: 32 }}>
                    {loading ? <><Loader2 size={18} className="spin" /> Генерация...</> : <><Sparkles size={18} /> Сгенерировать</>}
                </button>

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

                {/* Saved Items */}
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
                                    style={{ justifyContent: 'flex-start', textAlign: 'left', height: 'auto', padding: '10px' }}
                                    onClick={() => loadItem(item.id)}>
                                    <FileText size={16} style={{ flexShrink: 0, color: 'var(--cp-text-secondary)' }} />
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
                            <button className="btn btn-ghost btn-sm" onClick={() => setIsSaveModalOpen(true)} title="Сохранить">
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

                        {/* Paper Preview Element for capture */}
                        <div className="paper-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
                            {/* Visual Capture Area */}
                            <div ref={printRef} className="paper-preview animate-slide" style={{
                                background: 'white',
                                padding: '40px',
                                minHeight: '842px', // A4 height
                                width: '595px', // A4 width at 72dpi
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>

                                {/* Decorative Header */}
                                <div style={{
                                    borderBottom: '2px solid #3B82F6',
                                    paddingBottom: 20,
                                    marginBottom: 30,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <h2 style={{
                                            fontFamily: 'Merriweather, serif',
                                            fontSize: '28px',
                                            color: '#1E3A8A',
                                            margin: 0
                                        }}>{worksheet.title}</h2>
                                        <div style={{ fontSize: '14px', color: '#666', marginTop: 4 }}>
                                            Классная работа
                                        </div>
                                    </div>
                                    <div style={{
                                        width: 50,
                                        height: 50,
                                        background: '#EFF6FF',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#3B82F6'
                                    }}>
                                        <Sparkles size={24} />
                                    </div>
                                </div>

                                {/* Student Info Row */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: 30,
                                    fontSize: '16px',
                                    gap: 40
                                }}>
                                    <div style={{ flex: 1, borderBottom: '1px solid #ccc', paddingBottom: 4 }}>
                                        <span style={{ color: '#666', marginRight: 8 }}>Имя:</span>
                                    </div>
                                    <div style={{ width: 150, borderBottom: '1px solid #ccc', paddingBottom: 4 }}>
                                        <span style={{ color: '#666', marginRight: 8 }}>Дата:</span>
                                    </div>
                                    <div style={{ width: 100, borderBottom: '1px solid #ccc', paddingBottom: 4 }}>
                                        <span style={{ color: '#666', marginRight: 8 }}>Оценка:</span>
                                    </div>
                                </div>

                                {/* Problems Grid - 3 Columns for compactness */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr 1fr', // 3 columns forced
                                    columnGap: '32px',
                                    rowGap: '24px', // Tighter rows
                                    flex: 1
                                }}>
                                    {worksheet.problems.map((p, i) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '16px', // Readable font size
                                            breakInside: 'avoid',
                                            background: i % 2 === 0 ? '#FAFAFA' : 'transparent', // Zebra striping
                                            padding: '4px 8px',
                                            borderRadius: 4
                                        }}>
                                            <span style={{
                                                width: '28px',
                                                fontWeight: 'bold',
                                                color: '#3B82F6',
                                                fontSize: '14px'
                                            }}>{i + 1}.</span>

                                            {editIdx === i ? (
                                                <input
                                                    className="input"
                                                    defaultValue={p.question}
                                                    onBlur={e => editProblem(i, e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && editProblem(i, e.target.value)}
                                                    autoFocus
                                                    style={{ fontSize: '16px', padding: '0 4px', width: '100px', border: '1px solid #3B82F6' }}
                                                />
                                            ) : (
                                                <span onClick={() => setEditIdx(i)} style={{ cursor: 'pointer', fontFamily: 'monospace', fontSize: '18px' }}>
                                                    {p.question} = ___
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div style={{
                                    marginTop: 'auto',
                                    paddingTop: 20,
                                    borderTop: '1px dashed #ccc',
                                    textAlign: 'center',
                                    fontSize: '10px',
                                    color: '#999',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}>
                                    <span>ClassPlay.uz</span>
                                    <span>Желаем успехов!</span>
                                </div>
                            </div>

                            {/* Answer Key (Visual only, for teacher) */}
                            <div className="paper-preview" style={{ background: 'white', padding: '40px', minHeight: '842px', width: '595px', position: 'relative' }}>
                                <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#DC2626' }}>Ответы для учителя</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
                                    {worksheet.problems.map((p, i) => (
                                        <div key={i} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                                            <strong style={{ color: '#DC2626' }}>{i + 1}.</strong> {p.answer}
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

function generateLocal(settings, ctx) {
    const ops = settings.operations
    const n = Math.min(settings.numQuestions, 30) // Cap at 30
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
