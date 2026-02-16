import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import BrainTugMain from '../games/BrainTug/BrainTugMain'
import RouletteTool from '../tools/RouletteTool'

export default function ToolPage() {
    const { toolId } = useParams()
    const navigate = useNavigate()

    const handleExit = () => navigate('/tools')

    switch (toolId) {
        case 'brain-tug':
            return <BrainTugMain onExit={handleExit} />
        case 'roulette':
            return <RouletteTool onExit={handleExit} />
        default:
            return (
                <div className="page text-center">
                    <h2>Инструмент не найден</h2>
                    <button className="btn btn-secondary" onClick={handleExit} style={{ marginTop: 16 }}>
                        <ArrowLeft size={16} /> Назад
                    </button>
                </div>
            )
    }
}
