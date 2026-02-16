import { useState } from 'react'
import { UserPlus, Search, MoreHorizontal, CheckCircle, XCircle, Pencil, Trash2 } from 'lucide-react'

const MOCK_TEACHERS = [
    { id: 1, name: 'Дильноза Каримова', school: 'Школа №42', email: 'dilnoza@mail.uz', expires: '2026-12-31', status: 'active' },
    { id: 2, name: 'Бобур Рахимов', school: 'Школа №15', email: 'bobur@mail.uz', expires: '2026-06-30', status: 'active' },
    { id: 3, name: 'Озода Назарова', school: 'Лицей №3', email: 'ozoda@mail.uz', expires: '2025-12-31', status: 'blocked' },
    { id: 4, name: 'Фарход Усманов', school: 'Школа №88', email: 'farhod@mail.uz', expires: '2026-09-15', status: 'active' },
    { id: 5, name: 'Нилуфар Ахмедова', school: 'Гимназия №1', email: 'nilufar@mail.uz', expires: '2026-03-01', status: 'active' },
]

export default function AdminDashboard() {
    const [teachers, setTeachers] = useState(MOCK_TEACHERS)
    const [search, setSearch] = useState('')

    const filtered = teachers.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.school.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="animate-fade">
            <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem' }}>Управление учителями</h1>
                    <p className="text-secondary text-sm">{teachers.length} учителей в системе</p>
                </div>
                <button className="btn btn-primary">
                    <UserPlus size={18} /> Добавить учителя
                </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 24, maxWidth: 400 }}>
                <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--cp-text-muted)' }} />
                <input className="input" placeholder="Поиск по имени или школе..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: 40 }}
                />
            </div>

            {/* Table */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Учитель</th>
                            <th>Школа</th>
                            <th>Подписка до</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(t => (
                            <tr key={t.id}>
                                <td className="text-muted">#{t.id}</td>
                                <td>
                                    <div className="font-medium">{t.name}</div>
                                    <div className="text-xs text-muted">{t.email}</div>
                                </td>
                                <td>{t.school}</td>
                                <td>{new Date(t.expires).toLocaleDateString('ru-RU')}</td>
                                <td>
                                    {t.status === 'active' ? (
                                        <span className="badge badge-green"><CheckCircle size={12} /> Активен</span>
                                    ) : (
                                        <span className="badge badge-primary"><XCircle size={12} /> Заблокирован</span>
                                    )}
                                </td>
                                <td>
                                    <div className="flex gap-xs">
                                        <button className="btn btn-ghost btn-icon btn-sm"><Pencil size={14} /></button>
                                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--cp-primary)' }}>
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
