import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Groups from './pages/Groups'
import Activity from './pages/Activity'
import AddBill from './pages/AddBill'
import GroupDetail from './pages/GroupDetail'

export default function App() {
  const location = useLocation()
  const hideNav = location.pathname === '/add-bill'

  return (
    <div className="min-h-screen bg-[#f5f4f0]">
      {!hideNav && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/add-bill" element={<AddBill />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}
