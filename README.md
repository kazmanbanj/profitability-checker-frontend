# 📊 Specifi Profit Optimiser

A prototype web app built with **Vue 3** and a **Laravel API** to help AV dealers assess job quote profitability and receive AI-powered improvement suggestions.

---

## 🚀 Tech Stack

- **Frontend:** Vue 3 (Composition API, TypeScript, Vue Router, Tailwind CSS)
- **Backend:** Laravel 12 API (PHP 8.x, MySQL)
- **AI Integration:** Gemini (profitability suggestions)
- **Styling:** Tailwind CSS
- **PDF Export:** barryvdh/laravel-dompdf

---

## ✨ Features

- Dynamic quote form: products, services, labor, overheads
- Financial calculations: gross profit, margin, cost breakdown
- Profitability health indicator: 🟢 Green / 🟡 Amber / 🔴 Red
- AI-generated suggestions for:
  - Margin improvements
  - Labor optimization
  - Product swaps
  - Client-friendly summaries
- Editable suggestions
- History & version tracking
- Exportable quote summaries

---

## 📋 Prerequisites

- Node.js (v18+)
- npm or yarn
- PHP (8.1+)
- Composer
- MySQL
- Git

---

## 🛠️ Installation & Setup

### Backend (Laravel API)

```bash
git clone https://github.com/kazmanbanj/profitability-checker-backend.git
cd profitability-checker-backend
composer install
cp .env.example .env
php artisan key:generate
```

Edit `.env` with your database and Gemini API credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password

GEMINI_API_KEY="your_gemini_api_key"
GEMINI_API_BASE_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
GEMINI_ROLE="user"

FRONTEND_URL=http://localhost:5173
```

Set up the database and seed data:

```bash
php artisan migrate
php artisan db:seed
```

Start the API server:

```bash
php artisan serve
```

API available at: [http://localhost:8000](http://localhost:8000)

---

### Frontend (Vue 3)

```bash
git clone https://github.com/kazmanbanj/profitability-checker-frontend.git
cd profitability-checker-frontend
npm install # or yarn install
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SERVER_PORT=5173
```

Start the frontend server:

```bash
npm run dev # or yarn dev
```

Frontend available at: [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```text
project-root/
├── frontend/               # Vue 3 Application
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── router/
│   │   └── views/
│   └── public/
└── README.md
```

---

## ❓ Troubleshooting

**CORS Errors:**
- Ensure `FRONTEND_URL` is set correctly in Laravel `.env`
- Check `config/cors.php`

**API Connection Issues:**
- Verify `VITE_API_BASE_URL` in Vue `.env`
- Ensure Laravel server is running

**Database Connection:**
- Check credentials in Laravel `.env`
- Ensure MySQL server is running

---
