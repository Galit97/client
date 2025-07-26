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

  return (
    <div>
      <h1>ברוכים הבאים</h1>

      <button onClick={() => setLoginOpen(true)}>התחברות</button>
      <button onClick={() => setRegisterOpen(true)}>יצירת משתמש</button>

      <LoginPopup
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={onLoginSuccess}
      />
      <RegisterPopup
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSuccess={onRegisterSuccess}
      />
    </div>
  )
}
