import { useState, useEffect, useCallback, useRef } from 'react'
import { Play, Pause, RotateCcw, Trophy } from 'lucide-react'

const GRID_SIZE = 20
const INITIAL_SNAKE = [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 }
]
const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
}

export default function MathSnakeGame({ onFinish, onExit }) {
    const [snake, setSnake] = useState(INITIAL_SNAKE)
    const [direction, setDirection] = useState(DIRECTIONS.UP)
    const [food, setFood] = useState({ x: 5, y: 5, value: 10 })
    const [wrongFood, setWrongFood] = useState([])
    const [problem, setProblem] = useState({ q: '5 + 5', a: 10 })
    const [score, setScore] = useState(0)
    const [gameOver, setGameOver] = useState(false)
    const [paused, setPaused] = useState(false)
    const [speed, setSpeed] = useState(200)

    const gameLoopRef = useRef()

    const generateLevel = useCallback(() => {
        const ops = ['+', '-']
        const op = ops[Math.floor(Math.random() * ops.length)]
        let a, b, ans
        if (op === '+') {
            a = Math.floor(Math.random() * 20)
            b = Math.floor(Math.random() * 20)
            ans = a + b
        } else {
            a = Math.floor(Math.random() * 30) + 10
            b = Math.floor(Math.random() * a)
            ans = a - b
        }
        setProblem({ q: `${a} ${op} ${b}`, a: ans })

        const newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
            value: ans
        }
        setFood(newFood)

        const wrongs = []
        for (let i = 0; i < 3; i++) {
            wrongs.push({
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
                value: ans + Math.floor(Math.random() * 10) - 5 || ans + 1
            })
        }
        setWrongFood(wrongs)
    }, [])

    useEffect(() => {
        generateLevel()
    }, [generateLevel])

    const moveSnake = useCallback(() => {
        if (gameOver || paused) return

        setSnake(prev => {
            const head = prev[0]
            const newHead = {
                x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
                y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE
            }

            // Collision with self
            if (prev.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                setGameOver(true)
                return prev
            }

            const newSnake = [newHead, ...prev]

            // Check food
            if (newHead.x === food.x && newHead.y === food.y) {
                setScore(s => s + 10)
                setSpeed(v => Math.max(100, v - 5))
                generateLevel()
                return newSnake
            }

            // Check wrong food
            if (wrongFood.some(f => f.x === newHead.x && f.y === newHead.y)) {
                setGameOver(true)
                return prev
            }

            newSnake.pop()
            return newSnake
        })
    }, [direction, food, wrongFood, gameOver, paused, generateLevel])

    useEffect(() => {
        gameLoopRef.current = setInterval(moveSnake, speed)
        return () => clearInterval(gameLoopRef.current)
    }, [moveSnake, speed])

    useEffect(() => {
        const handleKeys = (e) => {
            switch (e.key) {
                case 'ArrowUp': if (direction !== DIRECTIONS.DOWN) setDirection(DIRECTIONS.UP); break
                case 'ArrowDown': if (direction !== DIRECTIONS.UP) setDirection(DIRECTIONS.DOWN); break
                case 'ArrowLeft': if (direction !== DIRECTIONS.RIGHT) setDirection(DIRECTIONS.LEFT); break
                case 'ArrowRight': if (direction !== DIRECTIONS.LEFT) setDirection(DIRECTIONS.RIGHT); break
            }
        }
        window.addEventListener('keydown', handleKeys)
        return () => window.removeEventListener('keydown', handleKeys)
    }, [direction])

    if (gameOver) {
        return (
            <div className="flex flex-col items-center justify-center p-xl text-center bg-white rounded-xl shadow-lg m-auto" style={{ maxWidth: 400 }}>
                <Trophy size={64} color="var(--cp-amber)" className="mb-m" />
                <h2 className="mb-xs">Игра окончена!</h2>
                <p className="text-secondary mb-m">Вы набрали {score} очков</p>
                <div className="flex gap-m">
                    <button className="btn btn-primary" onClick={() => {
                        setSnake(INITIAL_SNAKE)
                        setScore(0)
                        setGameOver(false)
                        setSpeed(200)
                        generateLevel()
                    }}>
                        <RotateCcw size={18} /> Сначала
                    </button>
                    <button className="btn btn-secondary" onClick={onExit}>Выход</button>
                </div>
            </div>
        )
    }

    return (
        <div className="math-snake-container">
            <div className="flex justify-between items-center mb-m">
                <div className="bg-primary-light p-s rounded-lg border-2 border-primary">
                    <span className="text-secondary text-sm block">РЕШИ:</span>
                    <span className="text-2xl font-bold text-primary">{problem.q} = ?</span>
                </div>
                <div className="text-right">
                    <div className="text-secondary text-sm">ОЧКИ</div>
                    <div className="text-3xl font-bold">{score}</div>
                </div>
            </div>

            <div
                className="snake-grid"
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                    width: '100%',
                    aspectRatio: '1/1',
                    background: '#f8fafc',
                    border: '4px solid #e2e8f0',
                    borderRadius: '8px',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Food */}
                <div
                    className="snake-food correct"
                    style={{
                        gridColumnStart: food.x + 1,
                        gridRowStart: food.y + 1,
                        background: '#22c55e',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        zIndex: 2,
                        boxShadow: '0 0 10px rgba(34,197,94,0.5)'
                    }}
                >
                    {food.value}
                </div>

                {wrongFood.map((f, i) => (
                    <div
                        key={i}
                        className="snake-food wrong"
                        style={{
                            gridColumnStart: f.x + 1,
                            gridRowStart: f.y + 1,
                            background: '#ef4444',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            zIndex: 2
                        }}
                    >
                        {f.value}
                    </div>
                ))}

                {/* Snake */}
                {snake.map((segment, i) => (
                    <div
                        key={i}
                        style={{
                            gridColumnStart: segment.x + 1,
                            gridRowStart: segment.y + 1,
                            background: i === 0 ? 'var(--cp-primary)' : 'var(--cp-primary-light)',
                            borderRadius: i === 0 ? '4px' : '2px',
                            zIndex: 3,
                            border: '1px solid white'
                        }}
                    />
                ))}
            </div>

            <div className="flex justify-center gap-m mt-m">
                <button className="btn btn-icon" onClick={() => setPaused(!paused)}>
                    {paused ? <Play size={24} /> : <Pause size={24} />}
                </button>
            </div>

            <p className="text-center text-sm text-secondary mt-m">
                Управляй стрелками на клавиатуре ⌨️
            </p>
        </div>
    )
}
