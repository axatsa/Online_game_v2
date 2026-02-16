import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ClassProvider } from './contexts/ClassContext'
import AppLayout from './components/AppLayout'

// Pages
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import GeneratorsPage from './pages/GeneratorsPage'
import GeneratorPage from './pages/GeneratorPage'
import ToolsPage from './pages/ToolsPage'
import ToolPage from './pages/ToolPage'
import GamesPage from './pages/GamesPage'
import GamePage from './pages/GamePage'

// Admin
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth()
    if (loading) return <div className="flex items-center justify-center" style={{ height: '100vh' }}>Загрузка...</div>
    return isAuthenticated ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) return <div className="flex items-center justify-center" style={{ height: '100vh' }}>Загрузка...</div>
    return user?.role === 'admin' ? children : <Navigate to="/" />
}

function GuestOnly({ children }) {
    const { isAuthenticated, loading } = useAuth()
    if (loading) return null
    return isAuthenticated ? <Navigate to="/" /> : children
}

function App() {
    return (
        <AuthProvider>
            <ClassProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public */}
                        <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />

                        {/* App Shell */}
                        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                            <Route index element={<DashboardPage />} />
                            <Route path="generators" element={<GeneratorsPage />} />
                            <Route path="generator/:type" element={<GeneratorPage />} />
                            <Route path="tools" element={<ToolsPage />} />
                            <Route path="tool/:toolId" element={<ToolPage />} />
                            <Route path="games" element={<GamesPage />} />
                            <Route path="game/:gameId" element={<GamePage />} />
                        </Route>

                        {/* Admin */}
                        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                            <Route index element={<AdminDashboard />} />
                        </Route>

                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </BrowserRouter>
            </ClassProvider>
        </AuthProvider>
    )
}

export default App
