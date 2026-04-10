# 🛒 Digital Marketplace Platform
> منصة بيع وشراء المنتجات الرقمية - شبيهة بـ Z2U

## 📁 هيكلة المشروع

```
marketplace/
├── frontend/                    # Next.js 14 (App Router)
│   └── src/
│       ├── app/
│       │   ├── (auth)/          # صفحات تسجيل الدخول
│       │   │   ├── login/
│       │   │   └── register/
│       │   ├── (dashboard)/     # لوحات التحكم
│       │   │   ├── buyer/
│       │   │   └── seller/
│       │   ├── products/        # صفحات المنتجات
│       │   ├── checkout/        # صفحة الدفع
│       │   ├── admin/           # لوحة الادمن
│       │   └── api/             # API Routes
│       ├── components/
│       │   ├── ui/              # مكونات UI الأساسية
│       │   ├── layout/          # Header, Footer, Sidebar
│       │   ├── product/         # ProductCard, ProductGrid
│       │   ├── payment/         # PaymentForm, WalletCard
│       │   └── chat/            # LiveChat component
│       ├── hooks/               # Custom React Hooks
│       ├── lib/                 # axios, socket, utils
│       ├── store/               # Zustand state management
│       └── types/               # TypeScript types
│
├── backend/                     # NestJS
│   └── src/
│       ├── modules/
│       │   ├── auth/            # JWT + OAuth + 2FA
│       │   ├── users/           # Users + KYC
│       │   ├── products/        # Products + Search
│       │   ├── orders/          # Orders + Escrow
│       │   ├── payments/        # Stripe + PayPal + Wallet
│       │   ├── chat/            # WebSocket Chat
│       │   ├── notifications/   # Email + Push
│       │   └── admin/           # Admin Panel APIs
│       ├── common/
│       │   ├── guards/          # AuthGuard, RolesGuard
│       │   ├── interceptors/    # Logging, Transform
│       │   ├── decorators/      # @Roles, @GetUser
│       │   └── pipes/           # ValidationPipe
│       ├── config/              # Database, JWT, Stripe configs
│       └── database/
│           ├── migrations/
│           └── seeds/
│
└── docs/
    ├── API.md
    └── DATABASE.md
```

## 🚀 تشغيل المشروع

### المتطلبات
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (اختياري)

### 1. تثبيت Backend
```bash
cd backend
npm install
cp .env.example .env
# عدّل ملف .env بمعلوماتك

# تشغيل Database migrations
npm run migration:run

# تشغيل Seeds
npm run seed

# تشغيل development
npm run start:dev
```

### 2. تثبيت Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# عدّل ملف .env.local

npm run dev
```

### 3. تشغيل بـ Docker
```bash
docker-compose up -d
```

### الروابط
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs (Swagger): http://localhost:4000/api/docs
- Admin Panel: http://localhost:3000/admin

---

## 🔑 متغيرات البيئة

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/marketplace

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Facebook OAuth
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...

# SendGrid
SENDGRID_API_KEY=...

# AWS S3
AWS_ACCESS_KEY=...
AWS_SECRET_KEY=...
AWS_BUCKET_NAME=marketplace-uploads
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_SOCKET_URL=ws://localhost:4000
```
