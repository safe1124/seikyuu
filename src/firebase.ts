// Firebase 초기화 및 인증 모듈
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAIrILBzM_wyUX4TBDa_XMbFKQsMz0zzVE",
  authDomain: "kogapay-ea90a.firebaseapp.com",
  projectId: "kogapay-ea90a",
  storageBucket: "kogapay-ea90a.appspot.com",
  messagingSenderId: "671842369437",
  appId: "1:671842369437:web:955e900cc463fcfd4db974",
  measurementId: "G-57MCRTHL4G"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const provider = new GoogleAuthProvider()

// 사용자 인터페이스
export interface UserData {
  uid: string
  email: string
  displayName: string
  userCode: string  // 6자리 개별코드
  targetCode?: string  // 연결된 상대방 코드
  role?: 'child' | 'parent'
}

// 청구 인터페이스
export interface Bill {
  id: string
  fromUid: string  // 청구인 UID
  toUid?: string   // 피청구인 UID
  food: string
  price: number
  status: 'pending' | 'approved' | 'rejected'
  date: string
  targetCode?: string  // 대상 코드
}
