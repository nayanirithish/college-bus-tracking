# 🚌 Bus Tracking System
A real-time bus tracking system built using HTML, CSS, JavaScript, Python (Flask), and MySQL. Displays live bus locations, ETA, and status (Active, Delayed, Completed) on an interactive map using Leaflet.

## 🚀 Features
- Live bus tracking on map
- Dynamic ETA updates
- Active / Delayed / Completed status
- Auto-refresh dashboard
- Simple UI

## 🛠️ Tech Stack
- HTML, CSS, JavaScript
- Python (Flask)
- MySQL
- Leaflet.js

## 🗄️ Database
MySQL database `bus_tracking` with tables:
- buses(id, bus_name, route_id, status)
- routes(id, source, destination)
- tracking(bus_id, latitude, longitude, eta)

## ▶️ How to Run
1. Run backend: python app.py
2. Open index.html in browser

## 👨‍💻 Author
Nayani Rithish
