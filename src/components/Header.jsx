import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
    Sparkles,
    Wrench,
    Gamepad2,
    LogOut,
    Settings,
    GraduationCap,
    Menu,
    X,
    User,
    ChevronDown
} from 'lucide-react'
import { useState } from 'react'

export default function Header() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : 'T'

    const navItems = [
        { path: '/classes', label: 'Мой Класс', icon: GraduationCap },
        { path: '/generators', label: 'Генераторы', icon: Sparkles },
        { path: '/tools', label: 'Инструменты', icon: Wrench },
        { path: '/games', label: 'Библиотека Игр', icon: Gamepad2 },
    ]

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg transition-transform group-hover:scale-105">
                            C
                        </div>
                        <span className="font-bold text-xl text-slate-800 tracking-tight">ClassPlay</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                                    ${isActive
                                        ? 'bg-red-50 text-red-700 shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                                `}
                            >
                                <item.icon size={18} strokeWidth={2} />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Right Section */}
                    <div className="hidden md:flex items-center gap-4">
                        {user?.role === 'admin' && (
                            <Link
                                to="/admin"
                                className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                                title="Админ-панель"
                            >
                                <Settings size={20} />
                            </Link>
                        )}

                        <div className="dropdown dropdown-end">
                            <button tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
                                <div className="bg-slate-800 text-white rounded-full w-10 shadow-md ring ring-white ring-offset-2">
                                    <span className="text-sm font-bold">{initials}</span>
                                </div>
                            </button>
                            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-xl menu menu-sm dropdown-content bg-white rounded-box w-52 border border-slate-100">
                                <li className="menu-title px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    {user?.name || 'Учитель'}
                                </li>
                                <li>
                                    <Link to="/profile" className="py-2">
                                        <User size={16} /> Профиль
                                    </Link>
                                </li>
                                <div className="divider my-1"></div>
                                <li>
                                    <button onClick={handleLogout} className="text-red-600 hover:bg-red-50 py-2">
                                        <LogOut size={16} /> Выйти
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-md text-slate-600 hover:bg-slate-100"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-b border-slate-200 animate-slide-up">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium
                                    ${isActive
                                        ? 'bg-red-50 text-red-700'
                                        : 'text-slate-700 hover:bg-slate-50'}
                                `}
                            >
                                <div className={`p-2 rounded-lg ${window.location.pathname === item.path ? 'bg-white' : 'bg-slate-100'}`}>
                                    <item.icon size={20} />
                                </div>
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                    <div className="pt-4 pb-4 border-t border-slate-200">
                        <div className="flex items-center px-5 gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">
                                {initials}
                            </div>
                            <div>
                                <div className="text-base font-medium text-slate-800">{user?.name}</div>
                                <div className="text-sm font-medium text-slate-500">{user?.email}</div>
                            </div>
                        </div>
                        <div className="mt-3 px-2 space-y-1">
                            {user?.role === 'admin' && (
                                <Link
                                    to="/admin"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Админ-панель
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                            >
                                Выйти
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
