import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useApp } from '../store'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }
}

export default function Home() {
  const { getMyTotals, getAllExpensesSorted, getGroupName, groups, getGroupBalances, getSettlementPct, fmt, formatDate, currentUser } = useApp()
  const { owed, owes } = getMyTotals()
  const recentActivity = getAllExpensesSorted().slice(0, 5)
  const owedGroups = groups.filter(g => (getGroupBalances(g.id)[currentUser] || 0) > 0.01)
  const oweGroups = groups.filter(g => (getGroupBalances(g.id)[currentUser] || 0) < -0.01)

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-6xl mx-auto px-6 py-10">
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="font-display text-4xl text-stone-900 italic mb-1">Welcome back, {currentUser}</h1>
        <p className="text-stone-500 text-sm">Here's what's happening with your shared expenses today.</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.01, y: -2 }} transition={{ duration: 0.2 }}
              className="rounded-3xl p-6" style={{ background: 'linear-gradient(135deg, #d8f3e8 0%, #b4e8d2 100%)' }}>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">You are owed</p>
              <p className="font-display text-4xl italic text-stone-900 mb-4">{fmt(owed)}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {owedGroups.slice(0, 3).map((g, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-emerald-400 flex items-center justify-center text-white text-[9px] font-bold">{g.name[0]}</div>
                    ))}
                  </div>
                  <span className="text-xs text-stone-600">{owedGroups.length > 0 ? `from ${owedGroups.length} group${owedGroups.length > 1 ? 's' : ''}` : 'all settled!'}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="text-emerald-600"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>
                </div>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.01, y: -2 }} transition={{ duration: 0.2 }}
              className="rounded-3xl p-6" style={{ background: 'linear-gradient(135deg, #ebe8ff 0%, #d9d4ff 100%)' }}>
              <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest mb-3">You owe</p>
              <p className="font-display text-4xl italic text-stone-900 mb-4">{fmt(owes)}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {oweGroups.slice(0, 3).map((g, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-violet-400 flex items-center justify-center text-white text-[9px] font-bold">{g.name[0]}</div>
                    ))}
                  </div>
                  <span className="text-xs text-stone-600">{oweGroups.length > 0 ? `to ${oweGroups.length} group${oweGroups.length > 1 ? 's' : ''}` : 'all settled!'}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="text-violet-600"><path d="M23 18l-9.5-9.5-5 5L1 6"/><path d="M17 18h6v-6"/></svg>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div variants={fadeUp} className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-stone-900">Recent Activity</h2>
              <Link to="/activity" className="text-xs text-stone-500 hover:text-stone-900 transition-colors">View all</Link>
            </div>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-6">No expenses yet — add your first bill!</p>
            ) : (
              <div className="space-y-1">
                {recentActivity.map((item, i) => {
                  const share = item.amount / item.split.length
                  const iAmPayer = item.payerName === currentUser
                  const iAmInSplit = item.split.includes(currentUser)
                  const myNet = iAmPayer ? item.amount - (iAmInSplit ? share : 0) : iAmInSplit ? -share : 0
                  return (
                    <motion.div key={item.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      whileHover={{ backgroundColor: '#f9f9f7', borderRadius: '1rem', x: 3 }}
                      className="flex items-center gap-4 px-3 py-3.5 rounded-2xl cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center text-lg flex-shrink-0">{item.category}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900">{item.desc}</p>
                        <p className="text-xs text-stone-400 truncate">{item.payerName === currentUser ? 'You paid' : `Paid by ${item.payerName}`} · {getGroupName(item.groupId)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-semibold ${myNet > 0.01 ? 'text-emerald-500' : myNet < -0.01 ? 'text-red-400' : 'text-stone-400'}`}>
                          {myNet > 0.01 ? '+' : ''}{fmt(myNet)}
                        </p>
                        <p className="text-xs text-stone-400">{formatDate(item.date)}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.div variants={fadeUp} className="card p-5">
            <h3 className="font-semibold text-stone-900 mb-4">Group Settlement</h3>
            {groups.length === 0 ? (
              <p className="text-xs text-stone-400">No groups yet</p>
            ) : (
              <div className="space-y-4">
                {groups.map((g, i) => {
                  const pct = getSettlementPct(g.id)
                  return (
                    <div key={g.id}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-stone-600">{g.name}</span>
                        <span className="text-xs font-semibold text-stone-900">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.7, ease: 'easeOut' }}
                          className="h-full rounded-full bg-stone-800" />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>

          <motion.div variants={fadeUp} whileHover={{ scale: 1.01 }}
            className="rounded-3xl p-6 text-center" style={{ background: 'linear-gradient(145deg, #d8f3e8, #e8f5e0)' }}>
            <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="text-stone-700"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>
            </div>
            <p className="font-semibold text-stone-900 mb-1">Fast Split</p>
            <p className="text-xs text-stone-600 mb-4">Ready to split a new expense with the crew?</p>
            <Link to="/add-bill">
              <motion.button whileTap={{ scale: 0.96 }} className="btn-dark w-full">Add Bill Now</motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
