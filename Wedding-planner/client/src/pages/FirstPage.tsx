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
      background: 'linear-gradient(135deg, #A8D5BA 0%, #F4C2C2 50%, #C8A2C8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      direction: 'rtl',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        padding: '60px 40px',
        textAlign: 'center',
        maxWidth: '600px',
        width: '100%',
     
        border: '2px solid rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Logo/Icon */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #A8D5BA, #F4C2C2, #C8A2C8)',
          margin: '0 auto 30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
        
        }}>
          💒
        </div>

        {/* Title */}
        <h1 style={{
          margin: '0 0 15px',
          color: '#333',
          fontSize: '36px',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #A8D5BA, #C8A2C8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          ברוכים הבאים
        </h1>

        <h2 style={{
          margin: '0 0 40px',
          color: '#666',
          fontSize: '20px',
          fontWeight: '400'
        }}>
          לתכנון החתונה המושלמת שלכם
        </h2>

        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            background: 'rgba(168, 213, 186, 0.1)',
            border: '1px solid rgba(168, 213, 186, 0.3)'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📋</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>ניהול משימות</div>
          </div>
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            background: 'rgba(244, 194, 194, 0.1)',
            border: '1px solid rgba(244, 194, 194, 0.3)'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>👥</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>רשימת אורחים</div>
          </div>
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            background: 'rgba(200, 162, 200, 0.1)',
            border: '1px solid rgba(200, 162, 200, 0.3)'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>💰</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>ניהול תקציב</div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          maxWidth: '300px',
          margin: '0 auto'
        }}>
          <button 
            onClick={() => setLoginOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #a7d6ba, #b8e6b8)',
              color: '#333',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 24px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
         
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
            
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
       
            }}
          >
            התחברות
          </button>
          
          <button 
            onClick={() => setRegisterOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #f4c2c2, #c8a2c8)',
              color: '#333',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 24px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
           
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
           
            }}
          >
            יצירת משתמש חדש
          </button>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '40px',
          paddingTop: '30px',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)'
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
