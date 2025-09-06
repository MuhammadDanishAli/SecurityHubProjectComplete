import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import './SecuritySystem.css';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

// Constants
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api/";

const clients = [
  { id: 1, name: 'Ali', homes: [{ siteId: 1, siteType: 'House', address: '123 Main St', zones: { normal: ["Living Room", "Kitchen"], alert: ["Front Door"] } }, { siteId: 2, siteType: 'Storage', address: '456 Elm St', zones: { normal: ["Storage Room", "Office"], alert: ["Back Door"] } }] },
  { id: 2, name: 'Ahmed', homes: [{ siteId: 3, siteType: 'Shop1', address: '789 Oak St', zones: { normal: ["Main Hall"], alert: ["Shop Entrance"] } }, { siteId: 4, siteType: 'Shop2', address: '101 Pine St', zones: { normal: ["Cash Counter"], alert: ["Emergency Exit"] } }] },
  { id: 3, name: 'Sara', homes: [{ siteId: 5, siteType: 'Factory', address: '789 Oak St', zones: { normal: ["Gate"], alert: ["Office"] } }] },
];

const SecuritySystem = () => {
  const { clientId: siteId } = useParams();
  const [mode, setMode] = useState("Disarm");
  const [sensors, setSensors] = useState({
    pir: { enabled: false, connected: true, value: 0, history: [], pulse: 0, responseTime: 0, uptime: 0 },
    vibration: { enabled: false, connected: true, value: 0, history: [], pulse: 0, responseTime: 0, uptime: 0 },
    dht: { enabled: false, connected: true, temperature: 0, humidity: 0, history: [], pulse: 0, responseTime: 0, uptime: 0 },
  });
  const [notifications, setNotifications] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });
  const [isUserTabVisible, setIsUserTabVisible] = useState(false);

  const chartRefs = useMemo(() => ({
    pir: React.createRef(),
    vibration: React.createRef(),
    dhtTemp: React.createRef(),
    dhtHumidity: React.createRef(),
  }), []);

  const chartInstances = useRef({});

  const home = clients
    .flatMap(client => client.homes.map(home => ({ ...home, clientId: client.id, clientName: client.name })))
    .find(home => home.siteId === parseInt(siteId));

  // Fetch users from the backend
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}users/`, {
        headers: { "Authorization": `Token ${localStorage.getItem('token') || ''}`, "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setApiError(error.message || "Failed to fetch users.");
    }
  }, []);

  // Add a new user
  const addUser = async () => {
    try {
      const response = await fetch(`${API_URL}register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Token ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.status === "success") {
        setUsers([...users, { username: newUser.username, role: newUser.role }]);
        setNewUser({ username: '', password: '', role: 'user' });
        setNotifications(prev => [...prev, `User ${newUser.username} added successfully.`]);
      }
    } catch (error) {
      console.error("Error adding user:", error);
      setApiError(error.message || "Failed to add user.");
    }
  };

  // Remove a user
  const removeUser = async (username) => {
    try {
      const response = await fetch(`${API_URL}delete-account/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "Authorization": `Token ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify({ username, password: prompt("Enter password to confirm deletion:") }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.status === "success") {
        setUsers(users.filter(user => user.username !== username));
        setNotifications(prev => [...prev, `User ${username} removed successfully.`]);
      }
    } catch (error) {
      console.error("Error removing user:", error);
      setApiError(error.message || "Failed to remove user.");
    }
  };

  const fetchStatus = useCallback(async () => {
    try {
      const startTime = performance.now();
      const response = await fetch(`${API_URL}sensor-status/?client_id=${siteId || '1'}`, {
        headers: { "Authorization": `Token ${localStorage.getItem('token') || ''}`, "Content-Type": "application/json" },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized: Invalid or expired token. Please log in again.");
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      setSensors(prevSensors => {
        const newSensors = { ...prevSensors };
        const currentTime = Date.now();
        const newNotifications = [];

        // Update uptime for all sensors
        Object.keys(newSensors).forEach(sensorKey => {
          newSensors[sensorKey] = { ...newSensors[sensorKey], uptime: (newSensors[sensorKey].uptime || 0) + 5 };
        });

        // Parse sensor data from backend
        Object.entries(data.data || {}).forEach(([sensorKey, sensorData]) => {
          const previousSensor = prevSensors[sensorKey] || { connected: true, uptime: 0 };
          const wasConnected = previousSensor.connected ?? true;
          const isConnected = sensorData.connected ?? true;

          // Initialize sensor object
          newSensors[sensorKey] = {
            ...newSensors[sensorKey],
            enabled: sensorData.enabled ?? false,
            connected: isConnected,
            responseTime,
            uptime: (previousSensor.uptime || 0) + 5,
          };

          // Handle sensor-specific data
          if (sensorKey === 'dht') {
            newSensors.dht.temperature = sensorData.temperature ?? 0;
            newSensors.dht.humidity = sensorData.humidity ?? 0;
            newSensors.dht.history = [...(newSensors.dht.history || [])];
            newSensors.dht.history.push({
              temperature: sensorData.temperature ?? 0,
              humidity: sensorData.humidity ?? 0,
              timestamp: currentTime,
            });
          } else {
            newSensors[sensorKey].value = sensorData.value ?? 0;
            newSensors[sensorKey].history = [...(newSensors[sensorKey].history || [])];
            newSensors[sensorKey].history.push({
              value: sensorData.value ?? 0,
              timestamp: currentTime,
            });
          }

          // Limit history to 50 entries
          if (newSensors[sensorKey].history.length > 50) {
            newSensors[sensorKey].history.shift();
          }

          // Calculate pulse (events per minute)
          newSensors[sensorKey].pulse = newSensors[sensorKey].history.filter(
            h => h.timestamp > currentTime - 60000
          ).length;

          // Notify on disconnection
          if (!isConnected && wasConnected) {
            newNotifications.push(`${sensorKey.toUpperCase()} disconnected at ${new Date().toLocaleTimeString()} for Home ${siteId || '1'}`);
          }
        });

        if (newNotifications.length > 0) {
          setNotifications(prev => [...prev, ...newNotifications]);
        }

        setApiError(null);
        return newSensors;
      });
    } catch (error) {
      console.error("Error fetching sensor status:", error);
      setApiError(error.message || `Failed to fetch sensor data for Home ${siteId || '1'}.`);
    }
  }, [siteId]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  useEffect(() => {
    const initCharts = () => {
      Object.entries(chartRefs).forEach(([key, ref]) => {
        const canvas = ref.current;
        if (canvas) {
          if (chartInstances.current[key]) chartInstances.current[key].destroy();
          chartInstances.current[key] = new Chart(canvas, {
            type: 'line',
            data: {
              labels: [],
              datasets: [{
                label: key.includes('Temp') ? 'Temperature (°C)' : key.includes('Humidity') ? 'Humidity (%)' : `${key.toUpperCase()} Value`,
                data: [],
                borderColor: key.includes('Temp') ? '#ff7300' : key.includes('Humidity') ? '#82ca9d' : '#8884d8',
                fill: false,
              }],
            },
            options: {
              responsive: true,
              scales: {
                x: { type: 'category', title: { display: true, text: 'Time', color: 'var(--primary-text)' }, ticks: { color: 'var(--primary-text)' } },
                y: {
                  title: {
                    display: true,
                    text: key.includes('Temp') ? 'Temperature (°C)' : key.includes('Humidity') ? 'Humidity (%)' : 'Value',
                    color: 'var(--primary-text)',
                  },
                  ticks: { color: 'var(--primary-text)' },
                  min: key.includes('Temp') ? 0 : key.includes('Humidity') ? 0 : 0,
                  max: key.includes('Temp') ? 50 : key.includes('Humidity') ? 100 : 1.5,
                },
              },
              plugins: { legend: { labels: { color: 'var(--primary-text)' } } },
            },
          });
        }
      });
    };

    const updateCharts = () => {
      Object.entries({
        pir: { ref: chartRefs.pir, dataKey: 'value', history: sensors.pir.history },
        vibration: { ref: chartRefs.vibration, dataKey: 'value', history: sensors.vibration.history },
        dhtTemp: { ref: chartRefs.dhtTemp, dataKey: 'temperature', history: sensors.dht.history },
        dhtHumidity: { ref: chartRefs.dhtHumidity, dataKey: 'humidity', history: sensors.dht.history },
      }).forEach(([key, { ref, dataKey, history }]) => {
        const chart = chartInstances.current[key];
        if (chart && history) {
          chart.data.labels = history.map(h => new Date(h.timestamp).toLocaleTimeString());
          chart.data.datasets[0].data = history.map(h => h[dataKey] ?? 0);
          chart.update();
        }
      });
    };

    initCharts();
    const interval = setInterval(updateCharts, 5000);

    return () => {
      clearInterval(interval);
      Object.values(chartInstances.current).forEach(chart => chart?.destroy());
    };
  }, [sensors, chartRefs]);

  const handleModeChange = async (newMode) => {
    try {
      const response = await fetch(`${API_URL}mode/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Token ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify({ mode: newMode, client_id: siteId || '1' }),
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized: Invalid or expired token. Please log in again.");
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === "success") {
        setMode(newMode);
        setApiError(null);
        setNotifications(prev => [...prev, `System mode changed to ${newMode} for Home ${siteId || '1'}.`]);
      } else {
        throw new Error("Failed to update mode.");
      }
    } catch (error) {
      console.error("Error setting mode:", error);
      setApiError(error.message || "Failed to update system mode.");
    }
  };

  const handleSensorToggle = async (sensor, state) => {
    try {
      const response = await fetch(`${API_URL}sensor/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Token ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify({ sensor_id: sensor, state: state === "on", client_id: siteId || '1' }),
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized: Invalid or expired token. Please log in again.");
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === "success") {
        setSensors(prev => ({
          ...prev,
          [sensor]: { ...prev[sensor], enabled: state === "on" },
        }));
        setApiError(null);
        setNotifications(prev => [...prev, `${sensor.toUpperCase()} sensor ${state === "on" ? "enabled" : "disabled"}.`]);
      } else {
        throw new Error("Failed to toggle sensor.");
      }
    } catch (error) {
      console.error("Error toggling sensor:", error);
      setApiError(error.message || "Failed to toggle sensor.");
    }
  };

  if (!home) return <div className="security-system-container">Invalid Site ID</div>;

  return (
    <div className="security-system-container">
      <h1>Security System - {home.siteType} (Site ID: {siteId})</h1>
      {apiError && <div className="api-error">{apiError}</div>}
      <div className="mode-section">
        <h2>System Mode: {mode}</h2>
        <div className="mode-buttons">
          {["Stay", "Away", "Disarm"].map(m => (
            <button key={m} className={mode === m ? "active" : ""} onClick={() => handleModeChange(m)}>
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="sensors-section">
        <h2>Sensors</h2>
        {Object.entries(sensors).map(([sensorKey, sensor]) => (
          <div key={sensorKey} className="sensor-item">
            <h3>{sensorKey.toUpperCase()} Sensor</h3>
            <div className="sensor-info">
              <p>Connected: <span className={sensor.connected ? "connected" : "disconnected"}>{sensor.connected ? "Yes" : "No"}</span></p>
              <p>Enabled: <span className={sensor.enabled ? "enabled" : "disabled"}>{sensor.enabled ? "Yes" : "No"}</span></p>
              {sensorKey === 'dht' ? (
                <>
                  <p>Temperature: {sensor.temperature.toFixed(1)} °C</p>
                  <p>Humidity: {sensor.humidity.toFixed(1)} %</p>
                </>
              ) : <p>Value: {sensor.value}</p>}
              <p>Pulse: {sensor.pulse} {sensorKey === 'dht' ? 'updates' : 'triggers'}/min</p>
              <p>Response Time: {sensor.responseTime.toFixed(2)} ms</p>
              <p>Uptime: {(sensor.uptime / 3600).toFixed(2)} hours</p>
            </div>
            {sensorKey === 'dht' ? (
              <>
                <canvas id={`chart-dht-temp-${siteId}`} ref={chartRefs.dhtTemp} width="400" height="200"></canvas>
                <canvas id={`chart-dht-humidity-${siteId}`} ref={chartRefs.dhtHumidity} width="400" height="200"></canvas>
              </>
            ) : (
              <canvas id={`chart-${sensorKey}-${siteId}`} ref={chartRefs[sensorKey]} width="400" height="200"></canvas>
            )}
            <button
              className={`toggle-btn ${sensor.enabled ? "enabled" : "disabled"}`}
              onClick={() => handleSensorToggle(sensorKey, sensor.enabled ? "off" : "on")}
            >
              {sensor.enabled ? "Disable" : "Enable"}
            </button>
          </div>
        ))}
      </div>
      <div className="users-section">
        <h2>
          User Management
          <button onClick={() => { setIsUserTabVisible(!isUserTabVisible); fetchUsers(); }}>
            {isUserTabVisible ? "Hide" : "Show"}
          </button>
        </h2>
        {isUserTabVisible && (
          <>
            <div className="add-user-form">
              <input
                type="text"
                placeholder="Username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
              <button onClick={addUser}>Add User</button>
            </div>
            <div className="user-list">
              {users.map((user, index) => (
                <div key={index} className="user-item">
                  <p>{user.username} ({user.role})</p>
                  <button onClick={() => removeUser(user.username)}>Remove</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="notifications-section">
        <h2>Notifications for {home.siteType} (Site ID: {siteId})</h2>
        {notifications.length > 0 ? (
          <ul className="logs-list">
            {notifications.map((notification, index) => (
              <li key={index} className="log-item">
                {notification}
                <button
                  className="dismiss-btn"
                  onClick={() => setNotifications(prev => prev.filter((_, i) => i !== index))}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="no-notifications">No new notifications</p>}
      </div>
    </div>
  );
};

export default SecuritySystem;