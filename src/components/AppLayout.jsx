import { Outlet } from 'react-router-dom'
import Header from './Header'

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
                <Outlet />
            </main>
        </div>
    )
}
