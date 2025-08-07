import { db } from './firebase-config.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

async function testConnection() {
    try {
        const bloodStock = await getDocs(collection(db, 'bloodStock'));
        console.log('✅ Firebase connected!');
        console.log('Blood stock records:', bloodStock.size);
    } catch (error) {
        console.log('❌ Firebase connection failed:', error);
    }
}

testConnection();