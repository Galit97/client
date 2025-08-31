import { useState } from "react";
import { loginUser } from "../../api/authService";
import { useNotification } from "../Notification/NotificationContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToRegister: () => void;
};

export default function LoginPopup({ isOpen, onClose, onSuccess, onSwitchToRegister }: Props) {
  const { showNotification } = useNotification();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Clear previous errors
    
    try {
      const data = await loginUser({ email, password });
    
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
      showNotification('אנא הכנס את האימייל שלך תחילה', 'warning');
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
          showNotification(`סיסמה זמנית נוצרה: ${result.tempPassword}\n\n${result.note}`, 'success');
          setPassword(result.tempPassword);
        } else {
          // Email sent successfully
          showNotification(`${result.message}\n\n${result.note}`, 'success');
        }
      } else {
        const error = await response.json();
        showNotification('שגיאה: ' + error.message, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('שגיאה בשחזור סיסמה', 'error');
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
        backgroundColor: 'rgba(0,0,0,0.20)',
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
          background: '#FFFFFF',
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
            color: '#475569',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#EFF5FB';
            e.currentTarget.style.color = '#0F172A';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#475569';
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
            background: 'linear-gradient(135deg, #1E5A78, #2C6B8B)',
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
            color: '#0F172A',
            fontSize: '26px',
            fontWeight: 'bold'
          }}>
            ברוכים הבאים
          </h2>
          <p style={{
            margin: '8px 0 0',
            color: '#475569',
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
              color: '#0F172A',
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
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1E5A78';
            
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E5E7EB';
             
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#0F172A',
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
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1E5A78';
        
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E5E7EB';
             
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
            style={{
              background: 'linear-gradient(135deg, #1E5A78, #2C6B8B)',
              color: '#FFFFFF',
            
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
          borderTop: '1px solid #E5E7EB'
        }}>
          <p style={{
            margin: 0,
            color: '#475569',
            fontSize: '13px'
          }}>
            אין לך חשבון?{' '}
            <span 
              onClick={handleSwitchToRegister}
              style={{
                color: '#1E5A78',
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
