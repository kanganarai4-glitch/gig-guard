# Gig Guard

AI-powered financial protection system for delivery partners

---

## Overview

Gig Guard is a full-stack, AI-driven system designed to protect delivery partners from income loss during disruptions such as heavy rainfall, poor air quality, or local curfews.

Instead of relying on slow, manual claim processes, Gig Guard continuously monitors real-world conditions, calculates risk using machine learning, and automatically triggers payouts when a driver is unable to work.

The system simulates real-world integration with platforms like Zomato or Swiggy using a partner API, demonstrating a scalable and backend-first approach to gig worker financial security.

---

## The Problem

Delivery partners operate on a per-task earning model. When disruptions occur, their income stops immediately.

* No income during disasters or curfews
* No structured financial safety net
* Manual claim systems are slow and unreliable

---

## The Solution

Gig Guard provides a fully automated safety system:

* Login via phone or delivery platform
* Driver data fetched from a simulated partner API
* Real-time monitoring of weather, AQI, and location
* Risk calculated using ML models
* Automatic claim generation and payout
* Notifications via WhatsApp and VAANI AI assistant

This removes paperwork, reduces delays, and ensures timely support.

---

## System Architecture

```text
[ React Frontend ]
        │
        ▼
[ Backend API (Node.js / Express) ]
        │
        ├── MongoDB (Driver & Claims Data)
        ├── Mock Partner API
        ├── ML Models (INDRA, KAVACH, DHAN)
        ├── External APIs (Weather, AQI, Maps)
        └── WhatsApp Notification Service
```

---

## Intelligence Stack

```text
INDRA → KAVACH → DHAN → VAANI
```

### INDRA — Risk Engine

* Uses weather, AQI, and location data
* Generates risk score (0–100)
* Triggers protection when threshold is crossed

---

### KAVACH — Fraud Engine

* GPS validation
* Movement tracking
* Duplicate claim detection
* Environmental verification

---

### DHAN — Payout Engine

* Calculates payout based on:

  * Risk score
  * Work disruption
  * Earnings

---

### VAANI — AI Assistant

* Explains system decisions
* Provides work guidance
* Answers user queries in natural language

---

## MVP (Minimum Viable Product)

The current implementation demonstrates:

* Platform-based login (Zomato, Swiggy, Google)
* Driver data ingestion via mock API
* Real-time risk scoring
* Automatic claim generation
* Fraud validation using GPS and behavior tracking
* Dynamic payout calculation
* React dashboard
* WhatsApp notifications

---

## Product Flow (Website Architecture)

## Project Structure (Next.js + Supabase)

Gig Guard follows a scalable, production-ready architecture using Next.js 14, TypeScript, Tailwind, and Supabase.

```text
gigguard/
│
├── middleware.ts              # Auth guard — redirects unauthenticated users
├── next.config.js             # Next.js config (PWA, image domains)
├── tailwind.config.js         # Theme colors (navy, amber)
├── tsconfig.json              # TypeScript config with path aliases
├── package.json               # Dependencies (Next, Supabase, Leaflet, Chart.js)
├── .env.example               # Environment variables
├── .gitignore
├── README.md
│
├── public/                    # Static assets (PWA icons, manifest)
│   ├── manifest.json
│   ├── icon-192.png
│   └── icon-512.png
│
├── supabase/
│   └── schema.sql             # Database schema + RLS policies
│
├── app/                       # Next.js App Router
│   ├── layout.tsx             # Root layout + context providers
│   ├── globals.css            # Global styles
│   ├── page.tsx               # Redirect to dashboard
│   │
│   ├── (auth)/login/          # Authentication pages
│   │   └── page.tsx
│   │
│   ├── (app)/                 # Main app layout
│   │   ├── layout.tsx
│   │   │
│   │   ├── dashboard/         # Main dashboard
│   │   ├── claims/            # Claims + pipeline view
│   │   ├── map/               # Live risk map (Leaflet)
│   │   ├── profile/           # Settings & user profile
│   │   └── monitor/           # System architecture monitor
│   │
│   └── api/                   # Backend routes (Next API)
│       ├── weather/
│       ├── claims/
│       ├── plans/
│       ├── earnings/
│       └── whatsapp/
│
├── components/                # UI components
│   ├── layout/                # Navbar, Sidebar, BottomNav
│   ├── dashboard/             # Dashboard widgets
│   ├── claims/                # Claim UI components
│   ├── map/                   # Map + zones
│   ├── profile/               # Profile components
│   ├── shared/                # Reusable UI (toast, badge, skeleton)
│   └── modals/                # Modals (plans, simulation)
│
├── hooks/                     # Custom React hooks
│   ├── useAuth.ts
│   ├── useWeather.ts
│   ├── useClaims.ts
│   ├── usePlan.ts
│   ├── useToast.ts
│   └── useOffline.ts
│
├── context/                   # Global state
│   ├── DeviceContext.tsx
│   └── LanguageContext.tsx
│
├── lib/                       # Core utilities
│   ├── supabase.ts
│   ├── translations.ts
│   ├── risk.ts
│   ├── cache.ts
│   └── zones.ts
│
└── types/                     # TypeScript types
    └── index.ts
```

