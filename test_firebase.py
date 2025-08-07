# test_firebase.py
import firebase_admin
from firebase_admin import credentials, firestore

try:
    cred = credentials.Certificate('firebase_credentials.json')
    firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    
    # Test read
    docs = db.collection('bloodStock').get()
    print(f"✅ Python Firebase connected! Found {len(docs)} blood types")
    
except Exception as e:
    print(f"❌ Python connection failed: {e}")