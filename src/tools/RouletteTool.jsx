import { useState, useRef } from 'react'
import { ArrowLeft, RotateCw, Plus, X, UserCircle } from 'lucide-react'

const COLORS = [
    '#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4',
    '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F43F5E'
]

export default function RouletteTool({ onExit }) {
    const [students, setStudents] = useState([
        'Алина', 'Тимур', 'Зарина', 'Дамир'
    ])
    const [newName, setNewName] = useState('')
    const [spinning, setSpinning] = useState(false)
    const [rotation, setRotation] = useState(0)
    const [selected, setSelected] = useState(null)
    const canvasRef = useRef(null)

    const addStudent = () => {
        if (newName.trim() && !students.includes(newName.trim())) {
            setStudents([...students, newName.trim()])
            setNewName('')
        }
    }

    const removeStudent = (name) => {
        setStudents(students.filter(s => s !== name))
    }

    const spin = () => {
        if (spinning || students.length === 0) return
        setSpinning(true)
        setSelected(null)

        const extraSpins = 5 + Math.random() * 5
        const newRotation = rotation + 360 * extraSpins + Math.random() * 360
        setRotation(newRotation)

        setTimeout(() => {
            const normalizedAngle = newRotation % 360
            const sliceAngle = 360 / students.length
            const index = Math.floor((360 - normalizedAngle % 360) / sliceAngle) % students.length
            setSelected(students[index])
            setSpinning(false)
        }, 4000)
    }

    const sliceAngle = students.length > 0 ? 360 / students.length : 360

    return (
        <div style={{
            minHeight: 'calc(100vh - 64px)',
            background: 'var(--cp-bg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 32,
            position: 'relative'
        }}>
            {/* Back */}
            <button className="btn btn-ghost" onClick={onExit}
                style={{ position: 'absolute', top: 16, left: 16 }}>
                <ArrowLeft size={18} /> Назад
            </button>

            <h1 style={{ marginBottom: 8 }}>Рулетка учеников</h1>
            <p className="text-secondary text-sm" style={{ marginBottom: 32 }}>
                Крутите колесо для случайного выбора
            </p>

            {/* Wheel */}
            <div style={{ position: 'relative', marginBottom: 32 }}>
                {/* Pointer */}
                <div style={{
                    position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
                    width: 0, height: 0,
                    borderLeft: '14px solid transparent', borderRight: '14px solid transparent',
                    borderTop: '24px solid var(--cp-primary)',
                    zIndex: 10, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }} />

                <svg width="340" height="340" viewBox="-170 -170 340 340"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))'
                    }}
                >
                    {students.map((name, i) => {
                        const startAngle = i * sliceAngle
                        const endAngle = startAngle + sliceAngle
                        const x1 = 160 * Math.cos((startAngle - 90) * Math.PI / 180)
                        const y1 = 160 * Math.sin((startAngle - 90) * Math.PI / 180)
                        const x2 = 160 * Math.cos((endAngle - 90) * Math.PI / 180)
                        const y2 = 160 * Math.sin((endAngle - 90) * Math.PI / 180)
                        const largeArc = sliceAngle > 180 ? 1 : 0
                        const midAngle = (startAngle + sliceAngle / 2 - 90) * Math.PI / 180
                        const tx = 100 * Math.cos(midAngle)
                        const ty = 100 * Math.sin(midAngle)

                        return (
                            <g key={i}>
                                <path
                                    d={`M0,0 L${x1},${y1} A160,160 0 ${largeArc},1 ${x2},${y2} Z`}
                                    fill={COLORS[i % COLORS.length]}
                                    stroke="white" strokeWidth="2"
                                />
                                <text
                                    x={tx} y={ty}
                                    fill="white"
                                    fontSize={students.length > 8 ? "10" : "12"}
                                    fontWeight="700"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    transform={`rotate(${startAngle + sliceAngle / 2}, ${tx}, ${ty})`}
                                >
                                    {name.length > 8 ? name.slice(0, 7) + '…' : name}
                                </text>
                            </g>
                        )
                    })}
                    <circle cx="0" cy="0" r="24" fill="white" />
                    <circle cx="0" cy="0" r="22" fill="var(--cp-primary)" />
                    <text x="0" y="1" fill="white" fontSize="10" fontWeight="800" textAnchor="middle" dominantBaseline="central">CP</text>
                </svg>
            </div>

            {/* Selected */}
            {selected && (
                <div className="card card-elevated animate-slide" style={{
                    textAlign: 'center', padding: '20px 40px', marginBottom: 24,
                    borderLeft: '4px solid var(--cp-primary)'
                }}>
                    <div className="text-sm text-secondary" style={{ marginBottom: 4 }}>Выбран(а):</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--cp-primary)' }}>{selected}</div>
                </div>
            )}

            {/* Spin Button */}
            <button
                className="btn btn-primary btn-lg"
                onClick={spin}
                disabled={spinning || students.length === 0}
                style={{
                    padding: '18px 64px', fontSize: '1.125rem', borderRadius: 'var(--cp-radius-full)',
                    background: spinning ? 'var(--cp-text-muted)' : 'var(--cp-amber)',
                    boxShadow: spinning ? 'none' : '0 4px 12px rgba(217, 119, 6, 0.4)'
                }}
            >
                <RotateCw size={22} className={spinning ? 'spin' : ''} />
                {spinning ? 'Крутится...' : 'КРУТИТЬ'}
            </button>

            {/* Student List */}
            <div style={{
                marginTop: 32, width: '100%', maxWidth: 600,
                display: 'flex', flexWrap: 'wrap', gap: 8,
                justifyContent: 'center'
            }}>
                {students.map(name => (
                    <div key={name} className="badge" style={{
                        background: 'white', border: '1px solid var(--cp-border)',
                        color: 'var(--cp-text)', padding: '6px 12px', fontSize: '0.875rem',
                        display: 'flex', alignItems: 'center', gap: 6
                    }}>
                        <UserCircle size={14} />
                        {name}
                        <button onClick={() => removeStudent(name)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cp-text-muted)', padding: 0 }}>
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add Student */}
            <div className="flex gap-sm" style={{ marginTop: 16, maxWidth: 400, width: '100%' }}>
                <input className="input" placeholder="Имя ученика..."
                    value={newName} onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addStudent()}
                />
                <button className="btn btn-secondary" onClick={addStudent}><Plus size={18} /></button>
            </div>
        </div>
    )
}