---

## Architecture Highlights

* **App Router (Next.js 14)** for scalable routing
* **Supabase integration** for auth, database, and realtime updates
* **API routes inside `/app/api`** for backend logic
* **Modular components system** for UI scalability
* **Custom hooks** for clean business logic separation
* **Context API** for global state (device + language)
* **Offline support + caching layer**
* **PWA-ready setup** with manifest and install support

---

## Why This Structure Matters

* Clean separation of frontend, backend, and logic
* Easy to scale for production-level systems
* Supports real-time updates and offline mode
* Optimized for performance and maintainability

---


### 1. Home Page

* Platform login (Zomato / Swiggy / Google)
* Quick onboarding

---

### 2. Dashboard

* Risk score
* Environmental insights
* Earnings vs protected amount
* Active plan

---

### 3. Intelligence Stack & Fraud Map

* Visual model pipeline
* Real-time validation using:

  * Location
  * Movement
  * Environment

---

### 4. VAANI Assistant

Users can ask:

* “Is it safe to work today?”
* “Why did I receive this payout?”

---

### 5. Claims

* Claim history
* Status tracking
* Disruption type

---

### 6. Vault

* Total payouts
* Earnings protection
* Bank/UPI integration

---

### 7. Protection Plans

| Plan     | Cost | Coverage            | Max Payout |
| -------- | ---- | ------------------- | ---------- |
| Basic    | ₹34  | Rain only           | ₹600       |
| Standard | ₹58  | Rain + AQI + Curfew | ₹1,200     |
| Premium  | ₹89  | All disruptions     | ₹2,000     |

---

## WhatsApp Bot Integration

Gig Guard includes a WhatsApp-based notification system.

### Features

* Risk alerts
* Payout confirmations
* Real-time updates
* Safety recommendations

### Example

```
Risk Alert:
Heavy rainfall detected.
Risk Score: 72 (High)

Payout Update:
₹320 credited to your UPI

Reminder:
AQI rising after 6 PM
```

---

## Unique Features

* Fully automated claims and payouts
* Multi-stage AI pipeline
* Fraud detection map
* VAANI AI assistant
* Real-time environmental awareness
* Subscription-based model
* WhatsApp communication

---

## Advantages

* No manual claim process
* Fast payouts
* Data-driven decisions
* Fraud prevention
* Scalable system
* Easy for non-technical users

---

## Tech Stack

Frontend:

* React.js

Backend:

* Node.js
* Express.js
* fastapi


* MongoDB
* supabase
ML:

* LightGBM
* Random Forest
* Isolation Forest

APIs:

* Weather
* AQI
* Maps
* WhatsApp

---

## Vision
Gig Guard aims to become an infrastructure layer for financial safety in the gig economy.
---
## Disclaimer
This project uses simulated APIs for demonstration purposes.
No real platform data is used.
---


# 🚀 GigGuard AI — Smart Risk, Fraud & Payout Engine

GigGuard AI is an intelligent backend system designed for gig workers (delivery partners, drivers, etc.) that automates:

* ⚡ Risk detection
* 🛡️ Fraud detection
* 💰 Smart payout calculation
* 📦 Subscription-based protection plans

