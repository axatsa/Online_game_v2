import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UserPlus } from 'lucide-react'
import './RegisterPage.css'

export default function RegisterPage() {
    const { register } = useAuth()
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', grade: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!form.name.trim() || !form.email.trim() || !form.password || !form.grade) {
            setError('Заполните все обязательные поля')
            return
        }
        if (form.password.length < 6) {
            setError('Пароль должен быть минимум 6 символов')
            return
        }
        if (form.password !== form.confirmPassword) {
            setError('Пароли не совпадают')
            return
        }

        setLoading(true)
        try {
            await register({
                name: form.name,
                email: form.email,
                password: form.password,
                grade: form.grade
            })
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="register-page">
            <div className="register-container animate-slide-up">
                <div className="register-header">
                    <UserPlus size={32} color="var(--primary)" />
                    <h2>Регистрация ученика</h2>
                    <p className="register-desc">Создайте аккаунт для доступа к образовательной платформе</p>
                </div>

                <form onSubmit={handleSubmit} className="register-form">
                    {error && (
                        <div className="login-error animate-slide-down">{error}</div>
                    )}

                    <div className="input-group">
                        <label className="input-label" htmlFor="reg-name">Имя и фамилия *</label>
                        <input
                            id="reg-name"
                            name="name"
                            className="input"
                            type="text"
                            placeholder="Александр Иванов"
                            value={form.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="reg-email">Email *</label>
                        <input
                            id="reg-email"
                            name="email"
                            className="input"
                            type="email"
                            placeholder="student@thompson.edu"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="reg-grade">Класс *</label>
                        <select
                            id="reg-grade"
                            name="grade"
                            className="input"
                            value={form.grade}
                            onChange={handleChange}
                        >
                            <option value="">Выберите класс</option>
                            {Array.from({ length: 11 }, (_, i) => i + 1).map(g => (
                                <option key={g} value={`${g}`}>{g} класс</option>
                            ))}
                        </select>
                    </div>

                    <div className="register-row">
                        <div className="input-group">
                            <label className="input-label" htmlFor="reg-pw">Пароль *</label>
                            <input
                                id="reg-pw"
                                name="password"
                                className="input"
                                type="password"
                                placeholder="Минимум 6 символов"
                                value={form.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label" htmlFor="reg-pw2">Подтверждение *</label>
                            <input
                                id="reg-pw2"
                                name="confirmPassword"
                                className="input"
                                type="password"
                                placeholder="Повторите пароль"
                                value={form.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                        {loading ? 'Регистрируем...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <p className="login-register-link">
                    Уже есть аккаунт?{' '}
                    <Link to="/login">Войти</Link>
                </p>
            </div>
        </div>
    )
}
