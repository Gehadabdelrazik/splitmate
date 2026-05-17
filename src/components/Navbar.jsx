import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Navbar() {
  const location = useLocation()
  const path = location.pathname

  return (
    <motion.nav
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 bg-[#f5f4f0]/90 backdrop-blur-md border-b border-stone-200/60"
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-xl text-stone-900 italic">SplitMate</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-8">
          <Link to="/" className={`nav-link ${path === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/groups" className={`nav-link ${path.startsWith('/groups') ? 'active' : ''}`}>Groups</Link>
          <Link to="/activity" className={`nav-link ${path === '/activity' ? 'active' : ''}`}>Activity</Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link to="/add-bill">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="btn-dark flex items-center gap-1.5"
            >
              <span className="text-base leading-none">+</span>
              <span>Add Bill</span>
            </motion.button>
          </Link>
          <button className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center hover:bg-stone-300 transition-colors">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mint-300 to-mint-500 flex items-center justify-center text-white text-xs font-semibold">
            A
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
