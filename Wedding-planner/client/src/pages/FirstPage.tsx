import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../api/authService'
import RegisterPopup from '../components/Register/RegisterPopup'
import { useNotification } from '../components/Notification/NotificationContext'

export default function FirstPage() {
  const { showNotification } = useNotification();
  const [registerOpen, setRegisterOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await loginUser({ email, password })
      console.log("התחברות הצליחה", data)
      localStorage.setItem("token", data.token)
      localStorage.setItem("currentUser", JSON.stringify(data.user))
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      showNotification('אנא הכנס את האימייל שלך תחילה', 'warning')
      return
    }

    setForgotPasswordLoading(true)
    try {
      const response = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      
      if (response.ok) {
        const result = await response.json()
        
        if (result.emailError) {
          showNotification(`סיסמה זמנית נוצרה: ${result.tempPassword}\n\n${result.note}`, 'success')
          setPassword(result.tempPassword)
        } else {
          showNotification(`${result.message}\n\n${result.note}`, 'success')
        }
      } else {
        const error = await response.json()
        showNotification('שגיאה: ' + error.message, 'error')
      }
    } catch (error) {
      console.error('Error:', error)
      showNotification('שגיאה בשחזור סיסמה', 'error')
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  const onRegisterSuccess = () => {
    setRegisterOpen(false)
    navigate('/dashboard') 
  }

  const switchToRegister = () => {
    setRegisterOpen(true)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAFA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      direction: 'rtl',
      padding: '20px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '40px 30px',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        {/* Logo/Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#EFF5FB',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          border: '2px solid #E5E7EB'
        }}>
          💒
        </div>

        {/* Title */}
        <h1 style={{
          margin: '0 0 15px',
          color: '#0F172A',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          ברוכים הבאים
        </h1>

        <h2 style={{
          margin: '0 0 30px',
          color: '#475569',
          fontSize: '18px',
          fontWeight: '400'
        }}>
         תכננו את החתונה שלכם בקלות ובפשטות
        </h2>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#0F172A',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'right'
            }}>
              אימייל
            </label>
            <input
              type="email"
              placeholder="הכנס את האימייל שלך"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null)
              }}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1E5A78'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E5E7EB'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#0F172A',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'right'
            }}>
              סיסמה
            </label>
            <input
              type="password"
              placeholder="הכנס את הסיסמה שלך"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null)
              }}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1E5A78'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E5E7EB'
              }}
            />
            
            {/* Forgot Password Link */}
            <div style={{ textAlign: 'right', marginTop: '8px' }}>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={forgotPasswordLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1E5A78',
                  fontSize: '12px',
                  cursor: forgotPasswordLoading ? 'not-allowed' : 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  opacity: forgotPasswordLoading ? 0.6 : 1
                }}
              >
                {forgotPasswordLoading ? 'שולח...' : 'שכחתי סיסמה'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
           className='button'
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(0)'
              }
            }}
          >
            {isLoading ? 'מתחבר...' : 'התחברות'}
          </button>
        </form>

        {/* Registration Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #E5E7EB'
        }}>
          <p style={{
            margin: 0,
            color: '#475569',
            fontSize: '16px'
          }}>
            עדיין לא רשום?{' '}
            <br />
            <span 
              onClick={switchToRegister}
              style={{
                color: '#1E5A78',
                cursor: 'pointer',
                fontWeight: '600',
                textDecoration: 'underline'
              }}
            >
              לחצו כאן ליצירת משתמש
            </span>
          </p>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid #E5E7EB'
        }}>
          <p style={{
            margin: 0,
            color: '#475569',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            הצטרפו אלינו לתכנון החתונה המושלמת שלכם ✨
          </p>
        </div>
      </div>

      <RegisterPopup
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSuccess={onRegisterSuccess}
        onSwitchToLogin={() => setRegisterOpen(false)}
      />
    </div>
  )
}
