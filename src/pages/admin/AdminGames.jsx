import { Plus } from 'lucide-react'

const MOCK_GAMES = [
    { id: 1, title: 'Brain Tug', category: 'Логика', difficulty: 'Средний', published: true },
    { id: 2, title: 'Memory Matrix', category: 'Память', difficulty: 'Сложный', published: true },
    { id: 3, title: 'Math Sprint', category: 'Математика', difficulty: 'Лёгкий', published: false },
]

export default function AdminGames() {
    return (
        <div className="admin-page animate-fade-in">
            <div className="flex-between" style={{ marginBottom: 32 }}>
                <div>
                    <h1 style={{ marginBottom: 4 }}>Игры</h1>
                    <p style={{ color: 'var(--muted)' }}>Управление играми платформы</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={18} /> Добавить игру
                </button>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Категория</th>
                            <th>Сложность</th>
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_GAMES.map(game => (
                            <tr key={game.id}>
                                <td>#{game.id}</td>
                                <td style={{ fontWeight: 600 }}>{game.title}</td>
                                <td><span className="badge badge-info">{game.category}</span></td>
                                <td>{game.difficulty}</td>
                                <td>
                                    <span className={`badge ${game.published ? 'badge-success' : 'badge-muted'}`}>
                                        {game.published ? 'Опубликовано' : 'Скрыто'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
