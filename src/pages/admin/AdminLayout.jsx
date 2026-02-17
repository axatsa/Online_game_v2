import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Users, BarChart3, Settings, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminLayout() {
    const { logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => { logout(); navigate('/login') }

    const navLinkClass = ({ isActive }) => `
        flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium
        ${isActive
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
    `

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Dark Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shadow-xl z-20">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-white font-black text-xl tracking-tight">
                        <Shield className="text-blue-500" fill="currentColor" size={24} />
                        ClassPlay
                    </div>
                    <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                        Admin Portal
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    <NavLink to="/admin" end className={navLinkClass}>
                        <Users size={18} /> Учителя
                    </NavLink>
                    <NavLink to="/admin/stats" className={navLinkClass}>
                        <BarChart3 size={18} /> Статистика
                    </NavLink>
                    <NavLink to="/admin/settings" className={navLinkClass}>
                        <Settings size={18} /> Настройки
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-colors text-sm font-medium"
                    >
                        <LogOut size={18} /> Выйти
                    </button>
                    <div className="text-center text-xs text-slate-600 mt-4">
                        v2.1 Enterprise
                    </div>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-slate-50 relative">
                <main className="max-w-7xl mx-auto p-8 animate-fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
