import { Link } from 'react-router-dom'
import { Star, Play, Users, Brain, Calculator, Trophy } from 'lucide-react'

export default function GameCard({ game }) {
    // Helper to get icon based on category
    const getCategoryIcon = (cat) => {
        if (cat === 'Математика') return <Calculator size={14} />
        if (cat === 'Логика') return <Brain size={14} />
        if (cat === 'Все') return <Trophy size={14} />
        return <Star size={14} />
    }

    return (
        <Link
            to={`/game/${game.id}`}
            className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
        >
            {/* Cover Image */}
            <div className="relative h-40 overflow-hidden bg-slate-100">
                <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                    style={{
                        backgroundImage: game.coverUrl ? `url(${game.coverUrl})` : undefined,
                        background: !game.coverUrl ? game.gradient || 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : undefined
                    }}
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />

                {/* Play Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                        <Play size={28} className="text-white ml-1" fill="currentColor" />
                    </div>
                </div>

                {/* Badges */}
                <div className="absolute top-3 right-3">
                    <span className="badge border-none shadow-sm bg-white/90 backdrop-blur text-slate-700 font-semibold gap-1">
                        {getCategoryIcon(game.category)} {game.category}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-red-700 transition-colors">
                        {game.title}
                    </h3>
                </div>

                <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-grow">
                    {game.desc}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                        <Star size={16} fill="currentColor" />
                        <span>{game.rating}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600">
                            {game.difficulty || 'Средний'}
                        </span>
                        {/* 
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                           <Users size={12} /> 2-30
                        </span> 
                        */}
                    </div>
                </div>
            </div>
        </Link>
    )
}
