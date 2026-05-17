import { createContext, useContext, useState, useEffect } from 'react'

// ── helpers ──────────────────────────────────────────────────────────────────
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch { return fallback }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

// ── default seed data ─────────────────────────────────────────────────────────
const SEED_GROUPS = [
  { id: 'roommates', name: 'Roommates', color: 'mint', members: ['Alex', 'Ben', 'Clara', 'Dana'], createdAt: new Date().toISOString() },
  { id: 'weekend', name: 'Weekend Getaway', color: 'lavender', members: ['Alex', 'Jordan', 'Sam'], createdAt: new Date().toISOString() },
]

const SEED_EXPENSES = [
  { id: 'e1', groupId: 'roommates', desc: 'Weekly Groceries', amount: 120, payerName: 'Alex', split: ['Alex', 'Ben', 'Clara', 'Dana'], category: '🛒', date: new Date(Date.now() - 86400000).toISOString() },
  { id: 'e2', groupId: 'roommates', desc: 'Electric Bill', payerName: 'Ben', amount: 180, split: ['Alex', 'Ben', 'Clara', 'Dana'], category: '💡', date: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'e3', groupId: 'weekend', desc: 'Pizza night', amount: 66, payerName: 'Jordan', split: ['Alex', 'Jordan', 'Sam'], category: '🍕', date: new Date(Date.now() - 86400000).toISOString() },
  { id: 'e4', groupId: 'weekend', desc: 'Hotel', amount: 320, payerName: 'Jordan', split: ['Alex', 'Jordan', 'Sam'], category: '🏨', date: new Date(Date.now() - 3 * 86400000).toISOString() },
]

// ── context ───────────────────────────────────────────────────────────────────
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [groups, setGroups] = useState(() => load('sm-groups', SEED_GROUPS))
  const [expenses, setExpenses] = useState(() => load('sm-expenses', SEED_EXPENSES))
  const currentUser = 'Alex'

  // persist on change
  useEffect(() => save('sm-groups', groups), [groups])
  useEffect(() => save('sm-expenses', expenses), [expenses])

  // ── group actions ─────────────────────────────────────────────────────────
  function addGroup({ name, color, members }) {
    const group = { id: genId(), name, color: color || 'mint', members, createdAt: new Date().toISOString() }
    setGroups(prev => [...prev, group])
    return group
  }

  function deleteGroup(groupId) {
    setGroups(prev => prev.filter(g => g.id !== groupId))
    setExpenses(prev => prev.filter(e => e.groupId !== groupId))
  }

  // ── expense actions ───────────────────────────────────────────────────────
  function addExpense({ groupId, desc, amount, payerName, split, category }) {
    const expense = {
      id: genId(), groupId, desc,
      amount: parseFloat(amount),
      payerName, split, category,
      date: new Date().toISOString()
    }
    setExpenses(prev => [...prev, expense])
    return expense
  }

  function deleteExpense(expenseId) {
    setExpenses(prev => prev.filter(e => e.id !== expenseId))
  }

  // A settlement is recorded as a special expense:
  // payer pays receiver the exact amount — zeroing that debt
  function recordSettlement({ groupId, fromName, toName, amount }) {
    const settlement = {
      id: genId(),
      groupId,
      desc: `${fromName} settled up with ${toName}`,
      amount: parseFloat(amount),
      payerName: fromName,       // the person who owes pays
      split: [toName],           // only the receiver is in the split
      category: '✅',
      isSettlement: true,
      date: new Date().toISOString(),
    }
    setExpenses(prev => [...prev, settlement])
  }

  // ── derived helpers ───────────────────────────────────────────────────────
  function getGroupExpenses(groupId) {
    return expenses.filter(e => e.groupId === groupId)
  }

  function getGroupBalances(groupId) {
    const group = groups.find(g => g.id === groupId)
    if (!group) return {}
    const bal = {}
    group.members.forEach(m => bal[m] = 0)
    getGroupExpenses(groupId).forEach(exp => {
      if (!exp.split?.length) return
      const share = exp.amount / exp.split.length
      bal[exp.payerName] = (bal[exp.payerName] || 0) + exp.amount
      exp.split.forEach(m => { bal[m] = (bal[m] || 0) - share })
    })
    Object.keys(bal).forEach(k => { bal[k] = Math.round(bal[k] * 100) / 100 })
    return bal
  }

  function simplifyDebts(balances) {
    const creditors = [], debtors = []
    Object.entries(balances).forEach(([name, bal]) => {
      if (bal > 0.01) creditors.push({ name, bal })
      else if (bal < -0.01) debtors.push({ name, bal: Math.abs(bal) })
    })
    creditors.sort((a, b) => b.bal - a.bal)
    debtors.sort((a, b) => b.bal - a.bal)
    const txns = []
    let i = 0, j = 0
    while (i < creditors.length && j < debtors.length) {
      const amount = Math.round(Math.min(creditors[i].bal, debtors[j].bal) * 100) / 100
      if (amount > 0.01) txns.push({ from: debtors[j].name, to: creditors[i].name, amount })
      creditors[i].bal -= amount
      debtors[j].bal -= amount
      if (creditors[i].bal < 0.01) i++
      if (debtors[j].bal < 0.01) j++
    }
    return txns
  }

  function getMyTotals() {
    let owed = 0, owes = 0
    groups.forEach(g => {
      const bal = getGroupBalances(g.id)
      const me = bal[currentUser] || 0
      if (me > 0) owed += me
      else owes += Math.abs(me)
    })
    return {
      owed: Math.round(owed * 100) / 100,
      owes: Math.round(owes * 100) / 100,
    }
  }

  function getSettlementPct(groupId) {
    const exps = getGroupExpenses(groupId)
    if (!exps.length) return 0
    const totalSpent = exps.reduce((s, e) => s + e.amount, 0)
    if (totalSpent < 0.01) return 0
    const bal = getGroupBalances(groupId)
    const totalOwed = Object.values(bal).filter(v => v > 0.01).reduce((s, v) => s + v, 0)
    const settled = Math.max(0, totalSpent - totalOwed)
    return Math.min(100, Math.round((settled / totalSpent) * 100))
  }

  function getAllExpensesSorted() {
    return [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  function getGroupName(groupId) {
    return groups.find(g => g.id === groupId)?.name || 'Unknown'
  }

  function fmt(amount) {
    return `RM ${Number(amount).toFixed(2)}`
  }

  function formatDate(iso) {
    const d = new Date(iso)
    const now = new Date()
    const diff = Math.floor((now - d) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    if (diff < 7) return `${diff} days ago`
    return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })
  }

  return (
    <AppContext.Provider value={{
      groups, expenses, currentUser,
      addGroup, deleteGroup,
      addExpense, deleteExpense, recordSettlement,
      getGroupExpenses, getGroupBalances, simplifyDebts,
      getMyTotals, getSettlementPct,
      getAllExpensesSorted, getGroupName,
      fmt, formatDate,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
