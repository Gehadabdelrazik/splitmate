import { motion } from 'framer-motion'
import { useState } from 'react'
import { useApp } from '../store'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } } }

export default function Activity() {
  const { getAllExpensesSorted, groups, getGroupName, deleteExpense, fmt, formatDate, currentUser } = useApp()
  const [filter, setFilter] = useState('All')

  const allExpenses = getAllExpensesSorted()
  const filtered = filter === 'All' ? allExpenses : allExpenses.filter(e => e.groupId === filter)

  // Group by date label
  const grouped = filtered.reduce((acc, item) => {
    const label = formatDate(item.date)
    if (!acc[label]) acc[label] = []
    acc[label].push(item)
    return acc
  }, {})

  // Monthly totals
  const now = new Date()
  const thisMonth = allExpenses.filter(e => {
    const d = new Date(e.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  let monthReceived = 0, monthPaid = 0
  thisMonth.forEach(e => {
    const share = e.amount / e.split.length
    const iAmPayer = e.payerName === currentUser
    const iAmInSplit = e.split.includes(currentUser)
    const myNet = iAmPayer ? e.amount - (iAmInSplit ? share : 0) : iAmInSplit ? -share : 0
    if (myNet > 0) monthReceived += myNet
    else monthPaid += Math.abs(myNet)
  })

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-3xl mx-auto px-6 py-10">
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="font-display text-4xl italic text-stone-900 mb-1">Activity</h1>
        <p className="text-stone-500 text-sm">All your shared expense history.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 mb-8">
        <div className="card px-5 py-4">
          <p className="text-xs text-stone-500 mb-1">This month — received</p>
          <p className="font-display text-2xl italic text-emerald-500">+{fmt(monthReceived)}</p>
        </div>
        <div className="card px-5 py-4">
          <p className="text-xs text-stone-500 mb-1">This month — paid out</p>
          <p className="font-display text-2xl italic text-red-400">-{fmt(monthPaid)}</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex gap-2 mb-6 flex-wrap">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setFilter('All')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === 'All' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'}`}>
          All
        </motion.button>
        {groups.map(g => (
          <motion.button key={g.id} whileTap={{ scale: 0.95 }} onClick={() => setFilter(g.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === g.id ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'}`}>
            {g.name}
          </motion.button>
        ))}
      </motion.div>

      {/* Activity list */}
      {filtered.length === 0 ? (
        <motion.div variants={fadeUp} className="text-center py-16 text-stone-400">
          <p className="text-3xl mb-3">💸</p>
          <p>No expenses yet. Add your first bill!</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <motion.div key={date} variants={fadeUp}>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">{date}</p>
              <div className="card overflow-hidden">
                {items.map((item, i) => {
                  const share = item.amount / item.split.length
                  const iAmPayer = item.payerName === currentUser
                  const iAmInSplit = item.split.includes(currentUser)
                  const myNet = iAmPayer ? item.amount - (iAmInSplit ? share : 0) : iAmInSplit ? -share : 0
                  return (
                    <motion.div key={item.id}
                      whileHover={{ backgroundColor: '#f9f9f7', x: 3 }}
                      className="flex items-center gap-4 px-5 py-4 border-b border-stone-100 last:border-none cursor-pointer transition-colors group">
                      <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center text-lg flex-shrink-0">{item.category}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900">{item.desc}</p>
                        <p className="text-xs text-stone-400">{item.payerName === currentUser ? 'You paid' : `Paid by ${item.payerName}`} · {getGroupName(item.groupId)}</p>
                      </div>
                      <div className="text-right flex-shrink-0 flex items-center gap-2">
                        <div>
                          <p className={`text-sm font-semibold ${myNet > 0.01 ? 'text-emerald-500' : myNet < -0.01 ? 'text-red-400' : 'text-stone-400'}`}>
                            {myNet > 0.01 ? '+' : ''}{fmt(myNet)}
                          </p>
                          <p className="text-xs text-stone-400">{fmt(item.amount)} total</p>
                        </div>
                        <button onClick={() => deleteExpense(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 text-xs border border-red-200 rounded-lg px-2 py-1 transition-all">✕</button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
