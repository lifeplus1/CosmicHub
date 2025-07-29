import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { loadStripe } from "https://js.stripe.com/v3/buy-button.js";

const firebaseConfig = {
    apiKey: "AIzaSyDEQ5i07TflWq30lwBsoJLzGNEUgSNLTOw",
    authDomain: "astrology-app-9c2e9.firebaseapp.com",
    projectId: "astrology-app-9c2e9",
    storageBucket: "astrology-app-9c2e9.firebasestorage.app",
    messagingSenderId: "341259782663",
    appId: "1:341259782663:web:132d7b85d8518c5f3bf8a2",
    measurementId: "G-M2776G401M"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const API_BASE_URL = "https://astrology-app-0emh.onrender.com";

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
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP ${response.status}`);
        }
        const data = await response.json();
        console.log("Chart data:", data);
        return data;
    } catch (error) {
        console.error("Error calculating chart:", error);
        throw new Error(`Failed to calculate chart: ${error.message}`);
    }
}

async function saveChart(chartData) {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in. Please log in to save charts.");
    try {
        const charts = await getCharts();
        if (charts.length >= 3 && !user.isPremium) {
            throw new Error("Free chart limit reached. Upgrade to premium.");
        }
        const token = await user.getIdToken();
        const response = await fetch(`${API_BASE_URL}/save-chart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(chartData)
        });
        if (!response.ok) throw new Error((await response.json()).detail || "Failed to save chart");
        console.log("Chart saved for user:", user.uid);
        await addDoc(collection(db, "users", user.uid, "charts"), chartData); // Optional Firestore save
    } catch (error) {
        console.error("Error saving chart:", error);
        throw new Error(`Failed to save chart: ${error.message}`);
    }
}

async function getCharts() {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in. Please log in to view charts.");
    try {
        const snapshot = await getDocs(collection(db, "users", user.uid, "charts"));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error retrieving charts:", error);
        throw new Error(`Failed to retrieve charts: ${error.message}`);
    }
}

function renderChart(chart) {
    const output = document.getElementById("chart-output");
    if (!chart || !chart.julian_day) {
        output.innerHTML = `<p>Error: Invalid chart data. ${chart?.error || ''}</p>`;
        return;
    }
    output.innerHTML = `
        <h3>Chart Data</h3>
        <p>Julian Day: ${chart.julian_day.toFixed(6)}</p>
        <p>Latitude: ${chart.latitude.toFixed(6)}</p>
        <p>Longitude: ${chart.longitude.toFixed(6)}</p>
        <p>Timezone: ${chart.timezone}</p>
        <h4>Planets</h4>
        <ul>${Object.entries(chart.planets || {}).map(([name, pos]) => `<li>${name}: ${pos.toFixed(2)}°</li>`).join('')}</ul>
        ${chart.houses ? `<h4>Houses</h4><ul>${chart.houses.map(h => `<li>House ${h.house}: ${h.cusp.toFixed(2)}°</li>`).join('')}</ul>` : ''}
        ${chart.angles ? `<h4>Angles</h4><ul>${Object.entries(chart.angles).map(([name, pos]) => `<li>${name}: ${pos.toFixed(2)}°</li>`).join('')}</ul>` : ''}
        ${chart.aspects ? `<h4>Aspects</h4><ul>${chart.aspects.map(a => `<li>${a.point1} ${a.aspect} ${a.point2} (orb: ${a.orb.toFixed(2)}°)</li>`).join('')}</ul>` : ''}
    `;
}

document.getElementById("chart-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const output = document.getElementById("chart-output");
    output.innerHTML = "<p>Calculating...</p>";
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
        if (auth.currentUser) {
            await saveChart(chart);
            output.innerHTML += `<p>Chart saved!</p>`;
        }
        renderChart(chart);
    } catch (error) {
        output.innerHTML = `<p>Error: ${error.message}</p>`;
    }
});

document.getElementById("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const output = document.getElementById("chart-output");
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        output.innerHTML = `<p>Login successful!</p>`;
    } catch (error) {
        output.innerHTML = `<p>Login error: ${error.message}</p>`;
    }
});

document.getElementById("view-charts")?.addEventListener("click", async () => {
    const output = document.getElementById("chart-output");
    output.innerHTML = "<p>Loading charts...</p>";
    try {
        const charts = await getCharts();
        output.innerHTML = `<h3>Saved Charts</h3><ul>${charts.map(c => `<li>Chart ${c.id}: JD ${c.julian_day.toFixed(6)}</li>`).join('')}</ul>`;
    } catch (error) {
        output.innerHTML = `<p>Error: ${error.message}</p>`;
    }
});

document.getElementById("subscribe")?.addEventListener("click", async () => {
    const output = document.getElementById("chart-output");
    output.innerHTML = "<p>Redirecting to subscription...</p>";
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Please log in to subscribe.");
        const token = await user.getIdToken();
        const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        const session = await response.json();
        if (!response.ok) throw new Error(session.detail || "Failed to create checkout session");
        const stripe = await loadStripe("pk_test_51Rq7i8ECbCGPGjQmaIOVV20NdgVCBeqoaM6jJdsgQnGofLycSPknCTf6NrO8xaogCjS1O30cHx1OCvRWXIMTyJDP0093jgFNj3"); // Replace with your Stripe public key
        await stripe.redirectToCheckout({ sessionId: session.id });
    } catch (error) {
        output.innerHTML = `<p>Error: ${error.message}</p>`;
    }
});

onAuthStateChanged(auth, (user) => {
    const output = document.getElementById("chart-output");
    if (user) {
        output.innerHTML = `<p>Logged in as ${user.email}</p>`;
    } else {
        output.innerHTML = `<p>Not logged in. Please log in to save or view charts.</p>`;
    }
});