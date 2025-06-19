# 📊 Specifi Profit Optimiser

A working prototype web app built with **Vue 3** and **Laravel API**, designed to help AV dealers assess the profitability of job quotes and receive AI-generated improvement suggestions.

---

## 🚀 Tech Stack

- **Frontend**: Vue 3 (Composition API, TypeScript, Vue Router, Tailwind CSS)
- **Backend**: Laravel 12 API (PHP 8.x, MySQL)
- **AI Integration**: Gemini for profitability suggestions
- **Styling**: Tailwind CSS
- **PDF Export**: Barryvdh/laravel-dompdf

---

## ✨ Features

- Dynamic quote form for products, services, labor, and overheads
- Financial calculations: gross profit, margin, cost breakdown
- Profitability health indicator: 🟢 Green / 🟡 Amber / 🔴 Red
- AI-generated suggestions for:
  - Margin improvements
  - Labor optimization
  - Product swaps
  - Client-friendly profitability summary
- Editable suggestions
- History and version tracking
- Clear quote summary for review and export

---

## 📋 Prerequisites
Before you begin, ensure you have the following installed:

- Node.js (v18.x or higher)
- npm or yarn
- PHP (8.1 or higher)
- Composer
- MySQL
- Git

---

## 🛠️ Installation & Setup
Backend Setup (Laravel API): Run in terminal

- **Clone the repository**: git clone https://github.com/kazmanbanj/profitability-check-backend.git
- **Go into the folder**: cd profitability-check-backend
- **Install PHP dependencies**: composer install
- **Environment configuration**: cp .env.example .env
- **Generate app key**: php artisan key:generate

Configure your .env file
- DB_CONNECTION=mysql
- DB_HOST=127.0.0.1
- DB_PORT=3306
- DB_DATABASE=your_database_name
- DB_USERNAME=your_username
- DB_PASSWORD=your_password

Setup GEMINI configurations for AI suggestions in .env. To get the **GEMINI_API_KEY**:

- visit https://ai.google.dev/gemini-api/docs, then sign in,
- then click **Get a Gemini API Key** button,
- Create API key,
- Select Gemini API project,
- Then Create API Key in Existing Project,
- Then copy the API key generated as you can only view the key once,

- Then paste the key in the env:

  - GEMINI_API_KEY=""
  - GEMINI_API_BASE_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
  - GEMINI_ROLE="user"

# Set CORS settings for Vue app in .env
FRONTEND_URL=http://localhost:5173

# Database setup
- php artisan migrate
- php artisan db:seed

Start the Laravel development server
- php artisan serve


API will be available at: http://localhost:8000


Frontend Setup (Vue 3)

Open New Terminal to clone and navigate to frontend directory:

- **run**: git clone https://github.com/kazmanbanj/profitability-checker-frontend.git
- **Install Node.js dependencies**: npm install **or** yarn install
- **Environment configuration**: cp .env.example .env
- **Configure your .env file**:
  - VITE_API_BASE_URL=http://localhost:8000
  - VITE_SERVER_PORT=5173
- **Start the Vue development server**: npm run dev **or** yarn dev
Frontend will be available at: http://localhost:5173

---

## 📁 Project Structure

project-root/
├── frontend/               # Vue 3 Application
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── router/
│   │   └── views/
│   └── public/
└── README.md

---

❓ Troubleshooting
Common Issues


- CORS Errors:

Ensure FRONTEND_URL is set correctly in Laravel .env

Check config/cors.php configuration

- API Connection Issues:

Verify VITE_API_BASE_URL in Vue .env

Ensure Laravel server is running on correct port

- Database Connection:

Check database credentials in Laravel .env

Ensure database server is running

---
