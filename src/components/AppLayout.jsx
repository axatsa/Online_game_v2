import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useClassContext } from '../contexts/ClassContext'
import { Sparkles, Wrench, Gamepad2, LogOut, Settings, GraduationCap, ChevronDown } from 'lucide-react'

export default function AppLayout() {
    const { user, logout } = useAuth()
    const { classes, activeClassId, selectClass } = useClassContext()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : 'CP'

    const activeClass = classes.find(c => c.id == activeClassId)

    return (
        <>
            <header className="app-header">
                <NavLink to="/" className="app-logo">ClassPlay</NavLink>

                <nav className="app-nav">
                    <NavLink to="/classes" className={({ isActive }) => isActive ? 'active' : ''}>
                        <GraduationCap size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
                        Классы
                    </NavLink>
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
                    {user?.role === 'admin' && (
                        <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>
                            <Settings size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
                            Админ-панель
                        </NavLink>
                    )}
                </nav>

                <div className="flex items-center gap-4">
                    {/* Class Selector Dropdown */}
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-sm btn-ghost gap-2 normal-case font-normal border border-base-300">
                            {activeClass ? (
                                <>
                                    <span className="font-bold">{activeClass.grade}</span>
                                    <span className="text-xs text-gray-500 truncate max-w-[80px]">{activeClass.topic}</span>
                                </>
                            ) : (
                                <span className="text-gray-500">Нет класса</span>
                            )}
                            <ChevronDown size={14} />
                        </div>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                            {classes.length > 0 ? (
                                <>
                                    <li className="menu-title">Выберите класс</li>
                                    {classes.map(c => (
                                        <li key={c.id}>
                                            <a onClick={() => selectClass(c)} className={activeClassId == c.id ? 'active' : ''}>
                                                {c.grade}
                                                {c.topic && <span className="opacity-50 text-xs ml-auto">{c.topic}</span>}
                                            </a>
                                        </li>
                                    ))}
                                    <div className="divider my-1"></div>
                                </>
                            ) : (
                                <li className="disabled"><a>Нет сохраненных классов</a></li>
                            )}
                            <li><NavLink to="/classes" className="text-primary"><GraduationCap size={14} /> Управление классами</NavLink></li>
                        </ul>
                    </div>

                    <div className="app-profile">
                        {user?.license && <span className="badge badge-green">PRO</span>}
                        <div className="app-profile-avatar">{initials}</div>
                        <button className="btn btn-ghost btn-sm btn-circle" onClick={handleLogout} title="Выйти">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </header>

            <Outlet />
        </>
    )
}
