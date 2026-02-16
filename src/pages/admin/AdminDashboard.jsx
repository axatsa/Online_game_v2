import { useState, useEffect } from 'react'
import { UserPlus, Search, CheckCircle, XCircle, Pencil, Trash2, Key, BarChart3, Save, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminDashboard() {
    const { token } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [teachers, setTeachers] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingTeacher, setEditingTeacher] = useState(null)
    const [newPassword, setNewPassword] = useState('')

    useEffect(() => {
        fetchTeachers()
    }, [])

    const fetchTeachers = async () => {
        try {
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                // Filter only teachers or show all? Let's show all for now
                setTeachers(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const filtered = teachers.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleEdit = (teacher) => {
        setEditingTeacher({ ...teacher })
        setNewPassword('')
    }

    const handleSave = async () => {
        if (!editingTeacher) return

        try {
            const payload = {
                name: editingTeacher.name,
                email: editingTeacher.email,
                school: editingTeacher.school,
            }
            if (newPassword) payload.password = newPassword

            const res = await fetch(`/api/admin/users/${editingTeacher.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                // simple notification (could be a component, but for now modal close + refresh is enough feedback)
                setEditingTeacher(null)
                fetchTeachers()
            } else {
                console.error("Update failed")
            }
        } catch (e) {
            console.error(e)
        }
    }

    // --- Create User Logic ---
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [newUser, setNewUser] = useState({ name: '', email: '', school: '', password: 'demo123(temp)' })

    const handleCreate = async () => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newUser)
            })

            if (res.ok) {
                setIsCreateModalOpen(false)
                setNewUser({ name: '', email: '', school: '', password: 'demo123' })
                fetchTeachers()
            } else {
                const data = await res.json()
                alert(data.error || 'Ошибка создания') // Fallback if needed, but ideally show in modal
            }
        } catch (e) {
            console.error(e)
        }
    }

    if (loading) return <div className="flex justify-center p-xl"><Loader2 className="spin" /></div>

    return (
        <div className="animate-fade">
            <div className="flex justify-between items-center" style={{ marginBottom: 32 }}>
                <div>
                    <h1>Управление пользователями</h1>
                    <p className="text-secondary">Список пользователей и статистика</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                    <UserPlus size={18} /> Добавить
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 32 }}>
                <div className="card flex items-center gap-md">
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--cp-blue-light)', color: 'var(--cp-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <div className="text-secondary text-sm">Всего пользователей</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{teachers.length}</div>
                    </div>
                </div>
                <div className="card flex items-center gap-md">
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--cp-green-light)', color: 'var(--cp-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <div className="text-secondary text-sm">Всего генераций</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                            {teachers.reduce((acc, t) => acc + (t.generated_count || 0), 0)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="card" style={{ padding: 16, marginBottom: 24, display: 'flex', gap: 16 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--cp-text-muted)' }} />
                    <input
                        className="input"
                        placeholder="Поиск по имени или email..."
                        style={{ paddingLeft: 40 }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Пользователь</th>
                            <th>Школа / Роль</th>
                            <th>Статус</th>
                            <th>Генераций</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(t => (
                            <tr key={t.id}>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{t.name}</div>
                                    <div className="text-xs text-secondary">{t.email}</div>
                                </td>
                                <td>
                                    <div>{t.school || '—'}</div>
                                    <div className="badge badge-secondary" style={{ display: 'inline-block', marginTop: 4, transform: 'scale(0.9)', transformOrigin: 'left' }}>
                                        {t.role === 'admin' ? 'Админ' : 'Учитель'}
                                    </div>
                                </td>
                                <td>
                                    {new Date(t.subscription_end) > new Date() ? (
                                        <span className="badge badge-green"><CheckCircle size={12} /> Активен</span>
                                    ) : (
                                        <span className="badge badge-amber">Истек</span>
                                    )}
                                </td>
                                <td>
                                    <div className="flex items-center gap-xs">
                                        <BarChart3 size={14} className="text-muted" />
                                        <strong>{t.generated_count || 0}</strong>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex gap-xs">
                                        <button className="btn btn-secondary btn-icon" title="Редактировать" onClick={() => handleEdit(t)}>
                                            <Pencil size={16} />
                                        </button>
                                        <button className="btn btn-secondary btn-icon" style={{ color: 'var(--cp-primary)' }} title="Удалить" onClick={() => alert('Удаление пока недоступно')}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingTeacher && (
                <div className="modal-overlay" onClick={() => setEditingTeacher(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Редактирование</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setEditingTeacher(null)}><XCircle size={24} /></button>
                        </div>

                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label">Имя</label>
                            <input className="input" value={editingTeacher.name} onChange={e => setEditingTeacher({ ...editingTeacher, name: e.target.value })} />
                        </div>

                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label">Школа</label>
                            <input className="input" value={editingTeacher.school || ''} onChange={e => setEditingTeacher({ ...editingTeacher, school: e.target.value })} />
                        </div>

                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label">Email (Логин)</label>
                            <input className="input" value={editingTeacher.email} onChange={e => setEditingTeacher({ ...editingTeacher, email: e.target.value })} />
                        </div>

                        <div className="form-group" style={{ marginBottom: 24 }}>
                            <label className="form-label">Новый пароль (пусто - не менять)</label>
                            <div style={{ position: 'relative' }}>
                                <Key size={18} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--cp-text-muted)' }} />
                                <input
                                    className="input"
                                    type="password"
                                    placeholder="Введите новый пароль..."
                                    style={{ paddingLeft: 40 }}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-sm justify-end">
                            <button className="btn btn-secondary" onClick={() => setEditingTeacher(null)}>Отмена</button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                <Save size={18} /> Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Добавить пользователя</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setIsCreateModalOpen(false)}><XCircle size={24} /></button>
                        </div>

                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label">Имя</label>
                            <input className="input" placeholder="Иван Иванов" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                        </div>

                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label">Школа</label>
                            <input className="input" placeholder="Школа №1" value={newUser.school} onChange={e => setNewUser({ ...newUser, school: e.target.value })} />
                        </div>

                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label">Email</label>
                            <input className="input" placeholder="email@example.com" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                        </div>

                        <div className="form-group" style={{ marginBottom: 24 }}>
                            <label className="form-label">Пароль</label>
                            <input className="input" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                        </div>

                        <div className="flex gap-sm justify-end">
                            <button className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Отмена</button>
                            <button className="btn btn-primary" onClick={handleCreate}>
                                <UserPlus size={18} /> Создать
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
