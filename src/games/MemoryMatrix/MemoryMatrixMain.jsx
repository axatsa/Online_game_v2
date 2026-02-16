import { useState } from 'react'
import MemoryMatrixSetup from './MemoryMatrixSetup'
import MemoryMatrixGame from './MemoryMatrixGame'
import MemoryMatrixResult from './MemoryMatrixResult'
import './MemoryMatrix.css'

const PHASES = { SETUP: 'setup', PLAYING: 'playing', RESULT: 'result' }

export default function MemoryMatrixMain({ onExit }) {
    const [phase, setPhase] = useState(PHASES.SETUP)
    const [config, setConfig] = useState(null)
    const [result, setResult] = useState(null)

    const handleStart = (cfg) => {
        setConfig(cfg)
        setPhase(PHASES.PLAYING)
    }

    const handleFinish = (gameResult) => {
        setResult(gameResult)
        setPhase(PHASES.RESULT)
    }

    const handleRestart = () => {
        setConfig(null)
        setResult(null)
        setPhase(PHASES.SETUP)
    }

    switch (phase) {
        case PHASES.SETUP:
            return <MemoryMatrixSetup onStart={handleStart} onExit={onExit} />
        case PHASES.PLAYING:
            return <MemoryMatrixGame config={config} onFinish={handleFinish} onExit={onExit} />
        case PHASES.RESULT:
            return <MemoryMatrixResult result={result} onRestart={handleRestart} onExit={onExit} />
        default:
            return null
    }
}
