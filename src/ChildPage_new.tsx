import { useState, useEffect } from 'react'
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'
import type { UserData, Bill } from './firebase'

interface ChildPageProps {
  userData: UserData
}

export default function ChildPage({ userData }: ChildPageProps) {
  const [food, setFood] = useState('')
  const [price, setPrice] = useState('')
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 자신이 생성한 청구 내역을 실시간으로 조회
    const q = query(
      collection(db, 'bills'),
      where('fromUid', '==', userData.uid),
      orderBy('date', 'desc')
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const billsData: Bill[] = []
      querySnapshot.forEach((doc) => {
        billsData.push({ id: doc.id, ...doc.data() } as Bill)
      })
      setBills(billsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userData.uid])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!food || !price) return

    // 타겟 코드가 설정되지 않은 경우 경고
    if (!userData.targetCode) {
      alert('先に相手のコードを設定してください')
      return
    }

    try {
      const newBill: Omit<Bill, 'id'> = {
        fromUid: userData.uid,
        food,
        price: Number(price),
        status: 'pending',
        date: new Date().toISOString(),
        targetCode: userData.targetCode
      }

      await addDoc(collection(db, 'bills'), newBill)
      setFood('')
      setPrice('')
      alert('請求を送信しました')
    } catch (error) {
      console.error('청구 생성 에러:', error)
      alert('請求の送信に失敗しました')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP')
  }

  return (
    <main style={{ padding: '1.5rem 0.5rem', maxWidth: 430, margin: '0 auto', width: '100%' }}>
      <h2 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: 16 }}>請求人ページ</h2>
      
      {!userData.targetCode && (
        <div style={{ background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: 8, padding: 12, marginBottom: 16, textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#856404' }}>
            請求を送信するには相手のコードを設定してください
          </p>
        </div>
      )}

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
        <button 
          type="submit" 
          disabled={!userData.targetCode}
          style={{ 
            padding: 12, 
            fontSize: '1.1rem', 
            borderRadius: 8, 
            background: userData.targetCode ? '#4f8cff' : '#ccc', 
            color: '#fff', 
            border: 'none',
            cursor: userData.targetCode ? 'pointer' : 'not-allowed'
          }}
        >
          請求する
        </button>
      </form>

      <section>
        <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>請求履歴</h3>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#888' }}>読み込み中...</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {bills.length === 0 && (
              <li style={{ color: '#aaa', textAlign: 'center' }}>請求履歴がありません。</li>
            )}
            {bills.map(bill => (
              <li key={bill.id} style={{ background: '#f1f3f5', borderRadius: 10, padding: '10px 14px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{bill.food}</div>
                  <div style={{ fontSize: 13, color: '#888' }}>{formatDate(bill.date)}</div>
                  {bill.targetCode && (
                    <div style={{ fontSize: 12, color: '#666' }}>送信先: {bill.targetCode}</div>
                  )}
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
        )}
      </section>
    </main>
  )
}
