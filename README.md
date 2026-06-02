# EduNep — School & College Management System

Nepal's complete school and college management platform.
**Stack:** Laravel 11 · React 18 · MySQL 8 · Expo React Native

---

## 🚀 Quick Start

### Backend (Laravel)

```bash
cd backend

# 1. Install dependencies
composer install

# 2. Copy and configure environment
cp .env.example .env
php artisan key:generate

# 3. Configure .env
#    - DB_DATABASE, DB_USERNAME, DB_PASSWORD
#    - PUSHER_* credentials
#    - CLOUDINARY_URL
#    - ESEWA_* and KHALTI_* keys

# 4. Run migrations and seed demo data
php artisan migrate --seed

# 5. Create storage symlink
php artisan storage:link

# 6. Start local server
php artisan serve
```

**Demo credentials (after seeding):**
| Role        | Email                     | Password      |
|-------------|---------------------------|---------------|
| Super Admin | superadmin@edunep.com     | EduNep@2082   |
| Principal   | principal@edunep.com      | EduNep@2082   |
| Teacher     | teacher@edunep.com        | EduNep@2082   |
| Accountant  | accountant@edunep.com     | EduNep@2082   |

---

### Frontend (React)

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Set API URL
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env

# 3. Start dev server
npm run dev

# 4. Build for production
npm run build
# Upload dist/ to public_html/app/ on cPanel
```

---

## 🏗️ cPanel Shared Hosting Deployment

### Backend
1. Upload `backend/` folder **outside** `public_html` (e.g. `/home/user/edunep-api/`)
2. In cPanel → **Subdomains**: create `api.yourdomain.com` pointing to `edunep-api/public`
3. Or in `.htaccess` in `public_html`:
   ```apache
   RewriteEngine On
   RewriteRule ^api/(.*)$ /home/user/edunep-api/public/index.php [L]
   ```
4. Create MySQL DB + user in cPanel → update `.env`
5. Run via cPanel Terminal or SSH:
   ```bash
   php artisan migrate --seed
   php artisan config:cache
   php artisan route:cache
   php artisan storage:link
   ```
6. Set Cron Job in cPanel:
   ```
   * * * * * php /home/user/edunep-api/artisan schedule:run >> /dev/null 2>&1
   ```

### Frontend
```bash
npm run build
# Upload contents of dist/ to public_html/ (or public_html/app/)
```

---

## 📁 Project Structure

```
edunep/
├── backend/                     # Laravel 11 API
│   ├── app/
│   │   ├── Http/Controllers/Api/V1/   # All API controllers
│   │   ├── Models/                    # Eloquent models (32 models)
│   │   └── Services/                  # NepaliDateService, PdfService
│   ├── database/
│   │   ├── migrations/schema.php      # All 34 table schemas
│   │   └── seeders/DatabaseSeeder.php # Roles, permissions, demo data
│   ├── lang/en/ & lang/ne/            # English + Nepali translations
│   └── routes/api.php                 # All API routes
│
└── frontend/                    # React 18 + Vite
    └── src/
        ├── pages/
        │   ├── auth/        # Login, ForgotPassword
        │   ├── admin/       # Dashboard, Students, Staff, Classes...
        │   ├── finance/     # Dashboard, Fees, Invoices, Payroll...
        │   ├── teacher/     # Dashboard, Attendance, Grades...
        │   └── student/     # Dashboard, Grades, Fees...
        ├── components/
        │   ├── layout/      # AdminLayout, AuthLayout
        │   └── ui/          # StatCard, DataTable, Modal, Button...
        ├── services/api.js  # All API calls (25 modules)
        ├── store/           # Zustand auth store
        └── locales/i18n.js  # EN + NE translations
```

---

## 🌐 Bilingual Support

- Toggle EN ⇄ नेपाली anywhere in the app
- All UI labels translated via `react-i18next`
- Devanagari script using Noto Sans Devanagari font
- Backend returns messages in user's language via `Accept-Language` header

## 📅 Dual Calendar (BS + AD)

- All dates stored as Gregorian (AD) in MySQL
- `NepaliDateService` converts on the fly
- Calendar page has BS/AD toggle
- BS dates shown in Devanagari numerals when in Nepali mode

## 💳 Nepal Payments

| Method       | Integration           |
|--------------|-----------------------|
| Cash         | Manual recording      |
| QR           | Nepal QR standard     |
| eSewa        | REST API + redirect   |
| Khalti       | REST API + redirect   |
| Bank Transfer| Manual + reference    |

---

## 🔐 Roles & Permissions

7 roles with granular permissions via Spatie Laravel Permission:
`super_admin` · `school_admin` · `teacher` · `accountant` · `hr_officer` · `librarian` · `student` · `parent`

---

## 📦 Key Dependencies

### Backend
- `laravel/sanctum` — API authentication
- `spatie/laravel-permission` — RBAC
- `barryvdh/laravel-dompdf` — PDF generation
- `maatwebsite/excel` — Excel exports
- `pusher/pusher-php-server` — Real-time

### Frontend
- `@tanstack/react-query` — Server state
- `zustand` — Client state
- `react-i18next` — Translations
- `framer-motion` — Animations
- `recharts` — Charts
- `react-hook-form` + `zod` — Forms

---

*EduNep — Built for Nepal's Education System 🇳🇵*
# EduNep
