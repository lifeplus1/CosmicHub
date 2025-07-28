import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyB4f2zH4Qb1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z1", // Replace with your Firebase config
    authDomain: "astrology-app-9c2e9.firebaseapp.com",
    projectId: "astrology-app-9c2e9",
    storageBucket: "astrology-app-9c2e9.appspot.com",
    messagingSenderId: "113047913682",
    appId: "1:113047913682:web:4b4f2zH4Qb1Z1Z1Z1Z1Z1Z"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const API_BASE_URL = "https://astrology-app-0emh.onrender.com"; // Replace with actual Render URL

async function calculateChart(birthData) {
    try {
        const response = await fetch(`${API_BASE_URL}/calculate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": "c3a579e58484f1eb21bfc96966df9a25"
            },
            body: JSON.stringify(birthData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Chart calculation failed");
        return data;
    } catch (error) {
        console.error("Error calculating chart:", error);
        throw error;
    }
}

document.getElementById("chart-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const birthData = {
        year: parseInt(e.target.year.value),
        month: parseInt(e.target.month.value),
        day: parseInt(e.target.day.value),
        hour: parseInt(e.target.hour.value),
        minute: parseInt(e.target.minute.value),
        city: e.target.city.value
    };
    try {
        const chart = await calculateChart(birthData);
        console.log("Chart data:", chart);
        // Add SVG wheel rendering logic here
    } catch (error) {
        alert("Failed to calculate chart: " + error.message);
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User logged in:", user.uid);
    } else {
        console.log("No user logged in");
    }
});