import { useState } from 'react'

type Bill = {
  id: number
  food: string
  price: number
  status: 'pending' | 'approved' | 'rejected'
  date: string // YYYY-MM-DD
}

export default function ChildPage() {
  const [food, setFood] = useState('')
  const [price, setPrice] = useState('')
  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('bills')
    return saved ? JSON.parse(saved) : []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!food || !price) return
    const newBill: Bill = {
      id: Date.now(),
      food,
      price: Number(price),
      status: 'pending',
      date: new Date().toISOString().slice(0, 10),
    }
    const updated = [newBill, ...bills]
    setBills(updated)
    localStorage.setItem('bills', JSON.stringify(updated))
    setFood('')
    setPrice('')
  }

  return (
    <main style={{ padding: '1.5rem 0.5rem', maxWidth: 430, margin: '0 auto', width: '100%' }}>
      <h2 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: 16 }}>請求人ページ</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="食べ物の名前"
          value={food}
          onChange={e => setFood(e.target.value)}
          style={{ fontSize: '1.1rem', padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
        />
        <input
          type="number"
          placeholder="値段(円)"
          value={price}
          onChange={e => setPrice(e.target.value)}
          style={{ fontSize: '1.1rem', padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: 12, fontSize: '1.1rem', borderRadius: 8, background: '#4f8cff', color: '#fff', border: 'none' }}>
          請求する
        </button>
      </form>
      <section>
        <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>請求履歴</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {bills.length === 0 && <li style={{ color: '#aaa', textAlign: 'center' }}>請求履歴がありません。</li>}
          {bills.map(bill => (
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
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
