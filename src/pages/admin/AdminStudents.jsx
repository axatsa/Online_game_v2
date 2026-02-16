import { useState } from 'react'
import { Search, Plus, MoreVertical, Ban, Trash2, Eye } from 'lucide-react'

const MOCK_STUDENTS = [
    { id: 1, name: 'Александр Иванов', grade: '9A', email: 'alex@thompson.edu', lastLogin: '2 часа назад', xp: 2850, status: 'active' },
    { id: 2, name: 'Мария Козлова', grade: '10Б', email: 'maria@thompson.edu', lastLogin: '5 часов назад', xp: 2640, status: 'active' },
    { id: 3, name: 'Дамир Рахимов', grade: '8В', email: 'damir@thompson.edu', lastLogin: 'Вчера', xp: 2510, status: 'active' },
    { id: 4, name: 'Нодира Саидова', grade: '9A', email: 'nodira@thompson.edu', lastLogin: '3 дня назад', xp: 2380, status: 'blocked' },
    { id: 5, name: 'Тимур Алимов', grade: '11A', email: 'timur@thompson.edu', lastLogin: 'Сегодня', xp: 2250, status: 'active' },
]

export default function AdminStudents() {
    const [search, setSearch] = useState('')

    const filtered = MOCK_STUDENTS.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="admin-page animate-fade-in">
            <div className="flex-between" style={{ marginBottom: 32 }}>
                <div>
                    <h1 style={{ marginBottom: 4 }}>Ученики</h1>
                    <p style={{ color: 'var(--muted)' }}>Управление учениками платформы</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={18} /> Добавить ученика
                </button>
            </div>

            <div className="admin-toolbar" style={{ marginBottom: 20 }}>
                <div className="admin-search-wrapper">
                    <Search size={18} className="admin-search-icon" />
                    <input
                        className="input"
                        placeholder="Поиск по имени или email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 40 }}
                    />
                </div>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Имя</th>
                            <th>Класс</th>
                            <th>Email</th>
                            <th>Последний вход</th>
                            <th>XP</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(student => (
                            <tr key={student.id}>
                                <td>#{student.id}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
                                            {student.name.split(' ').map(w => w[0]).join('')}
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{student.name}</span>
                                        {student.status === 'blocked' && <span className="badge" style={{ background: '#FEE2E2', color: '#DC2626' }}>Заблокирован</span>}
                                    </div>
                                </td>
                                <td><span className="badge badge-primary">{student.grade}</span></td>
                                <td style={{ color: 'var(--muted)' }}>{student.email}</td>
                                <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{student.lastLogin}</td>
                                <td style={{ fontWeight: 700 }}>{student.xp.toLocaleString()}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button className="btn-icon" style={{ width: 32, height: 32 }} title="Статистика">
                                            <Eye size={14} />
                                        </button>
                                        <button className="btn-icon" style={{ width: 32, height: 32 }} title="Заблокировать">
                                            <Ban size={14} />
                                        </button>
                                        <button className="btn-icon" style={{ width: 32, height: 32, color: 'var(--error)' }} title="Удалить">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
