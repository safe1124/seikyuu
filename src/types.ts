// 사용자 및 청구 데이터 타입 정의
export interface User {
  id: string
  name: string
  email: string
  userCode: string
  targetCode?: string
  role?: 'child' | 'parent'
}

export interface Bill {
  id: string
  fromUserId: string
  toUserId?: string
  food: string
  price: number
  status: 'pending' | 'approved' | 'rejected'
  date: string
  targetCode?: string
}

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  CURRENT_USER: 'kogapay_current_user',
  ALL_USERS: 'kogapay_all_users',
  BILLS: 'kogapay_bills'
}
