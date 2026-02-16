import { useState } from 'react'
import { BrainCircuit, Loader2, Trash2, Save } from 'lucide-react'

export default function AdminQuestions() {
    const [topic, setTopic] = useState('math')
    const [difficulty, setDifficulty] = useState('medium')
    const [language, setLanguage] = useState('ru')
    const [generating, setGenerating] = useState(false)
    const [questions, setQuestions] = useState([])
    const [saved, setSaved] = useState(false)

    const handleGenerate = async () => {
        setGenerating(true)
        setSaved(false)
        try {
            const res = await fetch('/api/questions/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, difficulty, language, count: 10 })
            })
            const data = await res.json()
            if (data.questions) {
                setQuestions(data.questions)
            } else {
                alert(data.error || 'Ошибка генерации')
            }
        } catch (err) {
            alert('Сервис временно недоступен. Попробуйте позже.')
        } finally {
            setGenerating(false)
        }
    }

    const handleQuestionChange = (index, field, value) => {
        const updated = [...questions]
        updated[index] = { ...updated[index], [field]: value }
        setQuestions(updated)
    }

    const handleOptionChange = (qIndex, oIndex, value) => {
        const updated = [...questions]
        updated[qIndex].options[oIndex] = value
        setQuestions(updated)
    }

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index))
    }

    const handleSave = async () => {
        try {
            const res = await fetch('/api/questions/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questions, topic, difficulty, language })
            })
            if (res.ok) {
                setSaved(true)
            } else {
                alert('Ошибка сохранения')
            }
        } catch (err) {
            alert('Ошибка сети')
        }
    }

    return (
        <div className="admin-page animate-fade-in">
            <h1 style={{ marginBottom: 4 }}>Генератор вопросов</h1>
            <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Генерация вопросов с помощью AI</p>

            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
                        <div className="input-group">
                            <label className="input-label">Тема</label>
                            <select className="input" value={topic} onChange={e => setTopic(e.target.value)}>
                                <option value="math">Математика</option>
                                <option value="logic">Логика</option>
                                <option value="english">Английский</option>
                                <option value="science">Наука</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Сложность</label>
                            <select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                                <option value="easy">Лёгкий</option>
                                <option value="medium">Средний</option>
                                <option value="hard">Сложный</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Язык</label>
                            <select className="input" value={language} onChange={e => setLanguage(e.target.value)}>
                                <option value="ru">Русский</option>
                                <option value="uz">Узбекский</option>
                            </select>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
                        {generating ? <><Loader2 size={18} className="spin" /> Генерируем...</> : <><BrainCircuit size={18} /> Сгенерировать пак</>}
                    </button>
                </div>
            </div>

            {/* Questions preview */}
            {questions.length > 0 && (
                <div>
                    <div className="flex-between" style={{ marginBottom: 16 }}>
                        <h3>Предпросмотр ({questions.length} вопросов)</h3>
                        <button className="btn btn-primary" onClick={handleSave}>
                            <Save size={18} /> Сохранить в базу
                        </button>
                    </div>
                    {saved && (
                        <div style={{ background: 'var(--success-light)', color: '#059669', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 16, fontWeight: 500 }}>
                            ✓ Вопросы успешно сохранены!
                        </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {questions.map((q, i) => (
                            <div key={i} className="card">
                                <div className="card-body">
                                    <div className="flex-between" style={{ marginBottom: 12 }}>
                                        <span className="badge badge-info">Вопрос {i + 1}</span>
                                        <button className="btn-icon" style={{ width: 32, height: 32, color: 'var(--error)' }} onClick={() => removeQuestion(i)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="input-group" style={{ marginBottom: 12 }}>
                                        <input
                                            className="input"
                                            value={q.question}
                                            onChange={e => handleQuestionChange(i, 'question', e.target.value)}
                                            placeholder="Текст вопроса"
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                        {q.options?.map((opt, j) => (
                                            <input
                                                key={j}
                                                className="input"
                                                value={opt}
                                                onChange={e => handleOptionChange(i, j, e.target.value)}
                                                style={{
                                                    borderColor: j === q.correctIndex ? 'var(--success)' : undefined,
                                                    background: j === q.correctIndex ? 'var(--success-light)' : undefined
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    )
}
