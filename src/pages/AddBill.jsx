import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../store'

const CATEGORIES = [
  { icon: '🍕', label: 'Food' }, { icon: '🚗', label: 'Transport' },
  { icon: '🛒', label: 'Groceries' }, { icon: '🎮', label: 'Fun' },
  { icon: '🏨', label: 'Hotel' }, { icon: '💡', label: 'Utilities' },
  { icon: '💊', label: 'Health' }, { icon: '📦', label: 'Other' },
]

export default function AddBill() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { groups, addExpense, currentUser } = useApp()

  const preselectedGroupId = searchParams.get('group') || groups[0]?.id || ''
  const [step, setStep] = useState(1)
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('🍕')
  const [groupId, setGroupId] = useState(preselectedGroupId)
  const [paidBy, setPaidBy] = useState(currentUser)
  const [splitWith, setSplitWith] = useState(() => {
    const g = groups.find(g => g.id === preselectedGroupId)
    return new Set(g?.members || [currentUser])
  })
  const [submitted, setSubmitted] = useState(false)

  const selectedGroup = groups.find(g => g.id === groupId)
  const members = selectedGroup?.members || [currentUser]

  function handleGroupChange(id) {
    setGroupId(id)
    const g = groups.find(g => g.id === id)
    setSplitWith(new Set(g?.members || [currentUser]))
    setPaidBy(currentUser)
  }

  function toggle(m) {
    setSplitWith(prev => {
      const next = new Set(prev)
      next.has(m) ? next.delete(m) : next.add(m)
      return next
    })
  }

  const perPerson = splitWith.size > 0 && amount
    ? (parseFloat(amount) / splitWith.size).toFixed(2) : '0.00'

  function handleSubmit() {
    if (!desc.trim() || !amount || !groupId || splitWith.size === 0) return
    addExpense({
      groupId, desc: desc.trim(),
      amount: parseFloat(amount),
      payerName: paidBy,
      split: [...splitWith],
      category,
    })
    setSubmitted(true)
    setTimeout(() => navigate(groupId ? `/groups/${groupId}` : '/'), 1200)
  }

  const steps = ['Details', 'Split', 'Confirm']

  if (groups.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f4f0] flex flex-col items-center justify-center text-center px-6">
        <p className="text-3xl mb-4">👥</p>
        <h2 className="font-display text-2xl italic text-stone-900 mb-2">No groups yet</h2>
        <p className="text-stone-500 text-sm mb-6">Create a group first before adding a bill.</p>
        <button onClick={() => navigate('/groups')} className="btn-dark">Go to Groups</button>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f5f4f0] flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }}
            className="text-6xl mb-4">🎉</motion.div>
          <p className="font-display text-2xl italic text-stone-900">Bill added!</p>
          <p className="text-stone-500 text-sm mt-2">Redirecting...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-[#f5f4f0] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-[#f5f4f0]/90 backdrop-blur-md border-b border-stone-200/60 z-10">
        <div className="max-w-xl mx-auto px-6 h-14 flex items-center justify-between">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate(-1)}
            className="text-sm text-stone-500 hover:text-stone-900 flex items-center gap-1.5 transition-colors">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Cancel
          </motion.button>
          <span className="font-display text-lg italic text-stone-900">Add Bill</span>
          <div className="w-16" />
        </div>
        {/* Step indicator */}
        <div className="max-w-xl mx-auto px-6 pb-3 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 ${i + 1 <= step ? 'text-stone-900' : 'text-stone-400'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${i + 1 < step ? 'bg-emerald-400 text-white' : i + 1 === step ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-500'}`}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span className="text-xs font-medium">{s}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-px w-8 ${i + 1 < step ? 'bg-emerald-400' : 'bg-stone-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-auto w-full px-6 py-8">
        <AnimatePresence mode="wait">

          {/* Step 1: Details */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest block mb-2">Description</label>
                <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="What's this for?"
                  className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3.5 text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-400 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest block mb-2">Amount (RM)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-display text-xl italic">RM</span>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                    className="w-full bg-white border border-stone-200 rounded-2xl pl-14 pr-4 py-3.5 text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-400 font-display text-2xl italic" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest block mb-3">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map(c => (
                    <motion.button key={c.icon} whileTap={{ scale: 0.93 }} onClick={() => setCategory(c.icon)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all ${category === c.icon ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`}>
                      <span className="text-xl">{c.icon}</span>
                      <span className="text-xs">{c.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest block mb-2">Group</label>
                <div className="flex gap-2 flex-wrap">
                  {groups.map(g => (
                    <motion.button key={g.id} whileTap={{ scale: 0.95 }} onClick={() => handleGroupChange(g.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${groupId === g.id ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600'}`}>
                      {g.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Split */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest block mb-2">Paid by</label>
                <div className="flex gap-2 flex-wrap">
                  {members.map(m => (
                    <motion.button key={m} whileTap={{ scale: 0.95 }} onClick={() => setPaidBy(m)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${paidBy === m ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600'}`}>
                      {m}{m === currentUser ? ' (you)' : ''}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Split with</label>
                  <button onClick={() => setSplitWith(new Set(members))} className="text-xs text-stone-500 hover:text-stone-900 transition-colors">Select all</button>
                </div>
                <div className="card overflow-hidden">
                  {members.map(m => (
                    <motion.div key={m} whileTap={{ scale: 0.99 }} onClick={() => toggle(m)}
                      className="flex items-center gap-3 px-5 py-3.5 border-b border-stone-100 last:border-none cursor-pointer hover:bg-stone-50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 text-xs font-bold">{m[0]}</div>
                      <span className="flex-1 text-sm text-stone-900">{m}{m === currentUser ? ' (you)' : ''}</span>
                      <motion.div animate={{ scale: splitWith.has(m) ? 1 : 0.8 }}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${splitWith.has(m) ? 'border-stone-900 bg-stone-900' : 'border-stone-300'}`}>
                        {splitWith.has(m) && <span className="text-white text-[10px]">✓</span>}
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
              {amount && splitWith.size > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-emerald-50 px-5 py-4 flex items-center justify-between">
                  <p className="text-sm text-stone-700">Each person pays</p>
                  <p className="font-display text-xl italic text-stone-900">RM {perPerson}</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }} className="space-y-4">
              <div className="card p-6 text-center">
                <div className="w-16 h-16 rounded-3xl bg-stone-100 flex items-center justify-center text-3xl mx-auto mb-4">{category}</div>
                <p className="font-display text-3xl italic text-stone-900 mb-1">RM {parseFloat(amount || 0).toFixed(2)}</p>
                <p className="text-stone-600 font-medium">{desc || 'Untitled expense'}</p>
                <p className="text-xs text-stone-400 mt-1">{selectedGroup?.name || 'No group'}</p>
              </div>
              <div className="card p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Paid by</span>
                  <span className="font-medium text-stone-900">{paidBy}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Split with</span>
                  <span className="font-medium text-stone-900">{splitWith.size} people</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Per person</span>
                  <span className="font-medium text-stone-900">RM {perPerson}</span>
                </div>
                <div className="h-px bg-stone-100" />
                <div className="flex flex-wrap gap-2">
                  {[...splitWith].map(m => (
                    <span key={m} className="text-xs bg-stone-100 text-stone-600 rounded-full px-3 py-1">{m}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom actions */}
      <div className="sticky bottom-0 bg-[#f5f4f0]/90 backdrop-blur-md border-t border-stone-200/60 px-6 py-4">
        <div className="max-w-xl mx-auto flex gap-3">
          {step > 1 && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setStep(s => s - 1)} className="btn-ghost flex-1">Back</motion.button>
          )}
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
            onClick={() => step < 3 ? setStep(s => s + 1) : handleSubmit()}
            disabled={step === 1 && (!desc.trim() || !amount)}
            className="btn-dark flex-1 disabled:opacity-40 disabled:cursor-not-allowed">
            {step === 3 ? '🎉 Add Bill' : 'Continue →'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
