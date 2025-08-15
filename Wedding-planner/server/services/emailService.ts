import { Resend } from 'resend';

const resend = new Resend('re_hmVEqtBh_FAhmjn4fWXsN7q6WAaasvYjf');

export interface EmailTemplateData {
  userName: string;
  resetLink: string;
  tempPassword?: string;
}

export const sendPasswordResetEmail = async (email: string, data: EmailTemplateData) => {
  try {
    const { data: result, error } = await resend.emails.send({
      from: 'Wedding Planner <onboarding@resend.dev>',
      to: [email],
      subject: 'איפוס סיסמה - Wedding Planner',
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>איפוס סיסמה</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .container {
              background: white;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #A8D5BA, #F4C2C2);
              border-radius: 50%;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 32px;
            }
            .title {
              color: #333;
              font-size: 24px;
              font-weight: bold;
              margin: 0;
            }
            .subtitle {
              color: #666;
              font-size: 16px;
              margin: 10px 0 0;
            }
            .content {
              margin: 30px 0;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 20px;
            }
            .message {
              font-size: 16px;
              margin-bottom: 25px;
              line-height: 1.8;
            }
            .temp-password {
              background: #f8f9fa;
              border: 2px solid #A8D5BA;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              text-align: center;
            }
            .temp-password-label {
              font-weight: bold;
              color: #333;
              margin-bottom: 10px;
            }
            .temp-password-value {
              font-size: 20px;
              font-weight: bold;
              color: #A8D5BA;
              letter-spacing: 2px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #A8D5BA, #B8E6B8);
              color: #333;
              text-decoration: none;
              padding: 15px 30px;
              border-radius: 8px;
              font-weight: bold;
              font-size: 16px;
              margin: 20px 0;
              text-align: center;
              transition: all 0.3s ease;
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(168, 213, 186, 0.3);
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .warning {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 6px;
              padding: 15px;
              margin: 20px 0;
              color: #856404;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">💒</div>
              <h1 class="title">איפוס סיסמה</h1>
              <p class="subtitle">Wedding Planner</p>
            </div>
            
            <div class="content">
              <div class="greeting">
                שלום ${data.userName}!
              </div>
              
              <div class="message">
                קיבלנו בקשה לאיפוס הסיסמה שלך ב-Wedding Planner.
              </div>
              
              <div class="temp-password">
                <div class="temp-password-label">הסיסמה הזמנית שלך:</div>
                <div class="temp-password-value">${data.tempPassword}</div>
              </div>
              
              <div class="message">
                <strong>הוראות:</strong><br>
                1. התחבר עם הסיסמה הזמנית<br>
                2. עבור להגדרות משתמש<br>
                3. שנה את הסיסמה לסיסמה חדשה ובטוחה
              </div>
              
              <div class="warning">
                <strong>⚠️ חשוב:</strong> הסיסמה הזמנית תקפה ל-24 שעות בלבד. 
                אנא שנה אותה בהקדם האפשרי.
              </div>
            </div>
            
            <div class="footer">
              <p>אם לא ביקשת איפוס סיסמה, אנא התעלם מהודעה זו.</p>
              <p>© 2024 Wedding Planner. כל הזכויות שמורות.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error('שגיאה בשליחת האימייל');
    }

    console.log('Password reset email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (email: string, userName: string) => {
  try {
    const { data: result, error } = await resend.emails.send({
      from: 'Wedding Planner <onboarding@resend.dev>',
      to: [email],
      subject: 'ברוכים הבאים ל-Wedding Planner!',
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>ברוכים הבאים</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .container {
              background: white;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #A8D5BA, #F4C2C2);
              border-radius: 50%;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 32px;
            }
            .title {
              color: #333;
              font-size: 24px;
              font-weight: bold;
              margin: 0;
            }
            .subtitle {
              color: #666;
              font-size: 16px;
              margin: 10px 0 0;
            }
            .content {
              margin: 30px 0;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 20px;
            }
            .message {
              font-size: 16px;
              margin-bottom: 25px;
              line-height: 1.8;
            }
            .features {
              background: #f8f9fa;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .feature {
              margin: 10px 0;
              padding: 10px;
              background: white;
              border-radius: 6px;
              border-right: 4px solid #A8D5BA;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #A8D5BA, #B8E6B8);
              color: #333;
              text-decoration: none;
              padding: 15px 30px;
              border-radius: 8px;
              font-weight: bold;
              font-size: 16px;
              margin: 20px 0;
              text-align: center;
              transition: all 0.3s ease;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">💒</div>
              <h1 class="title">ברוכים הבאים!</h1>
              <p class="subtitle">Wedding Planner</p>
            </div>
            
            <div class="content">
              <div class="greeting">
                שלום ${userName}! 🎉
              </div>
              
              <div class="message">
                ברוכים הבאים ל-Wedding Planner! אנחנו שמחים שהצטרפת אלינו לתכנון החתונה המושלמת.
              </div>
              
              <div class="features">
                <h3>מה תוכל לעשות איתנו:</h3>
                <div class="feature">📋 ניהול רשימת מוזמנים</div>
                <div class="feature">💰 מעקב תקציב</div>
                <div class="feature">🏢 השוואת ספקים</div>
                <div class="feature">📝 צ'קליסט מפורט</div>
                <div class="feature">🎯 ניהול משימות</div>
              </div>
              
              <div class="message">
                התחל לתכנן את החתונה המושלמת שלך!
              </div>
            </div>
            
            <div class="footer">
              <p>© 2024 Wedding Planner. כל הזכויות שמורות.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      throw new Error('שגיאה בשליחת אימייל הפתיחה');
    }

    console.log('Welcome email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}; 