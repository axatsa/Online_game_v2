import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Flame, Search, LogOut, Menu, X, Shield } from 'lucide-react'
import { useState } from 'react'
import './Header.css'

const NAV_ITEMS = [
    { path: '/', label: 'Обучение' },
    { path: '/leaderboard', label: 'Рейтинг' },
    { path: '/profile', label: 'Профиль' },
]

export default function Header() {
    const { user, isGuest, isAdmin, logout } = useAuth()
    const location = useLocation()
    const [menuOpen, setMenuOpen] = useState(false)

    const getInitials = (name) => {
        if (!name) return '?'
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    }

    return (
        <header className="header">
            <div className="header-inner container">
                {/* Logo */}
                <Link to="/" className="header-logo">
                    <div className="header-logo-icon">T</div>
                    <span className="header-logo-text">THOMPSON</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="header-nav">
                    {NAV_ITEMS.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`header-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                    {isAdmin && (
                        <Link
                            to="/admin"
                            className={`header-nav-item ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                        >
                            <Shield size={16} /> Админ
                        </Link>
                    )}
                </nav>

                {/* Right */}
                <div className="header-right">
                    {/* Streak */}
                    {!isGuest && user?.streak > 0 && (
                        <div className="header-streak" title="Дней подряд">
                            <Flame size={18} className="header-streak-icon" />
                            <span>{user.streak}</span>
                        </div>
                    )}

                    {/* Avatar */}
                    <div className="header-user">
                        <div className="avatar">
                            {getInitials(user?.name)}
                        </div>
                        <div className="header-user-info">
                            <span className="header-user-name">
                                {isGuest ? 'Гость' : user?.name}
                            </span>
                            {isGuest && <span className="badge badge-muted" style={{ fontSize: '0.65rem' }}>Гость</span>}
                        </div>
                    </div>

                    <button className="btn-icon" onClick={logout} title="Выйти">
                        <LogOut size={18} />
                    </button>

                    {/* Mobile burger */}
                    <button className="header-burger" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="header-mobile-menu animate-slide-down">
                    {NAV_ITEMS.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`header-mobile-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            {item.label}
                        </Link>
                    ))}
                    {isAdmin && (
                        <Link
                            to="/admin"
                            className="header-mobile-item"
                            onClick={() => setMenuOpen(false)}
                        >
                            <Shield size={16} /> Админ-панель
                        </Link>
                    )}
                    <button className="header-mobile-item" onClick={logout} style={{ color: 'var(--error)' }}>
                        <LogOut size={16} /> Выйти
                    </button>
                </div>
            )}
        </header>
    )
}
