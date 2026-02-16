import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

const TOKEN_KEY = 'classplay_token'
const USER_KEY = 'classplay_user'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const savedToken = localStorage.getItem(TOKEN_KEY)
        const savedUser = localStorage.getItem(USER_KEY)
        if (savedToken && savedUser) {
            setToken(savedToken)
            setUser(JSON.parse(savedUser))
        }
        setLoading(false)
    }, [])

    const login = async (email, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Ошибка входа')

            setToken(data.token)
            setUser(data.user)
            localStorage.setItem(TOKEN_KEY, data.token)
            localStorage.setItem(USER_KEY, JSON.stringify(data.user))
            return { success: true }
        } catch (err) {
            // Fallback: demo login for development
            if (email === 'teacher@classplay.uz' && password === 'demo123') {
                const demoUser = {
                    id: 1,
                    name: 'Дильноза Каримова',
                    email: 'teacher@classplay.uz',
                    role: 'teacher',
                    school: 'Школа №42',
                    license: true
                }
                const demoToken = 'demo-jwt-token'
                setToken(demoToken)
                setUser(demoUser)
                localStorage.setItem(TOKEN_KEY, demoToken)
                localStorage.setItem(USER_KEY, JSON.stringify(demoUser))
                return { success: true }
            }

            if (email === 'admin@classplay.uz' && password === 'admin123') {
                const adminUser = {
                    id: 0,
                    name: 'Администратор',
                    email: 'admin@classplay.uz',
                    role: 'admin',
                    license: true
                }
                const adminToken = 'admin-jwt-token'
                setToken(adminToken)
                setUser(adminUser)
                localStorage.setItem(TOKEN_KEY, adminToken)
                localStorage.setItem(USER_KEY, JSON.stringify(adminUser))
                return { success: true }
            }

            return { success: false, error: err.message || 'Неверный логин или пароль' }
        }
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
    }

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            isAuthenticated: !!user,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
