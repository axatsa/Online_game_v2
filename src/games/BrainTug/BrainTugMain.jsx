import { useState } from 'react'
import BrainTugSetup from './BrainTugSetup'
import BrainTugGame from './BrainTugGame'
import BrainTugResult from './BrainTugResult'
import './BrainTug.css'

const PHASES = { SETUP: 'setup', PLAYING: 'playing', RESULT: 'result' }

export default function BrainTugMain({ onExit }) {
    const [phase, setPhase] = useState(PHASES.SETUP)
    const [config, setConfig] = useState(null)
    const [result, setResult] = useState(null)

    const handleStart = (setupConfig) => {
        setConfig(setupConfig)
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
            return <BrainTugSetup onStart={handleStart} onExit={onExit} />
        case PHASES.PLAYING:
            return <BrainTugGame config={config} onFinish={handleFinish} onExit={onExit} />
        case PHASES.RESULT:
            return <BrainTugResult result={result} onRestart={handleRestart} onExit={onExit} />
        default:
            return null
    }
}
