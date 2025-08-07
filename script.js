// script.js - Enhanced with auto-prediction
import { db } from './firebase-config.js';
import { collection, onSnapshot, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

class BloodBankDashboard {
    constructor() {
        this.chart = null;
        this.init();
    }

    async init() {
        // 1. Load your existing dummy data first (instant display)
        this.loadExistingData();
        
        // 2. Run prediction automatically
        await this.runPrediction();
        
        // 3. Set up real-time Firebase updates
        this.setupFirebaseListeners();
    }

    loadExistingData() {
        // Your existing code - blood cards, table, dummy chart
        const bloodStock = [
            { type: 'A+', units: 15}, { type: 'B+', units: 10},
            { type: 'AB+', units: 15}, { type: 'O+', units: 25},
            { type: 'A-', units: 3}, { type: 'B-', units: 2},
            { type: 'AB-', units: 2}, { type: 'O-', units: 4}
        ];

        // Render blood cards (your existing code)
        this.renderBloodCards(bloodStock);
        
        // Load dummy table (your existing code)  
        this.loadDummyTable();
        
        // Create initial chart
        this.createChart([120, 135, 150, 145, 160, 155, 170, 165, 180, 175, 190, 185]);
    }

    async runPrediction() {
        console.log('Running SARIMA prediction...');
        
        try {
            // Call Python prediction script
            const response = await fetch('/run-prediction', { method: 'POST' });
            const result = await response.json();
            
            if (result.success) {
                console.log('Prediction completed!');
                // Chart will auto-update via Firebase listener
            }
        } catch (error) {
            console.log('Using dummy predictions - Python script not available');
        }
    }

    setupFirebaseListeners() {
        try {
            // Listen for prediction updates
            const predictionDoc = doc(db, 'predictions', 'monthly_forecast');
            onSnapshot(predictionDoc, (doc) => {
                if (doc.exists()) {
                    this.updateChartWithPredictions(doc.data());
                }
            });

            // Listen for blood stock updates (your hardware)
            onSnapshot(collection(db, 'bloodStock'), (snapshot) => {
                const stockData = [];
                snapshot.forEach(doc => stockData.push(doc.data()));
                this.renderBloodCards(stockData);
            });
            
        } catch (error) {
            console.log('Firebase offline - using local data only');
        }
    }

    createChart(data) {
        const ctx = document.getElementById('bloodPredictionChart').getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Predicted Blood Supply',
                    data: data,
                    backgroundColor: '#d10000',
                    borderColor: '#d10000',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                // Your existing chart options
            }
        });
    }

    updateChartWithPredictions(predictionData) {
        if (!this.chart) return;
        
        // Convert SARIMA predictions to monthly totals
        const monthlyTotals = new Array(12).fill(0);
        
        Object.values(predictionData.predictions || {}).forEach(prediction => {
            if (prediction.predictions) {
                prediction.predictions.forEach((value, index) => {
                    if (index < 12) monthlyTotals[index] += Math.round(Math.max(0, value));
                });
            }
        });

        // Update chart
        this.chart.data.datasets[0].data = monthlyTotals;
        this.chart.data.datasets[0].label = 'SARIMA Predicted Supply (' + new Date().getFullYear() + ')';
        this.chart.update();
    }

    renderBloodCards(stockData) {
        // Your existing blood card rendering code
        const container = document.getElementById('bloodTypes');
        container.innerHTML = '';
        
        stockData.forEach(blood => {
            const bloodCard = document.createElement('div');
            bloodCard.className = 'blood-card';
            bloodCard.innerHTML = `
                <div class="blood-type">${blood.type}</div>
                <div class="blood-units">${blood.units} units</div>
            `;
            container.appendChild(bloodCard);
        });
    }

    loadDummyTable() {
        // Your existing table code
        const bloodIssuance = [
            { time: '10:30 AM', type: 'A+', units: 7, events:'Issuance'},
            { time: '09:15 AM', type: 'O+', units: 24, events:'Supply'},
            // ... rest of your dummy data
        ];
        
        const tableBody = document.querySelector('#issuanceTable tbody');
        tableBody.innerHTML = '';
        
        bloodIssuance.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.time}</td>
                <td>${entry.type}</td>
                <td>${entry.units}</td>
                <td>${entry.events}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Start everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Your existing header click functionality
    document.querySelector('.clickable-header').onclick = () => window.location.reload();
    
    // Start dashboard
    new BloodBankDashboard();
});