import { useState } from 'react'
import { X } from 'lucide-react'

export default function SaveModal({ isOpen, onClose, onSave, defaultValue = '', title = 'Сохранить рабочий лист' }) {
    const [name, setName] = useState(defaultValue)

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal animate-slide" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.25rem' }}>{title}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="form-group" style={{ marginBottom: 24 }}>
                    <label className="form-label">Название</label>
                    <input
                        className="input"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        autoFocus
                        placeholder="Введите название..."
                    />
                </div>

                <div className="flex justify-end gap-sm">
                    <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
                    <button className="btn btn-primary" onClick={() => { onSave(name); onClose() }}>
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    )
}
