import React, { useState } from 'react';

type MealPricing = {
  basePrice: number;
  childDiscount: number;
  childAgeLimit: number;
  bulkThreshold: number;
  bulkPrice: number;
  bulkMaxGuests: number;
  reservePrice: number;
  reserveThreshold: number;
  reserveMaxGuests: number;
};

interface MealPricingSettingsProps {
  mealPricing: MealPricing;
  onMealPricingChange: (field: keyof MealPricing, value: number) => void;
  onSave?: () => void;
  saving?: boolean;
  autoSaving?: boolean;
}

export default function MealPricingSettings({
  mealPricing,
  onMealPricingChange,
  onSave,
  saving = false,
  autoSaving = false
}: MealPricingSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div style={{
      background: '#f2ebe2',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '30px',
     
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#e65100' }}>
        🍽️ מחירי מנות - חישוב עלויות האירוע
      </h3>
      
      <div style={{ 
        background: '#fff', 
        padding: '15px', 
        borderRadius: '4px', 
        marginBottom: '20px',
       
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h4 style={{ margin: '0', color: '#333' }}>הגדרות מחירים</h4>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            style={{
              padding: '8px 16px',
              backgroundColor: isEditing ? '#f44336' : '#4CAF50',
              color: 'white',
           
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {isEditing ? '❌ ביטול עריכה' : '✏️ ערוך הגדרות'}
          </button>
        </div>
        
        {/* Auto-saving indicator */}
        {autoSaving && (
          <div style={{ 
            marginBottom: '15px', 
            padding: '8px 12px', 
            background: '#e3f2fd', 
            borderRadius: '4px', 
         
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
            
              borderTop: '2px solid transparent',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{ color: '#1976d2', fontSize: '14px', fontWeight: 'bold' }}>
              💾 שומר שינויים אוטומטית...
            </span>
          </div>
        )}
        
        <div style={{ 
          marginBottom: '15px', 
          padding: '8px 12px', 
          background: '#f2ebe2', 
          borderRadius: '4px', 
      
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
        
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              style={{
                padding: '6px 12px',
                backgroundColor: saving ? '#ccc' : '#ff9800',
                color: 'white',
              
                borderRadius: '4px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              {saving ? 'שומר...' : '💾 שמור'}
            </button>
          )}
        </div>
        
        {!isEditing && (
          <div style={{ 
            marginBottom: '15px', 
            padding: '10px 15px', 
            background: '#e8f5e8', 
            borderRadius: '4px', 
          
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '14px', color: '#2e7d32', fontWeight: 'bold' }}>
              🔒 השדות נעולים לעריכה
            </div>
            <div style={{ fontSize: '12px', color: '#2e7d32', marginTop: '5px' }}>
              לחץ על "✏️ ערוך הגדרות" כדי לאפשר עריכה
            </div>
          </div>
        )}
        
        <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              מחיר מנה (₪)
            </label>
            <input
              type="number"
              min="0"
              value={mealPricing?.basePrice || 0}
              onChange={(e) => onMealPricingChange('basePrice', Number(e.target.value))}
              disabled={!isEditing}
              style={{ 
                width: '100%', 
                padding: '8px', 
               
                borderRadius: '4px',
                backgroundColor: isEditing ? 'white' : '#f5f5f5',
                cursor: isEditing ? 'text' : 'not-allowed'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              מספר התחייבות למחיר מנה
            </label>
            <input
              type="number"
              min="0"
              value={mealPricing?.bulkThreshold || 0}
              onChange={(e) => onMealPricingChange('bulkThreshold', Number(e.target.value))}
              disabled={!isEditing}
              style={{ 
                width: '100%', 
                padding: '8px', 
            
                borderRadius: '4px',
                backgroundColor: isEditing ? 'white' : '#f5f5f5',
                cursor: isEditing ? 'text' : 'not-allowed'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              מחיר מנה מעל להתחייבות (₪)
            </label>
            <input
              type="number"
              min="0"
              value={mealPricing?.bulkPrice || 0}
              onChange={(e) => onMealPricingChange('bulkPrice', Number(e.target.value))}
              disabled={!isEditing}
              style={{ 
                width: '100%', 
                padding: '8px', 
            
                borderRadius: '4px',
                backgroundColor: isEditing ? 'white' : '#f5f5f5',
                cursor: isEditing ? 'text' : 'not-allowed'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              עד איזה מספר מתאפשרת ההנחה
            </label>
            <input
              type="number"
              min="0"
              value={mealPricing?.bulkMaxGuests || 0}
              onChange={(e) => onMealPricingChange('bulkMaxGuests', Number(e.target.value))}
              disabled={!isEditing}
              style={{ 
                width: '100%', 
                padding: '8px', 
          
                borderRadius: '4px',
                backgroundColor: isEditing ? 'white' : '#f5f5f5',
                cursor: isEditing ? 'text' : 'not-allowed'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              מחיר מנה ברזרבה (₪)
            </label>
            <input
              type="number"
              min="0"
              value={mealPricing?.reservePrice || 0}
              onChange={(e) => onMealPricingChange('reservePrice', Number(e.target.value))}
              disabled={!isEditing}
              style={{ 
                width: '100%', 
                padding: '8px', 
              
                borderRadius: '4px',
                backgroundColor: isEditing ? 'white' : '#f5f5f5',
                cursor: isEditing ? 'text' : 'not-allowed'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              סף כמות רזרבה
            </label>
            <input
              type="number"
              min="0"
              value={mealPricing?.reserveThreshold || 0}
              onChange={(e) => onMealPricingChange('reserveThreshold', Number(e.target.value))}
              disabled={!isEditing}
              style={{ 
                width: '100%', 
                padding: '8px', 
          
                borderRadius: '4px',
                backgroundColor: isEditing ? 'white' : '#f5f5f5',
                cursor: isEditing ? 'text' : 'not-allowed'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              עד איזה מספר מתאפשרת הרזרבה
            </label>
            <input
              type="number"
              min="0"
              value={mealPricing?.reserveMaxGuests || 0}
              onChange={(e) => onMealPricingChange('reserveMaxGuests', Number(e.target.value))}
              disabled={!isEditing}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                backgroundColor: isEditing ? 'white' : '#f5f5f5',
                cursor: isEditing ? 'text' : 'not-allowed'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              הנחה לילדים (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={mealPricing?.childDiscount || 0}
              onChange={(e) => onMealPricingChange('childDiscount', Number(e.target.value))}
              disabled={!isEditing}
              style={{ 
                width: '100%', 
                padding: '8px', 
              
                borderRadius: '4px',
                backgroundColor: isEditing ? 'white' : '#f5f5f5',
                cursor: isEditing ? 'text' : 'not-allowed'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              גיל מקסימלי לילד
            </label>
            <input
              type="number"
              min="0"
              value={mealPricing?.childAgeLimit || 0}
              onChange={(e) => onMealPricingChange('childAgeLimit', Number(e.target.value))}
              disabled={!isEditing}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                backgroundColor: isEditing ? 'white' : '#f5f5f5',
                cursor: isEditing ? 'text' : 'not-allowed'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 