---

# 🧠 System Architecture

```
User Input
   ↓
INDRA (Risk Engine)
   ↓
KAVACH (Fraud Detection)
   ↓
Decision Layer
   ↓
DHAN (Payout Engine)
   ↓
Plan Cap (Basic / Standard / Premium)
   ↓
Final Response
```

---

# ⚙️ Features

## 🔥 1. INDRA — Risk Prediction

* Uses ML to calculate real-time risk score
* Based on weather, location, and environmental factors

## 🛡️ 2. KAVACH — Fraud Detection

* Detects suspicious claims using:

  * Speed
  * Claim frequency
  * GPS mismatch
  * Risk inconsistency

## 💰 3. DHAN — Payout Engine

* Predicts fair compensation using ML
* Applies plan-based payout limits

## 📦 4. Protection Plans

| Plan     | Cost | Coverage            | Max Payout |
| -------- | ---- | ------------------- | ---------- |
| Basic    | ₹34  | Rain only           | ₹600       |
| Standard | ₹58  | Rain + AQI + Curfew | ₹1200      |
| Premium  | ₹89  | All disruptions     | ₹2000      |

---

# 🧩 Tech Stack

### Backend

* FastAPI (Python)
* Node.js (User & Plan Management)

### ML Models

* LightGBM (Risk - INDRA)
* RandomForest (Fraud - KAVACH)
* RandomForest (Payout - DHAN)

### Database

* MongoDB Atlas

### Others

* Pydantic
* PyMongo
* dotenv

---

# 📁 Project Structure

```
app/
│
├── model/
│   ├── indra.py
│   ├── kavach.py
│   ├── dhan.py
│
├── service/
│   ├── driver_service.py
│   ├── feature_builder.py
│
├── pipeline/
│   └── pipeline.py
│
├── constants/
│   └── plans.py
│
└── main.py

ml/
├── train_indra.py
├── train_kavach.py
├── train_dhan.py
```

---

# 🚀 Installation & Setup

## 1️⃣ Clone Repo

```
git clone <your-repo-url>
cd gigguard
```

## 2️⃣ Create Virtual Environment

```
python -m venv venv
venv\Scripts\activate
```

## 3️⃣ Install Dependencies

```
pip install -r requirements.txt
```

## 4️⃣ Setup Environment Variables

Create `.env` file:

```
MONGO_URL=your_mongodb_connection_string
```

---

# ▶️ Run Server

```
uvicorn app.main:app --reload
```

Open:

```
http://127.0.0.1:8000/docs
```

---

# 📮 API Usage

## 🔹 POST `/api/predict`

### Request Body:

```json
{
  "user_id": "driver_id_here",

  "rain": 80,
  "aqi": 300,
  "wind": 20,
  "visibility": 2,
  "humidity": 90,
  "temp": 32,
  "pressure": 1000,
  "hour": 14,
  "location_risk": 75,
  "curfew": 1,

  "speed": 40,
  "claims_last_4h": 0,
  "gps_distance": 50
}
```

---

### Response:

```json
{
  "success": true,
  "status": "Approved ✅",
  "plan": "standard",
  "indra": {...},
  "kavach": {...},
  "payout": {
    "final_payout": 1200
  }
}
```

---

# 🧠 How It Works

* INDRA calculates risk score
* KAVACH checks fraud
* If safe → DHAN calculates payout
* Plan caps the payout amount

---

# 🔒 Security

* Environment variables for secrets
* Input validation using Pydantic
* Fraud detection layer (KAVACH)

---

# 📈 Future Improvements

* 📊 Dashboard analytics
* 🤖 Plan upgrade recommendations
* 💳 Payment integration
* 📡 Real-time weather APIs

---

# 💣 Built For

* Gig Economy Platforms (Zomato, Swiggy, Uber)
* InsurTech Startups
* AI-based Risk Systems

---

# 👨‍💻 Author

**Priyanshu Joshi**

---

# ⭐ Final Note

This project demonstrates a **complete AI-driven backend system** combining:

* Machine Learning
* Fraud Detection
* Financial Logic
* Scalable Architecture

🚀 Ready for production & deployment
