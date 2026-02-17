import { useState, useEffect } from 'react'
import { useClassContext } from '../contexts/ClassContext'
import { Plus, Trash2, Check, Users, GraduationCap, BookOpen, Heart, Globe } from 'lucide-react'

export default function ClassesPage() {
    const { classes, activeClassId, selectClass, addClass, deleteClass, loadingClasses } = useClassContext()
    const [isCreating, setIsCreating] = useState(false)
    const [selectedClassForStudents, setSelectedClassForStudents] = useState(null)
    const [formData, setFormData] = useState({
        grade: '',
        topic: '',
        interests: '',
        language: 'ru'
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        const success = await addClass(formData)
        if (success) {
            setIsCreating(false)
            setFormData({ grade: '', topic: '', interests: '', language: 'ru' })
        }
    }

    const handleSelect = (cls) => {
        selectClass(cls)
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Мои классы</h1>
                    <p className="text-gray-500">Управляйте классами и контекстом для генерации заданий</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="btn btn-primary gap-2"
                >
                    <Plus size={20} />
                    Добавить класс
                </button>
            </div>

            {/* Creation Form Modal/Card */}
            {isCreating && (
                <div className="mb-8 card bg-base-100 shadow-xl border border-base-200">
                    <div className="card-body">
                        <h2 className="card-title text-xl mb-4">Новый класс</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text flex items-center gap-2"><GraduationCap size={16} /> Класс / Группа</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Например: 5-А"
                                    className="input input-bordered w-full"
                                    value={formData.grade}
                                    onChange={e => setFormData({ ...formData, grade: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text flex items-center gap-2"><BookOpen size={16} /> Текущая тема</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Например: Дроби"
                                    className="input input-bordered w-full"
                                    value={formData.topic}
                                    onChange={e => setFormData({ ...formData, topic: e.target.value })}
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text flex items-center gap-2"><Heart size={16} /> Интересы учеников</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Например: Футбол, Minecraft"
                                    className="input input-bordered w-full"
                                    value={formData.interests}
                                    onChange={e => setFormData({ ...formData, interests: e.target.value })}
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text flex items-center gap-2"><Globe size={16} /> Язык обучения</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={formData.language}
                                    onChange={e => setFormData({ ...formData, language: e.target.value })}
                                >
                                    <option value="ru">Русский</option>
                                    <option value="uz">O'zbekcha</option>
                                </select>
                            </div>

                            <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => setIsCreating(false)}
                                >
                                    Отмена
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Сохранить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Classes List */}
            {loadingClasses ? (
                <div className="text-center py-10">Загрузка...</div>
            ) : classes.length === 0 ? (
                <div className="text-center py-16 bg-base-100 rounded-xl border border-dashed border-base-300">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-500">У вас пока нет сохраненных классов</h3>
                    <p className="text-gray-400 mb-6">Создайте класс, чтобы быстро применять настройки к играм</p>
                    <button onClick={() => setIsCreating(true)} className="btn btn-primary btn-sm">
                        Создать первый класс
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map(cls => (
                        <div
                            key={cls.id}
                            className={`card bg-base-100 shadow-md hover:shadow-lg transition-all border-2 ${activeClassId == cls.id ? 'border-primary' : 'border-transparent'
                                }`}
                        >
                            <div className="card-body p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="card-title text-2xl">{cls.grade}</h3>
                                    {activeClassId == cls.id && (
                                        <span className="badge badge-primary gap-1">
                                            <Check size={12} /> Активен
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 text-sm text-gray-600 mb-6">
                                    {cls.topic && (
                                        <div className="flex items-start gap-2">
                                            <BookOpen size={16} className="mt-0.5 opacity-70" />
                                            <span><strong>Тема:</strong> {cls.topic}</span>
                                        </div>
                                    )}
                                    {cls.interests && (
                                        <div className="flex items-start gap-2">
                                            <Heart size={16} className="mt-0.5 opacity-70" />
                                            <span><strong>Интересы:</strong> {cls.interests}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Globe size={16} className="opacity-70" />
                                        <span>{cls.language === 'uz' ? "O'zbekcha" : "Русский"}</span>
                                    </div>
                                </div>

                                <div className="card-actions justify-between mt-auto items-center pt-4 border-t border-base-200">
                                    <div className="flex gap-2">
                                        <button
                                            className="btn btn-ghost btn-sm text-error"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                if (confirm('Удалить этот класс?')) deleteClass(cls.id)
                                            }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedClassForStudents(cls)
                                            }}
                                            title="Ученики"
                                        >
                                            <Users size={18} />
                                        </button>
                                    </div>

                                    <button
                                        className={`btn btn-sm ${activeClassId == cls.id ? 'btn-neutral' : 'btn-outline'}`}
                                        onClick={() => handleSelect(cls)}
                                    >
                                        {activeClassId == cls.id ? 'Выбран' : 'Выбрать'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Students Modal */}
            {selectedClassForStudents && (
                <StudentsModal
                    cls={selectedClassForStudents}
                    onClose={() => setSelectedClassForStudents(null)}
                />
            )}
        </div>
    )
}

function StudentsModal({ cls, onClose }) {
    const { fetchStudents, token } = useClassContext() // using fetchStudents from context
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [newName, setNewName] = useState('')

    useEffect(() => {
        loadData()
    }, [cls.id])

    const loadData = async () => {
        setLoading(true)
        const data = await fetchStudents(cls.id)
        setStudents(data)
        setLoading(false)
    }

    const handleAdd = async (e) => {
        e.preventDefault()
        if (!newName.trim()) return

        // Direct fetch here or add helper in context - doing direct for speed
        const res = await fetch(`/api/classes/${cls.id}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token || localStorage.getItem('token')}` }, // simple hack for token
            body: JSON.stringify({ name: newName })
        })
        if (res.ok) {
            const updated = await res.json()
            setStudents(updated)
            setNewName('')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Удалить ученика?')) return
        await fetch(`/api/students/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token || localStorage.getItem('token')}` }
        })
        setStudents(prev => prev.filter(s => s.id !== id))
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-up">
                <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold">Ученики: {cls.grade}</h3>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">✕</button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleAdd} className="flex gap-2 mb-6">
                        <input
                            className="input input-bordered flex-1"
                            placeholder="Имя Фамилия"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className="btn btn-primary">
                            <Plus size={18} />
                        </button>
                    </form>

                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {loading ? (
                            <div className="text-center py-4">Загрузка...</div>
                        ) : students.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                Список пуст. Добавьте учеников.
                            </div>
                        ) : (
                            students.map(s => (
                                <div key={s.id} className="flex justify-between items-center p-3 bg-base-100 rounded-lg border hover:bg-slate-50">
                                    <span className="font-medium">{s.name}</span>
                                    <button onClick={() => handleDelete(s.id)} className="btn btn-ghost btn-xs text-gray-400 hover:text-error">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
