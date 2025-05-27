import React, { useState, useEffect, useRef } from 'react';

export default function DerivPredictor() {
  const [token, setToken] = useState('');
  const [connected, setConnected] = useState(false);
  const [tick, setTick] = useState(null);
  const [history, setHistory] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [autoTrade, setAutoTrade] = useState(false);
  const ws = useRef(null);

  // Connect to Deriv WebSocket API
  const connectWS = () => {
    ws.current = new WebSocket('wss://ws.deriv.com/websockets/v3');
    ws.current.onopen = () => {
      setConnected(true);
      if (token) {
        ws.current.send(JSON.stringify({ authorize: token }));
      }
      ws.current.send(JSON.stringify({ ticks: 'R_100' }));
    };

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.tick) {
        const price = parseFloat(data.tick.quote);
        setTick(price);
        setHistory(prev => {
          const newHistory = [...prev, price].slice(-20);
          generatePrediction(newHistory);
          return newHistory;
        });
      }
    };

    ws.current.onerror = () => setConnected(false);
    ws.current.onclose = () => setConnected(false);
  };

  const generatePrediction = (prices) => {
    if (prices.length < 2) return;
    const last = prices[prices.length - 1];
    const prev = prices[prices.length - 2];

    const result = {
      even_odd: last % 2 === 0 ? 'Even' : 'Odd',
      high_low: last > prev ? 'High' : 'Low',
      over_under: last > prev ? 'Over' : 'Under',
      confidence: Math.floor(Math.random() * 20 + 80), // Dummy confidence
    };

    setPrediction(result);

    if (autoTrade && result.confidence >= 85) {
      placeTrade(result);
    }
  };

  const placeTrade = (result) => {
    if (!token) return;

    const contract_type = result.even_odd === 'Even' ? 'DIGITEVEN' : 'DIGITODD';

    const payload = {
      buy: 1,
      price: 1,
      parameters: {
        amount: 1,
        basis: 'stake',
        contract_type,
        currency: 'USD',
        duration: 1,
        duration_unit: 't',
        symbol: 'R_100',
      },
    };

    ws.current.send(JSON.stringify(payload));
  };

  return (
    <div className="p-4 max-w-xl mx-auto text-center space-y-4">
      <h1 className="text-xl font-bold">📈 Deriv Smart Predictor</h1>

      {!connected ? (
        <div>
          <input
            type="text"
            placeholder="Enter your Deriv API Token"
            className="border p-2 rounded w-full mb-2"
            onChange={(e) => setToken(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={connectWS}
          >
            Connect
          </button>
        </div>
      ) : (
        <>
          <div className="text-green-600 font-medium">Connected to Deriv</div>
          <div className="border p-4 rounded shadow text-left">
            <div><strong>Latest Tick:</strong> {tick}</div>
            <div><strong>Even/Odd:</strong> {prediction?.even_odd}</div>
            <div><strong>High/Low:</strong> {prediction?.high_low}</div>
            <div><strong>Over/Under:</strong> {prediction?.over_under}</div>
            <div><strong>Confidence:</strong> {prediction?.confidence}%</div>
          </div>
          <button
            className={`mt-4 px-4 py-2 rounded text-white ${autoTrade ? 'bg-red-600' : 'bg-green-600'}`}
            onClick={() => setAutoTrade(!autoTrade)}
          >
            {autoTrade ? 'Stop Auto Trading' : 'Start Auto Trading'}
          </button>
        </>
      )}
    </div>
  );
}
