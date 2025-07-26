import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../api/authService';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function RegisterPopup({ isOpen, onClose, onSuccess }: Props) {
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
    }
  };

  return (
    <div onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close">X</button>

        <form onSubmit={handleSubmit}>
          <input
            name="firstName"
            placeholder="שם פרטי"
            value={form.firstName}
            onChange={handleChange}
            required
          />
          <input
            name="lastName"
            placeholder="שם משפחה"
            value={form.lastName}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            placeholder="אימייל"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="סיסמה"
            value={form.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="אישור סיסמה"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <select name="role" value={form.role} onChange={handleChange} required>
            <option value="Bride">כלה</option>
            <option value="Groom">חתן</option>
            <option value="MotherOfBride">אמא של הכלה</option>
            <option value="MotherOfGroom">אמא של החתן</option>
            <option value="FatherOfBride">אבא של הכלה</option>
            <option value="FatherOfGroom">אבא של החתן</option>
            <option value="Planner">מפיק</option>
            <option value="Other">אחר</option>
          </select>

          <input type="file" accept="image/*" onChange={handleImageChange} />

          <button type="submit">צור משתמש</button>
        </form>
      </div>
    </div>
  );
}
