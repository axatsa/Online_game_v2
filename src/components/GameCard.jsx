import { Link } from 'react-router-dom'
import { Star, Play } from 'lucide-react'
import './GameCard.css'

export default function GameCard({ game }) {
    return (
        <Link to={`/game/${game.id}`} className="game-card card card-hover">
            <div className="game-card-image-wrapper">
                <div
                    className="game-card-image"
                    style={{
                        background: game.coverUrl
                            ? `url(${game.coverUrl}) center/cover`
                            : game.gradient || 'linear-gradient(135deg, #991B1B, #0F172A)'
                    }}
                />
                <div className="game-card-play">
                    <Play size={24} fill="white" color="white" />
                </div>
                <span className="game-card-category badge badge-primary">
                    {game.category}
                </span>
            </div>
            <div className="game-card-body">
                <h4 className="game-card-title">{game.title}</h4>
                <p className="game-card-desc">{game.description}</p>
                <div className="game-card-footer">
                    <div className="game-card-rating">
                        <Star size={14} fill="var(--accent-gold)" color="var(--accent-gold)" />
                        <span>{game.rating || '4.8'}</span>
                    </div>
                    <span className="badge badge-muted">{game.difficulty || 'Средний'}</span>
                </div>
            </div>
        </Link>
    )
}
