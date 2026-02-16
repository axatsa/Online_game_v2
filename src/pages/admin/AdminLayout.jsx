import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Users, BarChart3, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminLayout() {
    const { logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => { logout(); navigate('/login') }

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div style={{ padding: '0 24px 32px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 16 }}>
                    <div style={{ fontFamily: 'var(--cp-font-heading)', fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>
                        ClassPlay
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--cp-text-muted)', marginTop: 4 }}>Панель администратора</div>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>
                        <Users size={18} /> Учителя
                    </NavLink>
                    <NavLink to="/admin/stats" className={({ isActive }) => isActive ? 'active' : ''}>
                        <BarChart3 size={18} /> Статистика
                    </NavLink>
                    <NavLink to="/admin/settings" className={({ isActive }) => isActive ? 'active' : ''}>
                        <Settings size={18} /> Настройки
                    </NavLink>
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: 32 }}>
                    <button onClick={handleLogout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px',
                            color: 'var(--cp-text-muted)', background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '0.9375rem', width: '100%'
                        }}>
                        <LogOut size={18} /> Выйти
                    </button>
                </div>
            </aside>

            <div className="admin-content">
                <Outlet />
            </div>
        </div>
    )
}
