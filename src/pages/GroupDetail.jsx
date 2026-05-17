import { motion } from 'framer-motion'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../store'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } } }

const COLOR_MAP = {
  mint: 'from-emerald-100 to-emerald-200',
  lavender: 'from-violet-100 to-violet-200',
  amber: 'from-amber-50 to-amber-100',
  rose: 'from-rose-100 to-rose-200',
  sky: 'from-sky-100 to-sky-200',
}

export default function GroupDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { groups, getGroupExpenses, getGroupBalances, simplifyDebts, deleteExpense, recordSettlement, getSettlementPct, fmt, formatDate, currentUser } = useApp()

  const group = groups.find(g => g.id === id)
  if (!group) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="text-stone-500">Group not found.</p>
        <Link to="/groups" className="text-sm text-emerald-600 mt-2 inline-block">← Back to groups</Link>
      </div>
    )
  }

  const expenses = getGroupExpenses(id)
  const balances = getGroupBalances(id)
  const transactions = simplifyDebts(balances)
  const pct = getSettlementPct(id)
  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const colorClass = COLOR_MAP[group.color] || COLOR_MAP.mint

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-4xl mx-auto px-6 py-10">
      <motion.div variants={fadeUp} className="mb-6">
        <Link to="/groups" className="text-sm text-stone-500 hover:text-stone-900 flex items-center gap-1.5 transition-colors w-fit">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to groups
        </Link>
      </motion.div>

      <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl italic text-stone-900">{group.name}</h1>
          <p className="text-stone-500 text-sm mt-1">{group.members.length} members · {expenses.length} expenses · {fmt(total)} total</p>
        </div>
        <Link to={`/add-bill?group=${id}`}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="btn-dark flex items-center gap-1.5">
            <span>+</span> Add Expense
          </motion.button>
        </Link>
      </motion.div>

      <div className="grid grid-cols-5 gap-5">
        {/* Expenses list */}
        <motion.div variants={fadeUp} className="col-span-3 card p-6">
          <h2 className="font-semibold text-stone-900 mb-5">Expenses</h2>
          {expenses.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-8">No expenses yet. Add the first one!</p>
          ) : (
            <div className="space-y-1">
              {[...expenses].reverse().map((e) => (
                <motion.div key={e.id}
                  whileHover={{ backgroundColor: '#f9f9f7', borderRadius: '1rem', x: 3 }}
                  className="flex items-center gap-3 px-3 py-3 rounded-2xl cursor-pointer transition-colors group">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-base">{e.category}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-900">{e.desc}</p>
                    <p className="text-xs text-stone-400">Paid by {e.payerName} · {e.split.length} people</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{fmt(e.amount)}</p>
                      <p className="text-xs text-stone-400">{formatDate(e.date)}</p>
                    </div>
                    <button onClick={() => deleteExpense(e.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs border border-red-200 rounded-lg px-2 py-1 transition-all">✕</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right sidebar */}
        <motion.div variants={fadeUp} className="col-span-2 space-y-4">
          {/* Balances */}
          <div className="card p-5">
            <h2 className="font-semibold text-stone-900 mb-4">Balances</h2>
            <div className="space-y-3">
              {group.members.map((m) => {
                const bal = balances[m] || 0
                return (
                  <div key={m} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 text-xs font-bold">{m[0]}</div>
                    <div className="flex-1">
                      <p className="text-sm text-stone-700">{m}{m === currentUser ? ' (you)' : ''}</p>
                    </div>
                    <span className={`text-sm font-semibold ${bal > 0.01 ? 'text-emerald-500' : bal < -0.01 ? 'text-red-400' : 'text-stone-400'}`}>
                      {bal > 0.01 ? '+' : ''}{fmt(bal)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Settle up */}
          <div className={`rounded-3xl p-5 bg-gradient-to-br ${colorClass}`}>
            <p className="text-xs font-semibold text-stone-600 uppercase tracking-widest mb-3">Settle Up</p>
            <div className="flex justify-between text-xs text-stone-600 mb-2">
              <span>Progress</span><span>{pct}%</span>
            </div>
            <div className="h-2 bg-white/50 rounded-full overflow-hidden mb-4">
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-stone-800 rounded-full" />
            </div>
            {transactions.length === 0 ? (
              <p className="text-sm text-center text-stone-600 font-medium py-1">🎉 All settled!</p>
            ) : (
              <div className="space-y-2 mb-4">
                {transactions.map((t, i) => (
                  <div key={i} className="bg-white/60 rounded-xl px-3 py-2.5 text-xs text-stone-700">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold">{t.from}</span>
                        <span className="text-stone-500 mx-1">pays</span>
                        <span className="font-semibold">{t.to}</span>
                      </div>
                      <span className="font-bold text-stone-900 text-sm">{fmt(t.amount)}</span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => recordSettlement({ groupId: id, fromName: t.from, toName: t.to, amount: t.amount })}
                      className="w-full bg-stone-800 text-white rounded-lg py-1.5 text-xs font-medium hover:bg-stone-700 transition-colors"
                    >
                      ✓ Mark as settled
                    </motion.button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
