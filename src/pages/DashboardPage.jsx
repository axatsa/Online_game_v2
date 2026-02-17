import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useClassContext } from '../contexts/ClassContext'
import { Sparkles, Wrench, Gamepad2, BookOpen, Settings, ArrowRight, Clock, Users } from 'lucide-react'
import ClassProfileModal from '../components/ClassProfileModal'
import { useState } from 'react'

const QUICK_ACTIONS = [
    {
        title: 'Создать Материал',
        desc: 'PDF, Кроссворды, Тесты',
        icon: Sparkles,
        link: '/generators',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-100'
    },
    {
        title: 'Запустить Игру',
        desc: 'Викторины для класса',
        icon: Gamepad2,
        link: '/games',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-100'
    },
    {
        title: 'Утилиты',
        desc: 'Таймер, Рулетка',
        icon: Wrench,
        link: '/tools',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-100'
    }
]

export default function DashboardPage() {
    const { user } = useAuth()
    const { classCtx, hasContext } = useClassContext()
    const [showProfile, setShowProfile] = useState(false)

    const firstName = user?.name?.split(' ')[0] || 'Учитель'
    const today = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })

    return (
        <div className="space-y-8 animate-fade-up">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Здравствуйте, {firstName} 👋
                    </h1>
                    <p className="text-slate-500 mt-1 capitalize">
                        {today} • Хорошего учебного дня!
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-neutral bg-slate-900 text-white hover:bg-slate-800 gap-2 shadow-lg shadow-slate-200">
                        <Clock size={18} /> Расписание
                    </button>
                </div>
            </div>

            {/* Context Card (Killer Feature) */}
            {user?.role !== 'admin' && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-16 -mt-16 z-0 group-hover:scale-105 transition-transform duration-700"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className={`
                                w-14 h-14 rounded-xl flex items-center justify-center shadow-sm
                                ${hasContext ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}
                            `}>
                                <BookOpen size={28} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    {hasContext ? 'Контекст класса активен' : 'Настройте контекст класса'}
                                </h2>
                                <p className="text-slate-500 text-sm mt-1 max-w-lg">
                                    {hasContext
                                        ? `${classCtx.grade} • ${classCtx.topic} • ${classCtx.language === 'uz' ? 'O\'zbek' : 'Русский'}`
                                        : 'AI адаптирует генерацию материалов под интересы и уровень ваших учеников.'
                                    }
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowProfile(true)}
                            className="btn btn-outline border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 gap-2 bg-white shadow-sm"
                        >
                            <Settings size={18} />
                            {hasContext ? 'Настроить' : 'Создать контекст'}
                        </button>
                    </div>
                </div>
            )}

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {QUICK_ACTIONS.map((action, idx) => (
                    <Link
                        key={action.link}
                        to={action.link}
                        className={`
                            group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300
                            hover:-translate-y-1 relative overflow-hidden
                        `}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${action.bg} ${action.color}`}>
                            <action.icon size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                            {action.title}
                        </h3>
                        <p className="text-slate-500 text-sm mt-1 mb-6">
                            {action.desc}
                        </p>
                        <div className={`flex items-center gap-2 text-sm font-medium ${action.color}`}>
                            Открыть <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Stats / Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                {/* Recent Activity Placeholder */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">Недавние уроки</h3>
                        <button className="text-sm text-slate-500 hover:text-red-700">См. все</button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Gamepad2 size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-slate-900">Битва Знаний</div>
                                <div className="text-xs text-slate-500">5 "Б" класс • Математика</div>
                            </div>
                            <div className="text-xs text-slate-400">2 часа назад</div>
                        </div>
                        <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Sparkles size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-slate-900">Кроссворд "Космос"</div>
                                <div className="text-xs text-slate-500">Генератор PDF</div>
                            </div>
                            <div className="text-xs text-slate-400">Вчера</div>
                        </div>
                    </div>
                </div>

                {/* KPI / Stats */}
                <div className="bg-slate-900 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <Users size={20} className="text-red-500" />
                            Ваша статистика
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                <div className="text-3xl font-bold">12</div>
                                <div className="text-slate-400 text-sm">Проведено игр</div>
                            </div>
                            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                <div className="text-3xl font-bold">248</div>
                                <div className="text-slate-400 text-sm">Учеников</div>
                            </div>
                            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm col-span-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold">Lvl. 5</div>
                                        <div className="text-slate-400 text-sm">Уровень геймификации</div>
                                    </div>
                                    <div className="radial-progress text-red-500 text-xs" style={{ "--value": 70, "--size": "3rem" }}>70%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showProfile && <ClassProfileModal onClose={() => setShowProfile(false)} />}
        </div>
    )
}
