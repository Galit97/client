import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../api/authService';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToLogin: () => void;
};

export default function RegisterPopup({ isOpen, onClose, onSuccess, onSwitchToLogin }: Props) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Bride', // ברירת מחדל
    profileImage: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert('הסיסמאות אינן תואמות');
      return;
    }

    setIsLoading(true);
    try {
      const dataToSend = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: form.role,
        profileImage: form.profileImage
      };

      await registerUser(dataToSend);
      console.log('נרשמת בהצלחה');
      onClose();
      onSuccess();
      navigate('/dashboard'); 
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    onClose();
    onSwitchToLogin();
  };

  const getRoleText = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'Bride': 'כלה',
      'Groom': 'חתן',
      'MotherOfBride': 'אמא של הכלה',
      'MotherOfGroom': 'אמא של החתן',
      'FatherOfBride': 'אבא של הכלה',
      'FatherOfGroom': 'אבא של החתן',
      'Planner': 'מפיק',
      'Other': 'אחר'
    };
    return roleMap[role] || role;
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
        direction: 'rtl',
        padding: '20px'
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
          position: 'relative',
        
         
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
            💝
          </div>
          <h2 style={{
            margin: 0,
            color: '#0F172A',
            fontSize: '26px',
            fontWeight: 'bold'
          }}>
            צור חשבון חדש
          </h2>
          <p style={{
            margin: '8px 0 0',
            color: '#475569',
            fontSize: '14px'
          }}>
            הצטרף אלינו לתכנון החתונה המושלמת
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Name Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#0F172A',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                שם פרטי
              </label>
              <input
                name="firstName"
                placeholder="הכנס שם פרטי"
                value={form.firstName}
                onChange={handleChange}
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
                שם משפחה
              </label>
              <input
                name="lastName"
                placeholder="הכנס שם משפחה"
                value={form.lastName}
                onChange={handleChange}
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
          </div>

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
              name="email"
              type="email"
              placeholder="הכנס את האימייל שלך"
              value={form.email}
              onChange={handleChange}
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

          {/* Password Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
                name="password"
                placeholder="הכנס סיסמה"
                value={form.password}
                onChange={handleChange}
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
                אישור סיסמה
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="אשר סיסמה"
                value={form.confirmPassword}
                onChange={handleChange}
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
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#0F172A',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              תפקיד
            </label>
            <select 
              name="role" 
              value={form.role} 
              onChange={handleChange} 
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1E5A78';
         
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E5E7EB';
            
              }}
            >
              <option value="Bride">כלה</option>
              <option value="Groom">חתן</option>
              <option value="MotherOfBride">אמא של הכלה</option>
              <option value="MotherOfGroom">אמא של החתן</option>
              <option value="FatherOfBride">אבא של הכלה</option>
              <option value="FatherOfGroom">אבא של החתן</option>
              <option value="Planner">מפיק</option>
              <option value="Other">אחר</option>
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#0F172A',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              תמונת פרופיל (אופציונלי)
            </label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                backgroundColor: '#FAFAFA'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className='button'
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
            {isLoading ? 'יוצר חשבון...' : 'צור חשבון'}
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
            כבר יש לך חשבון?{' '}
            <span 
              onClick={handleSwitchToLogin}
              style={{
                color: '#1E5A78',
                cursor: 'pointer',
                fontWeight: '600',
                textDecoration: 'underline'
              }}
            >
              התחבר כאן
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
