import { useState, useEffect } from 'react'
import ChildPage from './ChildPage'
import ParentPage from './ParentPage'
import { auth, provider, UserData } from './firebase'
import { signInWithPopup, signOut, onAuthStateChanged, signInWithRedirect, getRedirectResult } from 'firebase/auth'
import { getUserData, saveUserData, generateUniqueUserCode, setTargetCode, findUserByCode } from './userUtils'
import type { User } from 'firebase/auth'
import './App.css'

import { useState, useEffect } from 'react'
import ChildPage from './ChildPage'
import ParentPage from './ParentPage'
import { auth, provider } from './firebase'
import type { UserData } from './firebase'
import { signInWithPopup, signOut, onAuthStateChanged, signInWithRedirect, getRedirectResult } from 'firebase/auth'
import { getUserData, saveUserData, generateUniqueUserCode, setTargetCode, findUserByCode } from './userUtils'
import type { User } from 'firebase/auth'
import './App.css'

function App() {
  const [role, setRole] = useState<'child' | 'parent' | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [inputCode, setInputCode] = useState('')
  const [codeError, setCodeError] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        // 사용자 데이터 조회 또는 생성
        try {
          let existingUserData = await getUserData(user.uid)
          
          if (!existingUserData) {
            // 새 사용자인 경우 코드 생성
            const userCode = await generateUniqueUserCode()
            existingUserData = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              userCode: userCode
            }
            await saveUserData(existingUserData)
          }
          
          setUserData(existingUserData)
        } catch (error) {
          console.error('사용자 데이터 처리 에러:', error)
        }
      } else {
        setUserData(null)
        setRole(null)
      }
      
      setLoading(false)
    })
    
    // 리다이렉트 결과 확인 (사파리 대안)
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        setUser(result.user)
      }
    }).catch((error) => {
      console.error('리다이렉트 로그인 에러:', error)
    })
    
    return () => unsubscribe()
  }, [])

  const handleLogin = async () => {
    try {
      // 구글 로그인 최적화 설정
      provider.setCustomParameters({
        prompt: 'select_account',
        login_hint: undefined
      })
      
      // 사파리를 위한 설정
      if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
        // 사파리에서는 리다이렉트 방식 우선 사용
        try {
          await signInWithRedirect(auth, provider)
        } catch (error: any) {
          console.error('리다이렉트 로그인 에러:', error)
          // 리다이렉트 실패 시 팝업 시도
          await signInWithPopup(auth, provider)
        }
      } else {
        // 다른 브라우저에서는 팝업 방식 우선 사용
        try {
          await signInWithPopup(auth, provider)
        } catch (error: any) {
          if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
            alert('팝업이 차단되었습니다. 페이지가 새로고침됩니다.')
            await signInWithRedirect(auth, provider)
          } else {
            throw error
          }
        }
      }
    } catch (error: any) {
      console.error('로그인 에러:', error)
      alert('Googleログインに失敗しました: ' + error.message)
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    setUser(null)
    setUserData(null)
    setRole(null)
    setShowCodeInput(false)
    setInputCode('')
    setCodeError('')
  }

  const handleCodeSubmit = async () => {
    if (inputCode.length !== 6) {
      setCodeError('6桁のコードを入力してください')
      return
    }

    try {
      const targetUser = await findUserByCode(inputCode)
      if (!targetUser) {
        setCodeError('コードが見つかりません')
        return
      }

      if (targetUser.uid === user?.uid) {
        setCodeError('自分のコードは設定できません')
        return
      }

      // 타겟 코드 설정
      await setTargetCode(user!.uid, inputCode)
      
      // 사용자 데이터 업데이트
      const updatedUserData = { ...userData!, targetCode: inputCode }
      setUserData(updatedUserData)
      
      setShowCodeInput(false)
      setInputCode('')
      setCodeError('')
      alert(`${targetUser.displayName || targetUser.email}と接続されました`)
    } catch (error) {
      console.error('코드 설정 에러:', error)
      setCodeError('コードの設定に失敗しました')
    }
  }

  const handleRoleSelect = async (selectedRole: 'child' | 'parent') => {
    setRole(selectedRole)
    
    // 역할을 사용자 데이터에 저장
    if (userData) {
      const updatedUserData = { ...userData, role: selectedRole }
      await saveUserData(updatedUserData)
      setUserData(updatedUserData)
    }
  }

  if (loading) {
    return (
      <main style={{ padding: '2rem 1rem', width: '100%', minHeight: '100vh', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 32 }}>読み込み中...</h1>
      </main>
    )
  }

  if (!user || !userData) {
    return (
      <main style={{ padding: '2rem 1rem', width: '100%', minHeight: '100vh', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 32, textAlign: 'center' }}>KogaPay</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: 32, textAlign: 'center', color: '#666' }}>
          家族間の食べ物請求アプリ
        </p>
        <button 
          onClick={handleLogin} 
          style={{ 
            fontSize: '1.2rem', 
            padding: '1rem 2.5rem', 
            borderRadius: 12, 
            background: '#4285F4', 
            color: '#fff', 
            border: 'none', 
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(66, 133, 244, 0.3)'
          }}
        >
          Googleでログイン
        </button>
      </main>
    )
  }

  if (!role) {
    return (
      <main style={{ padding: '2rem 1rem', width: '100%', minHeight: '100vh', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 16 }}>こんにちは、{userData.displayName}さん</h1>
          <div style={{ background: '#f8f9fa', padding: '12px 20px', borderRadius: 8, display: 'inline-block', marginBottom: 8 }}>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>あなたのコード: </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace' }}>{userData.userCode}</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#888', margin: 0 }}>このコードを相手に教えてください</p>
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: 24 }}>役割を選択してください</h2>
        
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexDirection: 'column', width: '100%', maxWidth: 300 }}>
          <button 
            onClick={() => handleRoleSelect('child')} 
            style={{ 
              fontSize: '1.2rem', 
              padding: '1.2rem', 
              borderRadius: 12, 
              background: '#4f8cff', 
              color: '#fff', 
              border: 'none', 
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            請求人（子供）
          </button>
          <button 
            onClick={() => handleRoleSelect('parent')} 
            style={{ 
              fontSize: '1.2rem', 
              padding: '1.2rem', 
              borderRadius: 12, 
              background: '#27ae60', 
              color: '#fff', 
              border: 'none', 
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            被請求人（親）
          </button>
        </div>

        {!userData.targetCode && (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            {!showCodeInput ? (
              <button 
                onClick={() => setShowCodeInput(true)}
                style={{ 
                  fontSize: '1rem', 
                  padding: '0.8rem 1.5rem', 
                  borderRadius: 8, 
                  background: '#e3f2fd', 
                  color: '#1976d2', 
                  border: '1px solid #1976d2',
                  cursor: 'pointer'
                }}
              >
                相手のコードを入力
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value)
                    setCodeError('')
                  }}
                  placeholder="6桁のコード"
                  maxLength={6}
                  style={{
                    fontSize: '1.2rem',
                    padding: '0.8rem',
                    borderRadius: 8,
                    border: '2px solid #ddd',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    width: 120
                  }}
                />
                {codeError && (
                  <p style={{ color: '#d32f2f', fontSize: '0.9rem', margin: 0 }}>{codeError}</p>
                )}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button 
                    onClick={handleCodeSubmit}
                    style={{ 
                      fontSize: '0.9rem', 
                      padding: '0.6rem 1.2rem', 
                      borderRadius: 6, 
                      background: '#1976d2', 
                      color: '#fff', 
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    設定
                  </button>
                  <button 
                    onClick={() => {
                      setShowCodeInput(false)
                      setInputCode('')
                      setCodeError('')
                    }}
                    style={{ 
                      fontSize: '0.9rem', 
                      padding: '0.6rem 1.2rem', 
                      borderRadius: 6, 
                      background: '#666', 
                      color: '#fff', 
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {userData.targetCode && (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <p style={{ fontSize: '0.9rem', color: '#27ae60', margin: 0 }}>
              ✓ コード {userData.targetCode} と接続済み
            </p>
          </div>
        )}

        <button 
          onClick={handleLogout} 
          style={{ 
            fontSize: '1rem', 
            color: '#888', 
            background: 'none', 
            border: 'none', 
            textDecoration: 'underline',
            cursor: 'pointer'
          }}
        >
          ログアウト
        </button>
      </main>
    )
  }

  return (
    <>
      <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 100, background: 'rgba(255,255,255,0.9)', padding: '8px 12px', borderRadius: 8, fontSize: '0.9rem' }}>
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontWeight: 'bold' }}>{userData.displayName}</span>
          <span style={{ marginLeft: 8, color: '#666' }}>({userData.userCode})</span>
        </div>
        {userData.targetCode && (
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: 4 }}>
            接続先: {userData.targetCode}
          </div>
        )}
        <button 
          onClick={handleLogout} 
          style={{ 
            fontSize: '0.8rem', 
            color: '#888', 
            background: 'none', 
            border: 'none', 
            textDecoration: 'underline',
            cursor: 'pointer'
          }}
        >
          ログアウト
        </button>
      </div>
      {role === 'child' ? <ChildPage userData={userData} /> : <ParentPage userData={userData} />}
    </>
  )
}

export default App

export default App
