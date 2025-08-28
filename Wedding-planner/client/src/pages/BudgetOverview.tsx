// src/pages/BudgetOverview.tsx
// עמוד התקציב: תמצית יעד, סיכום התחייבויות, כפתור עריכה, ומצבי ריק.

import React, { useState, useEffect } from 'react';

// מאסטר התקציב:
import {
  calcBudget,
  committedOnly,
  formatILS,
  formatNumber,
} from '../lib/budgetTypes';
import type {
  BudgetSettings,
  Supplier,
} from '../lib/budgetTypes';

// אייקון "טבעת ₪" קטן
const BudgetRingShekel: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="9.2" />
    <path d="M8.5 8.2v5.6c0 1.3 1 2.3 2.3 2.3h2.7" />
    <path d="M15.5 15.8V10.2c0-1.3-1-2.3-2.3-2.3H10.5" />
    <g opacity=".5"><path d="M16.5 6.8l1.8-1.8" /><path d="M18.3 6.8l-1.8-1.8" /></g>
  </svg>
);

export default function BudgetOverview() {
  const [budget, setBudget] = useState<BudgetSettings | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // Fetch wedding data for budget settings
        const weddingRes = await fetch("/api/weddings/owner", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (weddingRes.ok) {
          const wedding = await weddingRes.json();
          // Convert existing budget data to new format
          if (wedding.budget) {
            const budgetSettings: BudgetSettings = {
              guestsMin: wedding.guestsMin || 50,
              guestsMax: wedding.guestsMax || 150,
              guestsExact: wedding.guestsExact,
              giftAvg: wedding.giftAvg || 500,
              savePercent: wedding.savePercent || 10,
              mode: wedding.budgetMode || 'ניצמד'
            };
            setBudget(budgetSettings);
          }
        }

        // Fetch vendors and convert to suppliers format
        const vendorsRes = await fetch("/api/vendors", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (vendorsRes.ok) {
          const vendors = await vendorsRes.json();
          const suppliersData: Supplier[] = vendors.map((vendor: any) => ({
            id: vendor._id,
            name: vendor.vendorName,
            category: vendor.type,
            status: vendor.status === 'confirmed' ? 'התחייב' : 
                   vendor.status === 'pending' ? 'הצעה' : 'פתוח',
            finalAmount: vendor.price || 0,
            deposit: vendor.deposit || 0
          }));
          setSuppliers(suppliersData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleEditBudget = () => {
    // Navigate to budget setup - you can replace this with your routing logic
    window.location.href = '/budget';
  };

  const handleGoToSuppliers = () => {
    // Navigate to suppliers - you can replace this with your routing logic
    window.location.href = '/vendors';
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>טוען נתוני תקציב...</div>
      </div>
    );
  }

  // ראש עמוד: כותרת + כפתור עריכה
  const Header = (
    <header style={{ 
      padding: '20px', 
      background: '#f8fafc', 
      borderRadius: '8px', 
      marginBottom: '20px' 
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#1d5a78' 
          }}>
            תקציב
          </h1>
          <p style={{ 
            margin: '8px 0 0 0', 
            color: '#6b7280', 
            fontSize: '14px' 
          }}>
            רק ספקים בסטטוס 'התחייב' נכנסים לחישוב.
          </p>
        </div>
        <button
          onClick={handleEditBudget}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: '2px solid #1d5a78',
            borderRadius: '6px',
            color: '#1d5a78',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1d5a78';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#1d5a78';
          }}
        >
          עריכת התקציב
        </button>
      </div>
    </header>
  );

  // מצב ללא הגדרות תקציב כלל
  if (!budget) {
    return (
      <div style={{ padding: '20px' }}>
        {Header}
        <section style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '20px' }}>
            עדיין אין הגדרות תקציב.
          </p>
          <button 
            onClick={handleEditBudget}
            style={{
              padding: '12px 24px',
              background: '#1d5a78',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#164e63';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1d5a78';
            }}
          >
            התחלה מהירה
          </button>
        </section>
      </div>
    );
  }

  // חישוב תמצית התקציב (יעדים) ונתוני התחייבויות
  const summary = calcBudget(budget, suppliers);
  const committed = committedOnly(suppliers);

  return (
    <div style={{ padding: '20px' }}>
      {Header}

      {/* תמצית יעד */}
      <section style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '20px' 
        }}>
          <BudgetRingShekel style={{ color: '#1d5a78' }} />
          <strong style={{ fontSize: '18px', color: '#1d5a78' }}>
           סיכום תקציב
          </strong>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            background: '#f8fafc', 
            padding: '20px', 
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>
              יעד מינימום
            </div>
            <div style={{ fontWeight: '600', fontSize: '18px', color: '#1d5a78' }}>
              {formatILS(summary.targetMin)}
            </div>
          </div>
          <div style={{ 
            background: '#e0f2fe', 
            padding: '20px', 
            borderRadius: '6px',
            textAlign: 'center',
            border: '2px solid #1d5a78'
          }}>
            <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>
              יעד סביר
            </div>
            <div style={{ fontWeight: '700', fontSize: '20px', color: '#1d5a78' }}>
              {formatILS(summary.targetLikely)}
            </div>
          </div>
          <div style={{ 
            background: '#f8fafc', 
            padding: '20px', 
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>
              יעד מקסימום
            </div>
            <div style={{ fontWeight: '600', fontSize: '18px', color: '#1d5a78' }}>
              {formatILS(summary.targetMax)}
            </div>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          gap: '20px',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          <span>אורחים לחישוב: {formatNumber(summary.guests)}</span>
          <span>•</span>
          <span>סה״כ מתנות צפוי: {formatILS(summary.giftTotalLikely)}</span>
        </div>
      </section>

      {/* התחייבויות בפועל */}
      <section style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <strong style={{ fontSize: '18px', color: '#1d5a78', display: 'block', marginBottom: '20px' }}>
          התחייבויות בפועל
        </strong>

        {committed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ color: '#6b7280', fontSize: '16px', marginBottom: '10px' }}>
              עדיין אין התחייבויות בתקציב.
            </div>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 20px 0' }}>
              רק ספקים בסטטוס 'התחייב' יכנסו לחישוב.
            </p>
            <button 
              onClick={handleGoToSuppliers}
              style={{
                padding: '10px 20px',
                background: '#6b7280',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#4b5563';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#6b7280';
              }}
            >
              הוספת ספק ראשון
            </button>
          </div>
        ) : (
          <>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{ 
                background: '#f8fafc', 
                padding: '20px', 
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>
                  סה״כ התחייבויות
                </div>
                <div style={{ fontWeight: '600', fontSize: '18px', color: '#1d5a78' }}>
                  {formatILS(summary.committedTotal)}
                </div>
              </div>
              <div style={{ 
                background: '#f8fafc', 
                padding: '20px', 
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>
                  שולם (מקדמות)
                </div>
                <div style={{ fontWeight: '600', fontSize: '18px', color: '#059669' }}>
                  {formatILS(summary.committedPaid)}
                </div>
              </div>
              <div style={{ 
                background: '#f8fafc', 
                padding: '20px', 
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>
                  יתרה לתשלום
                </div>
                <div style={{ fontWeight: '600', fontSize: '18px', color: '#dc2626' }}>
                  {formatILS(summary.committedRemaining)}
                </div>
              </div>
            </div>

            {/* אינדיקטור פער מול יעד סביר */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '10px', 
              color: '#6b7280',
              fontSize: '14px',
              padding: '15px',
              background: '#f9fafb',
              borderRadius: '6px'
            }}>
              <span>סטטוס מול יעד:</span>
              <strong style={{
                color:
                  summary.status === 'מעל היעד'
                    ? '#dc2626'
                    : summary.status === 'מתחת ליעד'
                    ? '#059669'
                    : '#1d5a78',
              }}>
                {summary.status}
              </strong>
              <span>•</span>
              <span>
                פער מול יעד סביר:{' '}
                {summary.varianceToLikely >= 0
                  ? `+${formatILS(summary.varianceToLikely)}`
                  : formatILS(summary.varianceToLikely)}
              </span>
            </div>
          </>
        )}
      </section>

      {/* ניווטים נפוצים */}
      <footer style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: '15px' 
      }}>
        <button 
          onClick={handleGoToSuppliers}
          style={{
            padding: '10px 20px',
            background: '#6b7280',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#4b5563';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#6b7280';
          }}
        >
          לספקים
        </button>
        <button 
          onClick={handleEditBudget}
          style={{
            padding: '10px 20px',
            background: '#1d5a78',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#164e63';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#1d5a78';
          }}
        >
          עריכת התקציב
        </button>
      </footer>
    </div>
  );
}