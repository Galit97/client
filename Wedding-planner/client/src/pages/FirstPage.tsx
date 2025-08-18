import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginPopup from '../components/Login/LoginPopup'
import RegisterPopup from '../components/Register/RegisterPopup'

export default function FirstPage() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const navigate = useNavigate()

  const onLoginSuccess = () => {
    setLoginOpen(false)
    navigate('/dashboard') 
  }

  const onRegisterSuccess = () => {
    setRegisterOpen(false)
    navigate('/dashboard') 
  }

  const switchToRegister = () => {
    setLoginOpen(false)
    setRegisterOpen(true)
  }

  const switchToLogin = () => {
    setRegisterOpen(false)
    setLoginOpen(true)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      direction: 'rtl',
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '40px 30px',
        textAlign: 'center',
        maxWidth: '600px',
        width: '100%'
      }}>
        {/* Logo/Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#f8f9fa',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          border: '2px solid #e9ecef'
        }}>
          💒
        </div>

        {/* Title */}
        <h1 style={{
          margin: '0 0 15px',
          color: '#333',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          ברוכים הבאים
        </h1>

        <h2 style={{
          margin: '0 0 30px',
          color: '#666',
          fontSize: '18px',
          fontWeight: '400'
        }}>
         תכננו את החתונה שלכם בקלות ובפשטות
        </h2>

        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div style={{
            padding: '15px',
            borderRadius: '12px',
            background: '#f8f9fa',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>📋</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>ניהול משימות</div>
          </div>
          <div style={{
            padding: '15px',
            borderRadius: '12px',
            background: '#f8f9fa',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>👥</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>רשימת אורחים</div>
          </div>
          <div style={{
            padding: '15px',
            borderRadius: '12px',
            background: '#f8f9fa',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>💰</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>ניהול תקציב בזמן אמת</div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '300px',
          margin: '0 auto'
        }}>
          <button 
            onClick={() => setLoginOpen(true)}
            style={{
              background: '#ffffff',
              color: '#333',
              border: '2px solid #333',
              borderRadius: '8px',
              padding: '14px 20px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            התחברות
          </button>
          
          <button 
            onClick={() => setRegisterOpen(true)}
            style={{
              background: '#ffffff',
              color: '#333',
              border: '2px solid #333',
              borderRadius: '8px',
              padding: '14px 20px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            יצירת משתמש חדש
          </button>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid #e9ecef'
        }}>
          <p style={{
            margin: 0,
            color: '#666',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            הצטרפו אלינו לתכנון החתונה המושלמת שלכם ✨
          </p>
        </div>
      </div>

      <LoginPopup
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={onLoginSuccess}
        onSwitchToRegister={switchToRegister}
      />
      <RegisterPopup
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSuccess={onRegisterSuccess}
        onSwitchToLogin={switchToLogin}
      />
    </div>
  )
}
