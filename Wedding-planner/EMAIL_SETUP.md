# הגדרת שירות אימייל עם Resend

## שלב 1: יצירת חשבון Resend

1. היכנס ל-[Resend.com](https://resend.com)
2. לחץ על "Sign Up" ויצור חשבון חינמי
3. אימות החשבון (אימייל + טלפון)

## שלב 2: קבלת API Key

1. לאחר ההתחברות, עבור ל-"API Keys"
2. לחץ על "Create API Key"
3. תן שם כמו "Wedding Planner Production"
4. העתק את ה-API Key

## שלב 3: הגדרת Domain (אופציונלי)

### אפשרות A: שימוש ב-Domain מותאם אישית
1. עבור ל-"Domains"
2. לחץ על "Add Domain"
3. הוסף את הדומיין שלך (למשל: `mail.yourdomain.com`)
4. הוסף את רשומות ה-DNS הנדרשות
5. המתן לאימות (עד 24 שעות)

### אפשרות B: שימוש ב-Domain של Resend
- השתמש ב-`@resend.dev` (מוגבל ל-100 אימיילים ביום)

## שלב 4: הגדרת משתני הסביבה

צור קובץ `.env` בתיקיית השרת:

```env
# Email Service
RESEND_API_KEY=re_your_api_key_here
FRONTEND_URL=http://localhost:5173

# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret
```

## שלב 5: עדכון כתובת השולח

בקובץ `services/emailService.ts`, שנה את השורה:

```typescript
from: 'Wedding Planner <noreply@yourdomain.com>',
```

ל:

```typescript
from: 'Wedding Planner <noreply@resend.dev>', // או הדומיין שלך
```

## שלב 6: בדיקה

1. הפעל את השרת
2. נסה את פונקציית "שכחתי סיסמה"
3. בדוק אם האימייל נשלח בהצלחה

## תכונות המערכת

### ✅ אימייל איפוס סיסמה
- עיצוב יפה ומותאם לעברית
- סיסמה זמנית מוצפנת
- הוראות ברורות למשתמש
- אזהרות אבטחה

### ✅ אימייל ברוכים הבאים
- נשלח בעת הרשמה
- מציג את תכונות המערכת
- עיצוב מותאם למותג

### ✅ אבטחה
- סיסמאות מוצפנות עם bcrypt
- אימיילים נשלחים דרך שירות מאובטח
- טיפול בשגיאות

## עלויות

- **Resend**: חינמי עד 3,000 אימיילים בחודש
- **Domain מותאם**: תלוי בספק הדומיין שלך
- **SSL Certificate**: כלול ב-Resend

## פתרון בעיות

### האימייל לא נשלח
1. בדוק שה-API Key נכון
2. בדוק שהדומיין מאומת
3. בדוק את הלוגים בשרת

### האימייל מגיע לספאם
1. הגדר SPF ו-DKIM records
2. השתמש בדומיין מותאם אישית
3. הוסף את כתובת האימייל לרשימת הלבן

### שגיאת API
1. בדוק את ה-API Key
2. בדוק את מגבלות החשבון
3. בדוק את הלוגים ב-Resend Dashboard

## תמיכה

- [תיעוד Resend](https://resend.com/docs)
- [מדריך API](https://resend.com/docs/api-reference)
- [פורום תמיכה](https://resend.com/support) 