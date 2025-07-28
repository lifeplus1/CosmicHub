import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // Replace with your Firebase config
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
        console.log("Chart data:", data); // Debug
        return data;
    } catch (error) {
        console.error("Error calculating chart:", error);
        throw error;
    }
}

function renderChart(chart) {
    const output = document.getElementById("chart-output");
    if (!chart.planets || !chart.houses || !chart.angles || !chart.aspects) {
        output.innerHTML = "<p>Error: Incomplete chart data received.</p>";
        console.error("Incomplete chart data:", chart);
        return;
    }
    output.innerHTML = `
        <h3>Chart Data</h3>
        <h4>Location</h4>
        <p>Latitude: ${chart.resolved_location.latitude}</p>
        <p>Longitude: ${chart.resolved_location.longitude}</p>
        <p>Timezone: ${chart.resolved_location.timezone}</p>
        <h4>Planets</h4>
        <ul>
            ${Object.entries(chart.planets).map(([name, data]) => `
                <li>${name}: ${data.position}, ${data.sign}, House ${data.house}${data.retrograde ? ", Retrograde" : ""}</li>
            `).join('')}
        </ul>
        <h4>Houses</h4>
        <ul>
            ${chart.houses.map(h => `<li>House ${h.house}: ${h.cusp}, ${h.sign}</li>`).join('')}
        </ul>
        <h4>Angles</h4>
        <ul>
            ${Object.entries(chart.angles).map(([name, data]) => `<li>${name}: ${data.position}, ${data.sign}, House ${data.house}</li>`).join('')}
        </ul>
        <h4>Aspects</h4>
        <ul>
            ${chart.aspects.length ? chart.aspects.map(a => `<li>${a.point1} ${a.aspect} ${a.point2} (orb: ${a.orb.toFixed(2)}°)</li>`).join('') : '<li>No aspects</li>'}
        </ul>
    `;
    // Add SVG wheel rendering logic here
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
        renderChart(chart);
    } catch (error) {
        document.getElementById("chart-output").innerHTML = `<p>Error: ${error.message}</p>`;
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User logged in:", user.uid);
    } else {
        console.log("No user logged in");
    }
});