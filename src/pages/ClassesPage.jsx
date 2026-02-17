import { useState, useEffect } from 'react'
import { useClassContext } from '../contexts/ClassContext'
import { Plus, Trash2, Check, Users, GraduationCap, BookOpen, Heart, Globe, School, X, Search } from 'lucide-react'

export default function ClassesPage() {
    const { classes, activeClassId, selectClass, addClass, deleteClass, loadingClasses } = useClassContext()
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
            document.getElementById('create_class_modal').close()
            setFormData({ grade: '', topic: '', interests: '', language: 'ru' })
        }
    }

    const handleSelect = (cls) => {
        selectClass(cls)
    }

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-800 tracking-tight mb-2">Мои классы</h1>
                    <p className="text-slate-500 text-lg max-w-2xl">
                        Создавайте классы, добавляйте учеников и настраивайте контекст для персонализированных заданий.
                    </p>
                </div>
                <button
                    onClick={() => document.getElementById('create_class_modal').showModal()}
                    className="btn btn-primary btn-lg shadow-lg shadow-indigo-500/20 gap-3 px-8"
                >
                    <Plus size={24} strokeWidth={2.5} />
                    <span>Новый класс</span>
                </button>
            </div>

            {/* Content State */}
            {loadingClasses ? (
                <div className="flex justify-center py-20">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            ) : classes.length === 0 ? (
                /* Empty State Premium */
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center animate-fade-up">
                    <div className="bg-indigo-50 p-8 rounded-full mb-8">
                        <School size={64} className="text-indigo-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Здесь пока пусто</h3>
                    <p className="text-slate-500 mb-8 max-w-md">
                        У вас пока нет сохраненных классов. Создайте первый класс, чтобы начать работу.
                    </p>
                    <button
                        onClick={() => document.getElementById('create_class_modal').showModal()}
                        className="btn btn-primary"
                    >
                        Создать первый класс
                    </button>
                </div>
            ) : (
                /* Grid Layout */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-up">
                    {classes.map(cls => (
                        <div
                            key={cls.id}
                            className={`group relative bg-white rounded-2xl transition-all duration-300 overflow-hidden flex flex-col ${activeClassId == cls.id
                                ? 'ring-2 ring-primary shadow-xl shadow-primary/10'
                                : 'border border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300'
                                }`}
                        >
                            {/* Active Indicator Strip */}
                            {activeClassId == cls.id && (
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary z-10"></div>
                            )}

                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-slate-50 p-3 rounded-xl mb-2">
                                        <GraduationCap size={28} className="text-slate-700" />
                                    </div>
                                    {activeClassId == cls.id ? (
                                        <span className="badge badge-primary gap-1 font-semibold py-3">
                                            <Check size={14} strokeWidth={3} /> Активен
                                        </span>
                                    ) : (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleSelect(cls)}
                                                className="btn btn-xs btn-outline btn-primary"
                                            >
                                                Выбрать
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-3xl font-extrabold text-slate-800 mb-1">{cls.grade}</h3>
                                <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                                    <Globe size={14} />
                                    <span>{cls.language === 'uz' ? "O'zbekcha" : "Русский"}</span>
                                </div>

                                <div className="space-y-3">
                                    {cls.topic ? (
                                        <div className="flex items-start gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                                            <BookOpen size={16} className="mt-0.5 text-primary shrink-0" />
                                            <span className="line-clamp-2"><strong>Тема:</strong> {cls.topic}</span>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-400 italic p-3">Тема не указана</div>
                                    )}

                                    {cls.interests && (
                                        <div className="flex items-start gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                                            <Heart size={16} className="mt-0.5 text-rose-500 shrink-0" />
                                            <span className="line-clamp-2"><strong>Интересы:</strong> {cls.interests}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedClassForStudents(cls)
                                    }}
                                    className="btn btn-sm btn-ghost hover:bg-white hover:shadow-sm gap-2 flex-1 text-slate-600"
                                >
                                    <Users size={16} /> Ученики
                                </button>
                                <div className="h-4 w-px bg-slate-300 mx-1"></div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (confirm('Удалить этот класс?')) deleteClass(cls.id)
                                    }}
                                    className="btn btn-sm btn-ghost hover:bg-red-50 hover:text-red-600 text-slate-400 px-3"
                                    title="Удалить класс"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Component Modal */}
            <dialog id="create_class_modal" className="modal">
                <div className="modal-box w-11/12 max-w-2xl bg-white rounded-3xl p-0 overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-xl text-slate-800">Создание нового класса</h3>
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-slate-700">
                                <X size={20} />
                            </button>
                        </form>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-slate-700">Название класса</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <GraduationCap size={18} className="text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Например: 5-А"
                                        className="input input-bordered w-full pl-10 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold text-lg"
                                        value={formData.grade}
                                        onChange={e => setFormData({ ...formData, grade: e.target.value })}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-slate-700">Язык обучения</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Globe size={18} className="text-slate-400" />
                                    </div>
                                    <select
                                        className="select select-bordered w-full pl-10 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        value={formData.language}
                                        onChange={e => setFormData({ ...formData, language: e.target.value })}
                                    >
                                        <option value="ru">Русский</option>
                                        <option value="uz">O'zbekcha</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-control md:col-span-2">
                                <label className="label">
                                    <span className="label-text font-semibold text-slate-700">Текущая тема обучения</span>
                                    <span className="label-text-alt text-slate-400">Влияет на генерацию</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <BookOpen size={18} className="text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Например: Обыкновенные дроби"
                                        className="input input-bordered w-full pl-10 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        value={formData.topic}
                                        onChange={e => setFormData({ ...formData, topic: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-control md:col-span-2">
                                <label className="label">
                                    <span className="label-text font-semibold text-slate-700">Интересы учеников</span>
                                    <span className="label-text-alt text-slate-400">Для персонализации задач</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Heart size={18} className="text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Например: Футбол, Minecraft, Космос"
                                        className="input input-bordered w-full pl-10 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        value={formData.interests}
                                        onChange={e => setFormData({ ...formData, interests: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 pt-4 flex justify-end gap-3">
                                <form method="dialog">
                                    <button className="btn btn-ghost">Отмена</button>
                                </form>
                                <button type="submit" className="btn btn-primary px-8">
                                    Создать класс
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </dialog>

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
    const { fetchStudents, token } = useClassContext()
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

        const res = await fetch(`/api/classes/${cls.id}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token || localStorage.getItem('token')}` },
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up ring-1 ring-white/50">
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Список учеников</h3>
                        <p className="text-sm text-slate-500 font-medium">{cls.grade}</p>
                    </div>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-slate-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleAdd} className="flex gap-2 mb-6">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Plus size={18} className="text-slate-400" />
                            </div>
                            <input
                                className="input input-bordered w-full pl-10"
                                placeholder="Добавить ученика (Имя Фамилия)"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-square">
                            <Plus size={24} />
                        </button>
                    </form>

                    <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center py-8 text-primary">
                                <span className="loading loading-spinner"></span>
                            </div>
                        ) : students.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <Users size={32} className="mx-auto text-slate-300 mb-2" />
                                <p className="text-slate-400 font-medium">Список пуст</p>
                            </div>
                        ) : (
                            students.map(s => (
                                <div key={s.id} className="group flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                            {s.name.charAt(0)}
                                        </div>
                                        <span className="font-semibold text-slate-700">{s.name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(s.id)}
                                        className="btn btn-ghost btn-xs text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
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
