import Header from '../components/Header'
import { Trophy, Medal, Award } from 'lucide-react'
import './LeaderboardPage.css'

const MOCK_LEADERS = [
    { id: 1, name: 'Александр И.', grade: '9A', xp: 2850, avatar: 'АИ' },
    { id: 2, name: 'Мария К.', grade: '10Б', xp: 2640, avatar: 'МК' },
    { id: 3, name: 'Дамир Р.', grade: '8В', xp: 2510, avatar: 'ДР' },
    { id: 4, name: 'Нодира С.', grade: '9A', xp: 2380, avatar: 'НС' },
    { id: 5, name: 'Тимур А.', grade: '11A', xp: 2250, avatar: 'ТА' },
    { id: 6, name: 'Камила Б.', grade: '10A', xp: 2100, avatar: 'КБ' },
    { id: 7, name: 'Жасур М.', grade: '8Б', xp: 1980, avatar: 'ЖМ' },
    { id: 8, name: 'Алина В.', grade: '9Б', xp: 1870, avatar: 'АВ' },
    { id: 9, name: 'Саид Х.', grade: '11Б', xp: 1750, avatar: 'СХ' },
    { id: 10, name: 'Лола Ф.', grade: '10Б', xp: 1640, avatar: 'ЛФ' },
]

const MEDAL_COLORS = ['#F59E0B', '#9CA3AF', '#D97706']
const MEDAL_ICONS = [Trophy, Medal, Award]

export default function LeaderboardPage() {
    return (
        <div className="leaderboard-wrapper">
            <Header />
            <main className="container">
                <div className="leaderboard-header animate-fade-in">
                    <h1>Рейтинг учеников</h1>
                    <p className="leaderboard-subtitle">Лучшие из лучших по набранному опыту</p>
                </div>

                {/* Top 3 */}
                <div className="top-three animate-slide-up">
                    {MOCK_LEADERS.slice(0, 3).map((leader, i) => {
                        const Icon = MEDAL_ICONS[i]
                        return (
                            <div key={leader.id} className={`top-card top-card-${i + 1}`}>
                                <div className="top-card-medal" style={{ color: MEDAL_COLORS[i] }}>
                                    <Icon size={32} />
                                </div>
                                <div className="avatar avatar-lg" style={{
                                    border: `3px solid ${MEDAL_COLORS[i]}`,
                                    boxShadow: `0 0 20px ${MEDAL_COLORS[i]}33`
                                }}>
                                    {leader.avatar}
                                </div>
                                <h3 className="top-card-name">{leader.name}</h3>
                                <span className="badge badge-primary">{leader.grade}</span>
                                <div className="top-card-xp">{leader.xp.toLocaleString()} XP</div>
                            </div>
                        )
                    })}
                </div>

                {/* Leaderboard table */}
                <div className="leaderboard-list animate-slide-up">
                    {MOCK_LEADERS.slice(3).map((leader, i) => (
                        <div key={leader.id} className="leaderboard-row">
                            <span className="leaderboard-rank">{i + 4}</span>
                            <div className="avatar">{leader.avatar}</div>
                            <div className="leaderboard-info">
                                <span className="leaderboard-name">{leader.name}</span>
                                <span className="badge badge-muted">{leader.grade}</span>
                            </div>
                            <span className="leaderboard-xp">{leader.xp.toLocaleString()} XP</span>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}
