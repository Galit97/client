export async function registerUser(data: any) {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('שגיאה בהרשמה');
  return res.json();
}

export async function loginUser(data: { email: string; password: string }) {
  const res = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    if (res.status === 401) {
      // Check if it's likely an email issue or password issue
      const errorData = await res.json().catch(() => ({}));
      if (errorData.message === 'Invalid email or password') {
        // We can't know for sure which one is wrong, but we can make an educated guess
        // If email format is invalid, it's likely an email issue
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          throw new Error('אימייל לא נכון');
        } else {
          throw new Error('הסיסמה שהזנת לא נכונה');
        }
      }
    }
    throw new Error('שגיאה בהתחברות');
  }
  
  return res.json(); 
}
