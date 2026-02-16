import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import { Award, BookOpen, Gamepad2, TrendingUp } from 'lucide-react'
import './ProfilePage.css'

const MOCK_BADGES = [
    { id: 1, name: 'Первый шаг', icon: '🎯', earned: true },
    { id: 2, name: 'Быстрый ум', icon: '⚡', earned: true },
    { id: 3, name: 'Командный игрок', icon: '🤝', earned: true },
    { id: 4, name: 'Мастер памяти', icon: '🧠', earned: false },
    { id: 5, name: 'Непобедимый', icon: '🏆', earned: false },
    { id: 6, name: 'Полиглот', icon: '🌍', earned: false },
    { id: 7, name: 'Учёный', icon: '🔬', earned: false },
    { id: 8, name: 'Гений математики', icon: '🧮', earned: true },
]

const MOCK_HISTORY = [
    { game: 'Brain Tug', result: 'Победа', xp: '+75', time: '2 часа назад' },
    { game: 'Memory Matrix', result: 'Уровень 5', xp: '+50', time: '5 часов назад' },
    { game: 'Math Sprint', result: 'Рекорд!', xp: '+40', time: 'Вчера' },
]

export default function ProfilePage() {
    const { user, isGuest } = useAuth()
    const xp = user?.xp || 0
    const level = user?.level || Math.floor(xp / 100) + 1

    return (
        <div className="profile-wrapper">
            <Header />
            <main className="container">
                {/* Profile Header */}
                <div className="profile-header animate-fade-in">
                    <div className="avatar avatar-xl">
                        {(user?.name || 'Г')[0].toUpperCase()}
                    </div>
                    <div className="profile-header-info">
                        <h1>{isGuest ? 'Гость' : user?.name}</h1>
                        {!isGuest && (
                            <span className="badge badge-primary" style={{ fontSize: '0.85rem' }}>
                                {user?.grade ? `${user.grade} класс` : 'Ученик'}
                            </span>
                        )}
                        <p className="profile-status">
                            {level >= 10 ? '🏆 Математический гений' : level >= 5 ? '⭐ Опытный ученик' : '🌱 Начинающий исследователь'}
                        </p>
                    </div>
                    <div className="profile-header-stats">
                        <div className="stat-widget hero-stat-level">
                            <span className="stat-label">Уровень</span>
                            <span className="stat-value">{level}</span>
                        </div>
                        <div className="stat-widget hero-stat-xp">
                            <span className="stat-label">XP</span>
                            <span className="stat-value">{xp}</span>
                        </div>
                    </div>
                </div>

                <div className="profile-grid">
                    {/* Badges */}
                    <section className="profile-section animate-slide-up">
                        <h3><Award size={20} /> Достижения</h3>
                        <div className="badges-grid">
                            {MOCK_BADGES.map(badge => (
                                <div
                                    key={badge.id}
                                    className={`badge-item ${badge.earned ? 'earned' : 'locked'}`}
                                    title={badge.name}
                                >
                                    <span className="badge-item-icon">{badge.icon}</span>
                                    <span className="badge-item-name">{badge.name}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Stats */}
                    <section className="profile-section animate-slide-up">
                        <h3><TrendingUp size={20} /> Статистика</h3>
                        <div className="profile-stat-bars">
                            <StatBar label="Математика" value={75} color="var(--primary)" />
                            <StatBar label="Логика" value={60} color="#7C3AED" />
                            <StatBar label="Память" value={45} color="#2563EB" />
                            <StatBar label="Английский" value={30} color="#059669" />
                            <StatBar label="Наука" value={20} color="#D97706" />
                        </div>
                    </section>

                    {/* History */}
                    <section className="profile-section profile-section-full animate-slide-up">
                        <h3><Gamepad2 size={20} /> Последние игры</h3>
                        <div className="profile-history">
                            {MOCK_HISTORY.map((entry, i) => (
                                <div key={i} className="history-row">
                                    <span className="history-game">{entry.game}</span>
                                    <span className="badge badge-success">{entry.result}</span>
                                    <span className="history-xp">{entry.xp} XP</span>
                                    <span className="history-time">{entry.time}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}

function StatBar({ label, value, color }) {
    return (
        <div className="stat-bar">
            <div className="stat-bar-header">
                <span>{label}</span>
                <span className="stat-bar-value">{value}%</span>
            </div>
            <div className="stat-bar-track">
                <div className="stat-bar-fill" style={{ width: `${value}%`, background: color }} />
            </div>
        </div>
    )
}
