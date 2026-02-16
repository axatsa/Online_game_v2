import { useState } from 'react'
import { useClassContext } from '../contexts/ClassContext'
import { X, BookOpen, Globe } from 'lucide-react'

export default function ClassProfileModal({ onClose }) {
    const { classCtx, updateContext } = useClassContext()
    const [form, setForm] = useState({ ...classCtx })

    const handleSave = () => {
        updateContext(form)
        onClose()
    }

    const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal animate-slide" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BookOpen size={24} color="var(--cp-primary)" /> Контекст класса
                    </h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={20} /></button>
                </div>

                <p className="text-secondary text-sm" style={{ marginBottom: 24 }}>
                    AI будет учитывать эти данные при генерации материалов.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="form-group">
                        <label className="form-label">Класс</label>
                        <input className="input" placeholder='например, 3 "Б"' value={form.grade} onChange={e => set('grade', e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Уровень знаний</label>
                        <input className="input" placeholder="Сильные в счете, слабые в логике" value={form.level} onChange={e => set('level', e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Текущая тема</label>
                        <input className="input" placeholder="Умножение, Космос, Растения..." value={form.topic} onChange={e => set('topic', e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Интересы учеников</label>
                        <textarea className="textarea" placeholder="Любят задачи про футбол, Гарри Поттера, динозавров..." value={form.interests} onChange={e => set('interests', e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Язык обучения</label>
                        <div className="flex gap-sm">
                            <button
                                className={`btn ${form.language === 'ru' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => set('language', 'ru')}
                                style={{ flex: 1 }}
                            >
                                <Globe size={16} /> Русский
                            </button>
                            <button
                                className={`btn ${form.language === 'uz' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => set('language', 'uz')}
                                style={{ flex: 1 }}
                            >
                                <Globe size={16} /> Ўзбекча
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-sm" style={{ marginTop: 32 }}>
                    <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Отмена</button>
                    <button className="btn btn-primary" onClick={handleSave} style={{ flex: 1 }}>Сохранить контекст</button>
                </div>
            </div>
        </div>
    )
}
