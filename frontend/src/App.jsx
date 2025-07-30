// In frontend/src/App.jsx
import { useState } from 'react';

function App() {
  const [chart, setChart] = useState(null);
  const [error, setError] = useState(null);
  const [houseSystem, setHouseSystem] = useState('P');

  const fetchChart = async () => {
    try {
      const response = await fetch(`https://astrology-app-0emh.onrender.com/calculate?house_system=${houseSystem}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'c3a579e58484f1eb21bfc96966df9a25'
        },
        body: JSON.stringify({
          year: 1990,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
          city: 'New York',
          timezone: 'America/New_York'
        })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setChart(data);
      setError(null);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Astrology App</h1>
      <select value={houseSystem} onChange={(e) => setHouseSystem(e.target.value)}>
        <option value="P">Placidus</option>
        <option value="E">Equal House</option>
      </select>
      <button onClick={fetchChart}>Calculate Chart</button>
      {error && <p>Error: {error}</p>}
      {chart && <pre>{JSON.stringify(chart, null, 2)}</pre>}
    </div>
  );
}

export default App;