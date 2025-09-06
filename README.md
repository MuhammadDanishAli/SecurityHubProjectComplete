🔐 SecurityHub Project

A complete security monitoring system integrating hardware sensors, backend intelligence, and frontend/app interfaces.
This project demonstrates real-time sensor data collection, backend processing, and user-friendly monitoring via web & mobile apps.

📸 Project Preview
Frontend (Web Dashboard)

![Frontend Dashboard](frontend/src/Logo7.png)

![Frontend Dashboard](frontend/src/Logo7.png)

![Frontend Dashboard](frontend/src/Logo7.png)


Hardware Setup

![Hardware setup](frontend/src/Logo7.png)

![Hardware setup](frontend/src/Logo7.png)


Mobile App

![Mobile App](frontend/src/Logo7.png)

![Mobile App](frontend/src/Logo7.png)


🚀 Features

Hardware Integration

ESP32-based central hub (star topology)

Fire, motion, door, and other security sensors

MQTT-based real-time communication

Backend (Core)

Django + FastAPI hybrid backend

Real-time alert logging & monitoring

Microsoft Access + Excel database integration

Frontend (Web)

React + TailwindCSS dashboard

Real-time visualization for superuser monitoring

Mobile App

React Native app for client alerts

Simplified mobile-first monitoring

🛠️ Tech Stack
Layer	Tools / Frameworks
Hardware	ESP32, Fire & Motion Sensors
Communication	MQTT (Mosquitto / EMQX)
Backend	Django, FastAPI, SQLite / MS Access
Frontend	React, TailwindCSS
Mobile	React Native
Versioning	Git + GitHub
📂 Project Structure
SecurityHubProjectComplete/
│── backend/         # Django + FastAPI backend
│── frontend/        # Web dashboard (React)
│── app/             # Mobile app (React Native)
│── hardware/        # ESP32 + sensor firmware
│── database/        # Access DB + Excel integrations
│── images/          # Project screenshots & diagrams
│── venv/            # Python virtual environment
│── README.md        # Project documentation

⚡ Installation & Setup
Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

Frontend
cd frontend
npm install
npm start

Mobile App
cd app
npm install
npx react-native run-android   # or run-ios

📡 Hardware Setup

Connect ESP32 as the central hub.

Attach sensors (fire, motion, door, etc.) using star topology.

Configure MQTT broker (Mosquitto/EMQX).

Flash the ESP32 firmware (code inside hardware/).

📖 Research & Paper

This project forms the foundation of a research paper on:

IoT-based security frameworks

Real-time alert mechanisms

Hardware-software integration challenges

👨‍💻 Contributions

Muhammad Danish Ali – Backend development, hardware integration, system design

Team – Web dashboard & mobile app

.

📬 Contact

Author: Muhammad Danish Ali

GitHub Repo: SecurityHubProjectComplete

Email: muhammad.danish.at.work@gmail.com
