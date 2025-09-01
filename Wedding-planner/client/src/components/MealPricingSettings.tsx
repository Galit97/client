import { useState } from 'react';
import { Success_24, X_24, Edit_24 } from './Icons/WeddingIconsLibrary';

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
    <div className="card" style={{ marginBottom: '30px' }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#e65100' }}>
        מחירי מנות - חישוב עלויות האירוע
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
            className='button'
          >
            {isEditing ? <><X_24 style={{ width: '16px', height: '16px', marginLeft: '8px' }} /> ביטול עריכה</> : <><Edit_24 style={{ width: '16px', height: '16px', marginLeft: '8px' }} /> ערוך הגדרות</>}
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
              <Success_24 style={{ width: '16px', height: '16px', marginLeft: '8px' }} /> שומר שינויים אוטומטית...
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
              className="save-btn"
            >
              {saving ? 'שומר...' : <><Success_24 style={{ width: '16px', height: '16px', marginLeft: '8px' }} /> שמור</>}
            </button>
          )}
        </div>
        
        {!isEditing && (
          <div className='button'>
            <div style={{ fontSize: '14px', color: '#2e7d32', fontWeight: 'bold' }}>
              השדות נעולים לעריכה
            </div>
            <div style={{ fontSize: '12px', color: '#2e7d32', marginTop: '5px' }}>
              לחץ על "ערוך הגדרות" כדי לאפשר עריכה
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
                border: '1px solid #E5E7EB', 
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
                border: '1px solid #E5E7EB', 
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