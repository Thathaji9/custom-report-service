# 📊 Custom Report Service

A **full-stack application** designed for generating interactive dashboards, exporting PDF reports, scheduling automated report delivery, and managing flexible, widget-based layouts for custom business use cases.

## 🚀 Key Features

  * ✔ **Full-stack Project:** Built using **React**, **Node.js**, and **TypeScript**.
  * ✔ **Report Generation:** Ability to generate and export **PDF reports**.
  * ✔ **Automation:** Schedule automated **email reports** using cron expressions.
  * ✔ **Dashboard Builder:** Custom dashboard interface with drag-and-drop **widgets**.
  * ✔ **Backend API:** Dedicated API routes for all report data and services.
  * ✔ **Architecture:** Modular backend with distinct layers (services, routes, models).
  * ✔ **Scheduling:** Supports **cron-based** scheduling for time-based tasks.
  * ✔ **Extensibility:** Easily extendable to support new report types and data sources.

-----

## 🧰 Tech Stack

| Component | Technologies Used |
| :--- | :--- |
| **Frontend** | **React**, **TypeScript**, Custom Hooks, CSS |
| **Backend** | **Node.js**, **Express**, **TypeScript** |
| **Services** | PDF export service, Cron / Scheduler service |

-----

## 📁 Folder Structure

```
custom-report-service/
│
├── backend/                  # Backend server (Node + TypeScript)
│   ├── src/                  # Source files
│   │   ├── models/           # DB/Data models
│   │   ├── routes/           # API routes
│   │   ├── services/         # PDF, Email, Scheduler services
│   │   └── server.ts         # Express server entry point
│   │
│   ├── dist/                 # Transpiled JavaScript files
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                  # Environment variables (ignored)
│
├── src/                      # Frontend (React)
│   ├── components/           # UI components (Dashboard, Sidebar, etc.)
│   ├── hooks/                # Reusable logic hooks
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
│
├── public/                   # Static files
│   └── employees.json        # Example data
│
├── package.json              # Frontend package config
├── tsconfig.json
├── .gitignore
└── README.md
```

-----

## 🛠️ Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Thathaji9/custom-report-service.git
cd custom-report-service
```

### 🖥️ Backend Setup

| Step | Command | Details |
| :--- | :--- | :--- |
| **2️⃣ Install Deps** | `cd backend` then `npm install` | Install Node.js dependencies. |
| **3️⃣ Build & Run** | `npm run build` then `npm start` | Transpile TypeScript and start the Express server. |

> **Backend runs at: `http://localhost:4000`**

### 🎨 Frontend Setup

| Step | Command | Details |
| :--- | :--- | :--- |
| **4️⃣ Install Deps** | `cd ..` then `npm install` | Navigate back to root and install React dependencies. |
| **5️⃣ Start Frontend** | `npm start` | Launches the React development server. |

> **Frontend runs at: `http://localhost:3000`**

-----

## 🔧 API Structure

The backend exposes several key API routes:

| Route | Purpose | Service Integration |
| :--- | :--- | :--- |
| `/api/dashboard` | Fetching data for dashboard widgets. | Data models/Services |
| `/api/scheduledReports` | Creating/updating/listing report schedules. | `schedulerService` |
| `/api/pdfExport` | Triggering on-demand PDF report generation. | `pdfExportService` |
| `/api/scheduler` | General scheduling operations. | `schedulerService` |

### 📅 Report Scheduling Details

Scheduling is handled by `schedulerService.ts` and `schedulerServiceSingleton.ts`, which manage cron expressions, trigger PDF generation, and execute timed tasks.

### 📄 PDF Export Support

The core logic for document creation is in `backend/src/services/pdfExportService.ts`, which generates PDFs from HTML and supports custom templates.

## 📦 Build (Production)

| Component | Command |
| :--- | :--- |
| **Frontend Build** | `npm run build` |
| **Backend Build** | `cd backend` then `npm run build` |

-----

## 🤝 Contributing

Feel free to open issues or Pull Requests. Please adhere to clean commit messages and include clear descriptions for all new features or fixes.

## 📝 License

This project is licensed under the **MIT License**.
