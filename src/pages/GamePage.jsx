import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function GamePage() {
    const { gameId } = useParams()
    const navigate = useNavigate()

    return (
        <div className="page text-center" style={{ paddingTop: 80 }}>
            <h2>Игра: {gameId}</h2>
            <p className="text-secondary" style={{ marginTop: 8, marginBottom: 24 }}>
                Эта игра скоро будет доступна
            </p>
            <button className="btn btn-secondary" onClick={() => navigate('/games')}>
                <ArrowLeft size={16} /> Назад к играм
            </button>
        </div>
    )
}
