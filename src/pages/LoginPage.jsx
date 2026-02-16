import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Sparkles, BookOpen, Users } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email || !password) { setError('Заполните все поля'); return }
        setLoading(true)
        setError('')
        const result = await login(email, password)
        setLoading(false)
        if (result.success) {
            navigate('/')
        } else {
            setError(result.error)
        }
    }

    return (
        <div className="login-split">
            {/* Hero Side */}
            <div className="login-hero">
                <div style={{ marginBottom: 40 }}>
                    <h1 style={{ fontFamily: 'var(--cp-font-heading)', fontSize: '3.5rem', letterSpacing: '-0.03em' }}>
                        ClassPlay
                    </h1>
                    <p style={{ fontSize: '1.15rem', opacity: 0.9, lineHeight: 1.7, marginTop: 16 }}>
                        AI ассистент учителя. Создавайте уникальные материалы за секунды.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 340, width: '100%' }}>
                    <div className="flex items-center gap-md" style={{ opacity: 0.9 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <div className="font-bold">AI Генераторы</div>
                            <div className="text-sm" style={{ opacity: 0.8 }}>Математика, кроссворды</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-md" style={{ opacity: 0.9 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <div className="font-bold">Экспорт в PDF</div>
                            <div className="text-sm" style={{ opacity: 0.8 }}>Готовые рабочие листы</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-md" style={{ opacity: 0.9 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={24} />
                        </div>
                        <div>
                            <div className="font-bold">Инструменты класса</div>
                            <div className="text-sm" style={{ opacity: 0.8 }}>Рулетка, битвы</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Side */}
            <div className="login-form-side">
                <div className="login-form-container animate-slide">
                    <div style={{ marginBottom: 40 }}>
                        <h2 style={{ fontFamily: 'var(--cp-font-heading)', color: 'var(--cp-primary)' }}>
                            Добро пожаловать
                        </h2>
                        <p className="text-secondary" style={{ marginTop: 8 }}>
                            Войдите в свой аккаунт учителя
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            background: 'var(--cp-primary-light)',
                            color: 'var(--cp-primary)',
                            padding: '12px 16px',
                            borderRadius: 'var(--cp-radius)',
                            marginBottom: 24,
                            fontSize: '0.875rem',
                            fontWeight: 500
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                className="input"
                                type="email"
                                placeholder="teacher@classplay.uz"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Пароль</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="input"
                                    type={showPw ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(!showPw)}
                                    style={{
                                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cp-text-muted)'
                                    }}
                                >
                                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <label className="flex items-center gap-xs text-sm text-secondary" style={{ cursor: 'pointer' }}>
                                <input type="checkbox" style={{ accentColor: 'var(--cp-primary)' }} /> Запомнить меня
                            </label>
                            <a href="#" className="text-sm" style={{ color: 'var(--cp-primary)' }}>Забыли пароль?</a>
                        </div>

                        <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading}>
                            {loading ? 'Вход...' : 'Войти'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-muted" style={{ marginTop: 32 }}>
                        Демо: teacher@classplay.uz / demo123
                    </p>
                </div>
            </div>
        </div>
    )
}
