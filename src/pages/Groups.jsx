import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useApp } from '../store'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } } }

const COLOR_OPTIONS = [
  { id: 'mint', bg: 'from-emerald-100 to-emerald-200', accent: 'bg-emerald-400' },
  { id: 'lavender', bg: 'from-violet-100 to-violet-200', accent: 'bg-violet-400' },
  { id: 'amber', bg: 'from-amber-50 to-amber-100', accent: 'bg-amber-400' },
  { id: 'rose', bg: 'from-rose-100 to-rose-200', accent: 'bg-rose-400' },
  { id: 'sky', bg: 'from-sky-100 to-sky-200', accent: 'bg-sky-400' },
]

function getColors(colorId) {
  return COLOR_OPTIONS.find(c => c.id === colorId) || COLOR_OPTIONS[0]
}

export default function Groups() {
  const { groups, addGroup, deleteGroup, getGroupExpenses, getGroupBalances, getSettlementPct, fmt, currentUser } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newMembers, setNewMembers] = useState(currentUser)
  const [newColor, setNewColor] = useState('mint')
  const [error, setError] = useState('')

  function handleAdd() {
    if (!newName.trim()) { setError('Enter a group name'); return }
    const members = newMembers.split(',').map(m => m.trim()).filter(Boolean)
    if (members.length < 2) { setError('Add at least 2 members (comma separated)'); return }
    addGroup({ name: newName.trim(), color: newColor, members })
    setShowModal(false)
    setNewName('')
    setNewMembers(currentUser)
    setNewColor('mint')
    setError('')
  }

  const totalOwed = groups.reduce((s, g) => {
    const b = getGroupBalances(g.id)[currentUser] || 0
    return b > 0 ? s + b : s
  }, 0)
  const totalOwes = groups.reduce((s, g) => {
    const b = getGroupBalances(g.id)[currentUser] || 0
    return b < 0 ? s + Math.abs(b) : s
  }, 0)

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-6xl mx-auto px-6 py-10">
      <motion.div variants={fadeUp} className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl italic text-stone-900 mb-1">Your Groups</h1>
          <p className="text-stone-500 text-sm">Manage shared expenses across all your groups.</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)} className="btn-dark flex items-center gap-1.5">
          <span className="text-base leading-none">+</span> New Group
        </motion.button>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active Groups', value: groups.length.toString() },
          { label: 'Total Owed to You', value: fmt(totalOwed), green: true },
          { label: 'Total You Owe', value: fmt(totalOwes), red: true },
        ].map((s, i) => (
          <div key={i} className="card px-5 py-4">
            <p className="text-xs text-stone-500 mb-1">{s.label}</p>
            <p className={`font-display text-2xl italic ${s.green ? 'text-emerald-500' : s.red ? 'text-red-400' : 'text-stone-900'}`}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-3 gap-5">
        {groups.map((g, i) => {
          const colors = getColors(g.color)
          const exps = getGroupExpenses(g.id)
          const total = exps.reduce((s, e) => s + e.amount, 0)
          const myBal = getGroupBalances(g.id)[currentUser] || 0
          const pct = getSettlementPct(g.id)
          return (
            <motion.div key={g.id} variants={fadeUp}>
              <Link to={`/groups/${g.id}`}>
                <motion.div whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.2 }}
                  className={`rounded-3xl p-6 bg-gradient-to-br ${colors.bg} cursor-pointer border border-white/60 shadow-sm`}>
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <p className="font-semibold text-stone-900 mb-0.5">{g.name}</p>
                      <p className="text-xs text-stone-500">{exps.length} expense{exps.length !== 1 ? 's' : ''} · {g.members.length} members</p>
                    </div>
                    {pct === 100 && (
                      <span className="text-xs bg-white/70 text-stone-600 rounded-full px-2.5 py-1 font-medium">Settled ✓</span>
                    )}
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-stone-500 mb-0.5">Total spent</p>
                    <p className="font-display text-2xl italic text-stone-900">{fmt(total)}</p>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-stone-500 mb-1.5">
                      <span>Settled</span><span>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.7, ease: 'easeOut' }}
                        className={`h-full rounded-full ${colors.accent}`} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {g.members.slice(0, 4).map((m, j) => (
                        <div key={j} className="w-6 h-6 rounded-full border-2 border-white bg-stone-300 flex items-center justify-center text-stone-600 text-[9px] font-bold">{m[0]}</div>
                      ))}
                      {g.members.length > 4 && (
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-stone-200 flex items-center justify-center text-stone-500 text-[9px]">+{g.members.length - 4}</div>
                      )}
                    </div>
                    <span className={`text-sm font-semibold ${myBal > 0.01 ? 'text-emerald-500' : myBal < -0.01 ? 'text-red-400' : 'text-stone-400'}`}>
                      {myBal > 0.01 ? '+' : ''}{fmt(myBal)}
                    </span>
                  </div>
                </motion.div>
              </Link>
              <button onClick={() => deleteGroup(g.id)}
                className="mt-2 text-xs text-stone-400 hover:text-red-400 transition-colors w-full text-center">
                Delete group
              </button>
            </motion.div>
          )
        })}

        {/* Add new card */}
        <motion.div variants={fadeUp}>
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}
            onClick={() => setShowModal(true)}
            className="rounded-3xl p-6 border-2 border-dashed border-stone-200 flex flex-col items-center justify-center min-h-48 cursor-pointer hover:border-stone-400 hover:bg-stone-50/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mb-3 text-xl">+</div>
            <p className="text-sm font-medium text-stone-600">Create new group</p>
            <p className="text-xs text-stone-400 mt-1">Split with new friends</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Add Group Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">
              <h2 className="font-display text-2xl italic text-stone-900 mb-5">New Group</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest block mb-2">Group Name</label>
                  <input value={newName} onChange={e => { setNewName(e.target.value); setError('') }}
                    placeholder="e.g. Roommates, Trip to Bali..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-400 text-sm" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest block mb-2">Members (comma separated)</label>
                  <input value={newMembers} onChange={e => { setNewMembers(e.target.value); setError('') }}
                    placeholder="Alex, Ben, Clara..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-400 text-sm" />
                  <p className="text-xs text-stone-400 mt-1">Your name is already included</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest block mb-2">Color</label>
                  <div className="flex gap-2">
                    {COLOR_OPTIONS.map(c => (
                      <button key={c.id} onClick={() => setNewColor(c.id)}
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.bg} border-2 transition-all ${newColor === c.id ? 'border-stone-900 scale-110' : 'border-transparent'}`} />
                    ))}
                  </div>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={handleAdd} className="btn-dark flex-1">Create Group</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
