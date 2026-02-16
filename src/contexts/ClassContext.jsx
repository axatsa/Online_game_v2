import { createContext, useContext, useState, useEffect } from 'react'

const ClassContext = createContext()

const CLASS_KEY = 'classplay_class_context'

const DEFAULT_CONTEXT = {
    grade: '',
    level: '',
    topic: '',
    interests: '',
    language: 'ru'
}

export function ClassProvider({ children }) {
    const [classCtx, setClassCtx] = useState(() => {
        const saved = localStorage.getItem(CLASS_KEY)
        return saved ? JSON.parse(saved) : DEFAULT_CONTEXT
    })

    useEffect(() => {
        localStorage.setItem(CLASS_KEY, JSON.stringify(classCtx))
    }, [classCtx])

    const updateContext = (updates) => {
        setClassCtx(prev => ({ ...prev, ...updates }))
    }

    const resetContext = () => setClassCtx(DEFAULT_CONTEXT)

    // Build AI prompt from context
    const buildPrompt = () => {
        const parts = []
        if (classCtx.grade) parts.push(`Класс: ${classCtx.grade}`)
        if (classCtx.level) parts.push(`Уровень: ${classCtx.level}`)
        if (classCtx.topic) parts.push(`Тема: ${classCtx.topic}`)
        if (classCtx.interests) parts.push(`Интересы учеников: ${classCtx.interests}`)
        parts.push(`Язык: ${classCtx.language === 'uz' ? 'Узбекский' : 'Русский'}`)
        return parts.join('. ')
    }

    const hasContext = !!(classCtx.grade || classCtx.topic)

    return (
        <ClassContext.Provider value={{
            classCtx,
            updateContext,
            resetContext,
            buildPrompt,
            hasContext
        }}>
            {children}
        </ClassContext.Provider>
    )
}

export const useClassContext = () => useContext(ClassContext)
