import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import styles from './Layout.module.css'

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')

  return (
    <div className={styles.layout}>
      <Header onToggleSidebar={() => setCollapsed(c => !c)} />
      <div className={styles.body}>
        <Sidebar collapsed={collapsed} />
        <main className={styles.main}>
          <div className={`${styles.contentWrap} ${isDashboard ? styles.contentWrapFull : ''}`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
