import { useState } from 'react'

type Bill = {
  id: number
  food: string
  price: number
  status: 'pending' | 'approved' | 'rejected'
  date: string // YYYY-MM-DD
}

function getMonth(date: string) {
  return date.slice(0, 7)
}

export default function ParentPage() {
  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('bills')
    return saved ? JSON.parse(saved) : []
  })
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const months = Array.from(new Set(bills.map(b => getMonth(b.date)))).sort((a, b) => b.localeCompare(a))

  const handleStatus = (id: number, status: 'approved' | 'rejected') => {
    const updated = bills.map(bill => bill.id === id ? { ...bill, status } : bill)
    setBills(updated)
    localStorage.setItem('bills', JSON.stringify(updated))
  }

  const filtered = bills.filter(bill => getMonth(bill.date) === selectedMonth)

  return (
    <main style={{ padding: '1.5rem 0.5rem', maxWidth: 430, margin: '0 auto', width: '100%' }}>
      <h2 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: 16 }}>被請求人ページ</h2>
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontWeight: 600, marginRight: 8 }}>月選択:</label>
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ fontSize: '1.05rem', padding: 6, borderRadius: 6 }}>
          {months.length === 0 && <option>履歴なし</option>}
          {months.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </div>
      <section>
        <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>請求履歴</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {filtered.length === 0 && <li style={{ color: '#aaa', textAlign: 'center' }}>請求履歴がありません。</li>}
          {filtered.map(bill => (
            <li key={bill.id} style={{ background: '#f1f3f5', borderRadius: 10, padding: '10px 14px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{bill.food}</div>
                <div style={{ fontSize: 13, color: '#888' }}>{bill.date}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600 }}>{bill.price.toLocaleString()}円</div>
                <div style={{ fontSize: 13, color: bill.status === 'pending' ? '#f39c12' : bill.status === 'approved' ? '#27ae60' : '#e74c3c' }}>
                  {bill.status === 'pending' ? '保留中' : bill.status === 'approved' ? '承認済み' : '却下'}
                </div>
                {bill.status === 'pending' && (
                  <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                    <button onClick={() => handleStatus(bill.id, 'approved')} style={{ background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 13 }}>承認</button>
                    <button onClick={() => handleStatus(bill.id, 'rejected')} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 13 }}>却下</button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
