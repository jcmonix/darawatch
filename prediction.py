# prediction.py - Simple SARIMA prediction
import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
import numpy as np
from statsmodels.tsa.statespace.sarimax import SARIMAX
import json
from datetime import datetime, timedelta
import sys

def save_to_firebase(predictions):
    """Save predictions to Firebase"""
    try:
        # Initialize Firebase Admin (only once)
        if not firebase_admin._apps:
            cred = credentials.Certificate('firebase_credentials.json')
            firebase_admin.initialize_app(cred)
        
        db = firestore.client()
        
        # Save predictions
        doc_ref = db.collection('predictions').document('monthly_forecast')
        doc_ref.set({
            'predictions': predictions,
            'generated_at': datetime.now(),
            'year': datetime.now().year
        })
        
        print("✅ Predictions saved to Firebase!")
        
    except Exception as e:
        print(f"❌ Firebase save failed: {e}")
        # Fallback: save to local JSON
        with open('predictions.json', 'w') as f:
            json.dump(predictions, f)

def generate_predictions():
    """Generate SARIMA predictions for current year"""
    
    # Generate 5 years of realistic dummy data (replace with your Red Cross data)
    blood_types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    predictions = {}
    
    for blood_type in blood_types:
        try:
            # Create 60 months of historical data
            dates = pd.date_range(start='2019-01-01', periods=60, freq='M')
            
            # Base supply for each blood type
            base = {'A+': 120, 'B+': 100, 'AB+': 80, 'O+': 150, 
                   'A-': 40, 'B-': 30, 'AB-': 20, 'O-': 60}[blood_type]
            
            # Generate historical data with trends and seasonality
            historical = []
            for i, date in enumerate(dates):
                seasonal = 1 + 0.15 * np.sin(2 * np.pi * date.month / 12)
                trend = 1 + (i * 0.005)
                noise = np.random.normal(1, 0.1)
                value = base * seasonal * trend * noise
                historical.append(max(10, value))
            
            # Split: 48 months train, 12 months test
            train_data = pd.Series(historical[:48])
            test_data = pd.Series(historical[48:])
            
            # Fit SARIMA model
            model = SARIMAX(train_data, order=(1,1,1), seasonal_order=(1,1,1,12))
            fitted_model = model.fit(disp=False)
            
            # Generate 12-month predictions for current year
            forecast = fitted_model.get_forecast(steps=12)
            monthly_predictions = [max(10, pred) for pred in forecast.predicted_mean]
            
            predictions[blood_type] = {
                'predictions': monthly_predictions,
                'blood_type': blood_type
            }
            
        except Exception as e:
            print(f"Error predicting {blood_type}: {e}")
    
    # Save predictions (Firebase integration happens here)
    result = {
        'predictions': predictions,
        'generated_at': datetime.now().isoformat(),
        'year': datetime.now().year
    }
    
    # Save to JSON file (your website reads this)
    with open('predictions.json', 'w') as f:
        json.dump(result, f)
    
    print("Predictions generated successfully!")
    save_to_firebase(result)
    return result

if __name__ == "__main__":
    generate_predictions()