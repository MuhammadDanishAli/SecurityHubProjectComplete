

# 🔐 SecurityHub Project (Complete)

A **real-time IoT-based security monitoring system** integrating hardware, backend, frontend, and mobile app.  
The system connects **ESP32 hub + sensors** in a star topology to a **backend (Django + FastAPI)**, with a **web dashboard (React)** for superuser control and a **mobile app (React Native)** for client alerts.

---

## 🚀 Features
- 🛰️ **Star Topology Hardware Network** (ESP32 Hub + multiple sensor nodes)  
- 📡 **MQTT Communication** between hub and backend  
- 🔥 **Alerts & Notifications** (door intrusion, fire detection, system logs)  
- 🖥️ **Web Dashboard** for monitoring & system control  
- 📱 **Mobile App** for client alerts & interaction  
- ⚡ **Backend Integration** with real-time APIs  

---

## 🛠️ Tech Stack

### Hardware
- **ESP32 Hub** (central controller)
- **Peripheral Sensors** (door, fire, motion, etc.)
- **MQTT Broker** for communication

### Backend (my main work 💻)
- **Django** → Core backend logic & database models
- **FastAPI** → REST APIs for frontend & mobile integration
- **SQLite/PostgreSQL** → Database
- **Real-time Alerts** logging & API endpoints

### Frontend (team contribution, improvised by me ✨)
- **React.js**
- **Tailwind CSS**
- **Recharts / ShadCN UI**

### Mobile App (team contribution, improvised by me ✨)
- **React Native**
- **Expo**

---

## 📂 Project Structure


SecurityHubProjectComplete/
│── backend/        # Django + FastAPI backend (my main focus)
│── frontend/       # React frontend dashboard (improvised)
│── app/            # React Native mobile app (improvised)
│── hardware/       # ESP32 firmware code + circuit diagrams
│── README.md       # Project documentation
│── .gitignore      # Ignore unnecessary files




## 📸 Demonstration

### Hardware Setup
![ESP32 Hub + Sensor Nodes](hardware/diagram.png)

### System Dashboard
![Frontend Dashboard](frontend/src/Logo7.png)

### Mobile App
![Mobile App](app/assets/demo.png)


## ⚙️ Setup Instructions

### 1. Clone the Repo
``   bash
git clone https://github.com/MuhammadDanishAli/SecurityHubProjectComplete.git
cd SecurityHubProjectComplete


### 2. Backend Setup

bash
cd backend
pip install -r requirements.txt
python manage.py runserver


### 3. Frontend Setup

bash
cd frontend
npm install
npm start

### 4. Mobile App Setup

bash
cd app
npm install
npx expo start


### 5. Hardware Setup

* Flash ESP32 hub with firmware (see `/hardware/esp32_hub.ino`)
* Connect sensor nodes (door, fire, etc.)
* Configure MQTT broker (e.g., Mosquitto)
* Verify backend receives data via API

---

## 👨‍💻 Contributions

* **Muhammad Danish Ali (me)** – Backend development, hardware integration, ESP32 communication, backend ↔ frontend/app API integration
* **Team Members** – Web frontend (React), mobile app (React Native)

---

## 🎯 Future Enhancements

* AI-based anomaly detection for smarter alerts
* Cloud database support
* Mobile push notifications
* Role-based access control

---

```


Do you want me to also draft a **short section for `/hardware/README.md`** (ESP32 setup, MQTT config, flashing guide), so your hardware contribution is documented separately too?
```
