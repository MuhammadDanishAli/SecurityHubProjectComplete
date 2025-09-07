🔐 SecurityHub Project

A complete security monitoring system integrating hardware sensors, backend intelligence, and frontend/app interfaces.
This project demonstrates real-time sensor data collection, backend processing, and user-friendly monitoring via web & mobile apps.

📸 Project Preview
Frontend (Web Dashboard)

![Frontend Dashboard](https://github.com/MuhammadDanishAli/SecurityHubProjectComplete/blob/main/Frontend.png)

![Frontend Dashboard](https://github.com/MuhammadDanishAli/SecurityHubProjectComplete/blob/main/Frontend2.png)

![Frontend Dashboard](https://github.com/MuhammadDanishAli/SecurityHubProjectComplete/blob/main/Frontend3.png)


Hardware Setup

Central Hub

![Hardware setup](https://github.com/MuhammadDanishAli/SecurityHubProjectComplete/blob/main/Central_HUB.jpeg)

Node

![Hardware setup](https://github.com/MuhammadDanishAli/SecurityHubProjectComplete/blob/main/Node.jpeg)


Mobile App

![Mobile App](https://github.com/MuhammadDanishAli/SecurityHubProjectComplete/blob/main/App1.jpeg)

![Mobile App](https://github.com/MuhammadDanishAli/SecurityHubProjectComplete/blob/main/App2.jpeg)


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



SecurityHubProjectComplete/
├── backend/                # Django + FastAPI backend services
├── frontend/               # React web dashboard
├── mobile/                 # React Native mobile app
├── firmware/               # ESP32 and sensor firmware
├── database/               # SQLite/MS Access configurations
├── assets/                 # Screenshots, diagrams, and media
├── docs/                   # Documentation and guides
├── venv/                   # Python virtual environment
└── README.md               # Project overview and setup



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
