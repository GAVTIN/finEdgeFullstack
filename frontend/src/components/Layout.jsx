import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-surface-900">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
