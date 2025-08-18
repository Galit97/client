import { useState } from "react";
import { loginUser } from "../../api/authService";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToRegister: () => void;
};

export default function LoginPopup({ isOpen, onClose, onSuccess, onSwitchToRegister }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Clear previous errors
    
    try {
      const data = await loginUser({ email, password });
      console.log("התחברות הצליחה", data);
      localStorage.setItem("token", data.token);
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      onClose();
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert('אנא הכנס את האימייל שלך תחילה');
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const response = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.emailError) {
          // Email failed, show password in alert
          alert(`סיסמה זמנית נוצרה: ${result.tempPassword}\n\n${result.note}`);
          setPassword(result.tempPassword);
        } else {
          // Email sent successfully
          alert(`${result.message}\n\n${result.note}`);
        }
      } else {
        const error = await response.json();
        alert('שגיאה: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('שגיאה בשחזור סיסמה');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleSwitchToRegister = () => {
    onClose();
    onSwitchToRegister();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        direction: 'rtl'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            background: 'none',
         
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F4C2C2';
            e.currentTarget.style.color = '#333';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#666';
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #F4C2C2, #C8A2C8)',
            margin: '0 auto 15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px'
          }}>
            💒
          </div>
          <h2 style={{
            margin: 0,
            color: '#333',
            fontSize: '26px',
            fontWeight: 'bold'
          }}>
            ברוכים הבאים
          </h2>
          <p style={{
            margin: '8px 0 0',
            color: '#666',
            fontSize: '14px'
          }}>
            התחבר לחשבון שלך
          </p>
        </div>

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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              אימייל
            </label>
            <input
              type="email"
              placeholder="הכנס את האימייל שלך"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null); // Clear error when user starts typing
              }}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
              
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#F4C2C2';
            
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E0E0E0';
             
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              סיסמה
            </label>
            <input
              type="password"
              placeholder="הכנס את הסיסמה שלך"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null); // Clear error when user starts typing
              }}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
             
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#F4C2C2';
        
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E0E0E0';
             
              }}
            />
            
            {/* Forgot Password Link */}
            <div style={{ textAlign: 'left', marginTop: '8px' }}>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={forgotPasswordLoading}
                style={{
                  background: 'none',
                
                  color: '#f4c2c2',
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
            style={{
              background: 'linear-gradient(135deg, #f4c2c2, #c8a2c8)',
              color: '#333',
            
              borderRadius: '8px',
              padding: '16px 20px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginTop: '10px',
              opacity: isLoading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
           
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(0)';
               
              }
            }}
          >
            {isLoading ? 'מתחבר...' : 'התחבר'}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '25px',
          paddingTop: '20px',
          borderTop: '1px solid #E0E0E0'
        }}>
          <p style={{
            margin: 0,
            color: '#666',
            fontSize: '13px'
          }}>
            אין לך חשבון?{' '}
            <span 
              onClick={handleSwitchToRegister}
              style={{
                color: '#f4c2c2',
                cursor: 'pointer',
                fontWeight: '600',
                textDecoration: 'underline'
              }}
            >
              צור חשבון חדש
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
