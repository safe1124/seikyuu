// Firebase 초기화 및 인증 모듈
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

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
export const provider = new GoogleAuthProvider()
