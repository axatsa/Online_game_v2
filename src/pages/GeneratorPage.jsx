import { useParams, useNavigate } from 'react-router-dom'
import MathGenerator from '../generators/MathGenerator'
import CrosswordGenerator from '../generators/CrosswordGenerator'
import { ArrowLeft } from 'lucide-react'

export default function GeneratorPage() {
    const { type } = useParams()
    const navigate = useNavigate()

    const renderGenerator = () => {
        switch (type) {
            case 'math': return <MathGenerator />
            case 'crossword': return <CrosswordGenerator />
            default: return (
                <div className="page text-center">
                    <h2>Генератор не найден</h2>
                    <button className="btn btn-secondary" onClick={() => navigate('/generators')} style={{ marginTop: 16 }}>
                        <ArrowLeft size={16} /> Назад
                    </button>
                </div>
            )
        }
    }

    return renderGenerator()
}
