import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'

const ClassContext = createContext()

const CLASS_KEY = 'classplay_class_context'
const ACTIVE_CLASS_ID_KEY = 'classplay_active_class_id'

const DEFAULT_CONTEXT = {
    grade: '',
    level: '', // Deprecated in UI but kept for compat
    topic: '',
    interests: '',
    language: 'ru'
}

export function ClassProvider({ children }) {
    const { isAuthenticated, token } = useAuth()

    // The "Active" context used for generation
    const [classCtx, setClassCtx] = useState(() => {
        const saved = localStorage.getItem(CLASS_KEY)
        return saved ? JSON.parse(saved) : DEFAULT_CONTEXT
    })

    // List of saved classes
    const [classes, setClasses] = useState([])
    const [loadingClasses, setLoadingClasses] = useState(false)
    const [activeClassId, setActiveClassId] = useState(() => {
        return localStorage.getItem(ACTIVE_CLASS_ID_KEY) || null
    })

    useEffect(() => {
        localStorage.setItem(CLASS_KEY, JSON.stringify(classCtx))
    }, [classCtx])

    useEffect(() => {
        if (activeClassId) {
            localStorage.setItem(ACTIVE_CLASS_ID_KEY, activeClassId)
        } else {
            localStorage.removeItem(ACTIVE_CLASS_ID_KEY)
        }
    }, [activeClassId])

    const fetchClasses = useCallback(async () => {
        if (!isAuthenticated || !token) return

        setLoadingClasses(true)
        try {
            const res = await fetch('/api/classes', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setClasses(data)
            }
        } catch (error) {
            console.error("Failed to fetch classes", error)
        } finally {
            setLoadingClasses(false)
        }
    }, [isAuthenticated, token])

    // Load classes on mount/auth change
    useEffect(() => {
        if (isAuthenticated) {
            fetchClasses()
        } else {
            setClasses([])
        }
    }, [isAuthenticated, fetchClasses])

    const updateContext = async (updates) => {
        // Immediate local update for UI responsiveness
        setClassCtx(prev => ({ ...prev, ...updates }))

        // If we have an active class, persist these changes to the DB
        if (activeClassId) {
            try {
                if (!token) return
                await fetch(`/api/classes/${activeClassId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updates)
                })

                // Update the class in the local list as well
                setClasses(prev => prev.map(c =>
                    c.id === activeClassId ? { ...c, ...updates } : c
                ))
            } catch (error) {
                console.error("Failed to persist class context:", error)
            }
        }
    }

    const resetContext = () => {
        setClassCtx(DEFAULT_CONTEXT)
        setActiveClassId(null)
    }

    const addClass = async (classData) => {
        if (!token) return null
        try {
            const res = await fetch('/api/classes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(classData)
            })
            if (res.ok) {
                await fetchClasses()
                return true
            }
        } catch (e) {
            console.error(e)
        }
        return false
    }

    const deleteClass = async (id) => {
        if (!token) return
        try {
            const res = await fetch(`/api/classes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                setClasses(prev => prev.filter(c => c.id !== id))
                if (activeClassId == id) {
                    setActiveClassId(null)
                }
            }
        } catch (e) {
            console.error(e)
        }
    }

    const selectClass = (classItem) => {
        setActiveClassId(classItem.id)
        setClassCtx({
            grade: classItem.grade,
            level: '',
            topic: classItem.topic,
            interests: classItem.interests,
            language: classItem.language || 'ru'
        })
    }



    // Students Helper
    const fetchStudents = async (classId) => {
        if (!token) return []
        try {
            const res = await fetch(`/api/classes/${classId}/students`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) return await res.json()
        } catch (e) {
            console.error(e)
        }
        return []
    }

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
            classes,
            loadingClasses,
            activeClassId,
            updateContext,
            resetContext,
            fetchClasses,
            addClass,
            deleteClass,
            selectClass,
            buildPrompt,
            hasContext,
            fetchStudents
        }}>
            {children}
        </ClassContext.Provider>
    )
}

export const useClassContext = () => useContext(ClassContext)
