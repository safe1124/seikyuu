import { useState, useEffect } from 'react'
import type { User, Bill } from './types'
import { getBillsByUserOnline, updateBillOnline, getAllUsers } from './userUtils'

interface ParentPageProps {
  user: User
}

function getMonth(date: string) {
  return date.slice(0, 7)
}

export default function ParentPage({ user }: ParentPageProps) {
  const [bills, setBills] = useState<Bill[]>([])
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => {
    // 자신에게 온 청구 내역을 Supabase에서 조회
    const fetchBills = async () => {
      try {
        const userBills = await getBillsByUserOnline(user.id, 'to')
        setBills(userBills || [])
      } catch {
        setBills([])
      }
    }
    fetchBills()
  }, [user.id])

  const months = Array.from(new Set(bills.map(b => getMonth(b.date)))).sort((a, b) => b.localeCompare(a))

  const handleStatus = async (billId: string, status: 'approved' | 'rejected') => {
    await updateBillOnline(billId, { status })
    const userBills = await getBillsByUserOnline(user.id, 'to')
    setBills(userBills || [])
  }

  const filtered = bills
    .filter(bill => getMonth(bill.date) === selectedMonth)
    .sort((a, b) => Number(b.id) - Number(a.id)); // Sort by ID descending

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP')
  }

  const getSenderName = (fromUserId: string) => {
    const allUsers = getAllUsers()
    const sender = allUsers.find(u => u.id === fromUserId)
    return sender ? sender.name : `ユーザー ${fromUserId.slice(-4)}`
  }

  // Calculate total for the selected month
  const calculateSelectedMonthTotal = () => {
    return filtered
      .reduce((total, bill) => total + bill.price, 0);
  };

  const selectedMonthTotal = calculateSelectedMonthTotal();

  return (
    <main style={{ padding: '1.5rem 0.5rem', maxWidth: 430, margin: '0 auto', width: '100%' }}>
      <h2 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: 16 }}>被請求人ページ</h2>
      
      <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <label style={{ fontWeight: 600, marginRight: 8 }}>月選択:</label>
          <select 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(e.target.value)} 
            style={{ fontSize: '1.05rem', padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
          >
            {months.length === 0 && <option>履歴なし</option>}
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
        <div style={{ padding: '10px', background: '#e9ecef', borderRadius: 8, textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#495057' }}>選択月の総額</h3>
          <p style={{ margin: '4px 0 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#212529' }}>
            {selectedMonthTotal.toLocaleString()}円
          </p>
        </div>
      </div>

      <section>
        <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>請求履歴</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {filtered.length === 0 && (
            <li style={{ color: '#aaa', textAlign: 'center' }}>請求履歴がありません。</li>
          )}
          {filtered.map(bill => (
            <li key={bill.id} style={{ background: '#f1f3f5', borderRadius: 10, padding: '10px 14px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{bill.food}</div>
                <div style={{ fontSize: 13, color: '#888' }}>{formatDate(bill.date)}</div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  送信者: {getSenderName(bill.fromUserId)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600 }}>{bill.price.toLocaleString()}円</div>
                <div style={{ fontSize: 13, color: bill.status === 'pending' ? '#f39c12' : bill.status === 'approved' ? '#27ae60' : '#e74c3c' }}>
                  {bill.status === 'pending' ? '保留中' : bill.status === 'approved' ? '承認済み' : '却下'}
                </div>
                {bill.status === 'pending' && (
                  <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                    <button 
                      onClick={() => handleStatus(bill.id, 'approved')} 
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.9rem',
                        borderRadius: '10px',
                        background: 'rgba(39, 174, 96, 0.7)', // Greenish, semi-transparent
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        cursor: 'pointer',
                        transition: 'background 0.3s ease'
                      }}
                      onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = 'rgba(39, 174, 96, 0.9)'}
                      style={{ 
                        background: '#e74c3c', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: 6, 
                        padding: '4px 10px', 
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      却下
                    </button>
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