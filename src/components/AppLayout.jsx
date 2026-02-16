import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Sparkles, Wrench, Gamepad2, LogOut, Settings } from 'lucide-react'

export default function AppLayout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : 'CP'

    return (
        <>
            <header className="app-header">
                <NavLink to="/" className="app-logo">ClassPlay</NavLink>

                <nav className="app-nav">
                    <NavLink to="/generators" className={({ isActive }) => isActive ? 'active' : ''}>
                        <Sparkles size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
                        Генераторы
                    </NavLink>
                    <NavLink to="/tools" className={({ isActive }) => isActive ? 'active' : ''}>
                        <Wrench size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
                        Инструменты
                    </NavLink>
                    <NavLink to="/games" className={({ isActive }) => isActive ? 'active' : ''}>
                        <Gamepad2 size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
                        Игры
                    </NavLink>
                </nav>

                <div className="app-profile">
                    {user?.license && <span className="badge badge-green">Лицензия активна</span>}
                    <div className="app-profile-avatar">{initials}</div>
                    <span className="font-medium text-sm">{user?.name || 'Учитель'}</span>
                    <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Выйти">
                        <LogOut size={16} />
                    </button>
                </div>
            </header>

            <Outlet />
        </>
    )
}
