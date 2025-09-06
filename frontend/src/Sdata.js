import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';
import './Sdata.css';

// Constants
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api/";

const clients = [
  {
    id: 1,
    name: 'Ali',
    homes: [
      { siteId: 1, siteType: 'House', address: '123 Main St', zones: { normal: ["Living Room", "Kitchen"], alert: ["Front Door"] } },
      { siteId: 2, siteType: 'Storage', address: '456 Elm St', zones: { normal: ["Storage Room", "Office"], alert: ["Back Door"] } },
    ],
  },
  {
    id: 2,
    name: 'Ahmed',
    homes: [
      { siteId: 3, siteType: 'Shop1', address: '789 Oak St', zones: { normal: ["Main Hall"], alert: ["Shop Entrance"] } },
      { siteId: 4, siteType: 'Shop2', address: '101 Pine St', zones: { normal: ["Cash Counter"], alert: ["Emergency Exit"] } },
    ],
  },
  {
    id: 3,
    name: 'Sara',
    homes: [
      { siteId: 5, siteType: 'Factory', address: '789 Oak St', zones: { normal: ["Gate"], alert: ["Office"] } },
    ],
  },
];

const Sdata = () => {
  const { siteId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const address = searchParams.get('address') || 'Unknown Address';

  const [sensorData, setSensorData] = useState({
    pir: { data: [], siteAddress: address, sensorType: 'pir' },
    vibration: { data: [], siteAddress: address, sensorType: 'vibration' },
    temperature: { data: [], siteAddress: address, sensorType: 'temperature' },
    humidity: { data: [], siteAddress: address, sensorType: 'humidity' },
  });

  // Find the client and home based on siteId
  const getSiteInfo = (siteId) => {
    for (const client of clients) {
      const home = client.homes.find(h => h.siteId === parseInt(siteId));
      if (home) {
        return { clientName: client.name, home };
      }
    }
    return { clientName: 'Unknown', home: null };
  };

  const { clientName, home } = getSiteInfo(siteId);

  // Fetch sensor data from backend
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await fetch(`${API_URL}sensor-status/?client_id=${siteId || '1'}`, {
          headers: {
            "Authorization": `Token ${localStorage.getItem('token') || ''}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const currentTime = new Date().toLocaleTimeString();

        setSensorData(prev => {
          const newData = { ...prev };

          // PIR sensor
          newData.pir.data = [
            {
              time: currentTime,
              pir: data.data?.pir?.value ?? 0,
            },
            ...prev.pir.data.slice(0, 19), // Keep last 20 entries
          ];

          // Vibration sensor
          newData.vibration.data = [
            {
              time: currentTime,
              vibration: data.data?.vibration?.value ?? 0,
            },
            ...prev.vibration.data.slice(0, 19),
          ];

          // Temperature (from DHT)
          newData.temperature.data = [
            {
              time: currentTime,
              temperature: data.data?.dht?.temperature ?? 0,
            },
            ...prev.temperature.data.slice(0, 19),
          ];

          // Humidity (from DHT)
          newData.humidity.data = [
            {
              time: currentTime,
              humidity: data.data?.dht?.humidity ?? 0,
            },
            ...prev.humidity.data.slice(0, 19),
          ];

          return newData;
        });
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    };

    fetchSensorData();
    const interval = setInterval(fetchSensorData, 5000);
    return () => clearInterval(interval);
  }, [siteId, address]);

  if (!home) {
    return (
      <div className="sdata-container">
        <h1>Site Data</h1>
        <p>Site with ID {siteId} not found.</p>
      </div>
    );
  }

  return (
    <div className="sdata-container">
      <h1>Site Data</h1>
      <div className="site-info">
        <p>Client Name: {clientName}</p>
        <p>Site Type: {home.siteType}</p>
        <p>Address: {home.address}</p>
        <p>Site ID: {siteId}</p>
      </div>

      <div className="chart-container">
        <h2>Temperature Data</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sensorData.temperature.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={[0, 50]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temperature" stroke="#ff7300" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h2>Humidity Data</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sensorData.humidity.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="humidity" stroke="#82ca9d" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h2>Vibration Data</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sensorData.vibration.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis tickCount={2} domain={[0, 1.5]} />
            <Tooltip formatter={(value) => (value === 1 ? 'Vibration Detected' : 'No Vibration')} />
            <Legend />
            <Line
              type="step"
              dataKey="vibration"
              stroke="#e55353"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h2>PIR Sensor Data</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sensorData.pir.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis tickCount={2} domain={[0, 1.5]} />
            <Tooltip formatter={(value) => (value === 1 ? 'Motion Detected' : 'No Motion')} />
            <Legend />
            <Line
              type="step"
              dataKey="pir"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Sdata;