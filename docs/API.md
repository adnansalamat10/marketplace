# 🔌 API Endpoints Reference

Base URL: `http://localhost:4000`

## 👤 Auth `/api/auth`
| Method | Endpoint             | Auth  | Description          |
|--------|---------------------|-------|----------------------|
| POST   | /register           | ❌    | Create account       |
| POST   | /login              | ❌    | Login + JWT          |
| POST   | /refresh            | ❌    | Refresh access token |
| GET    | /google             | ❌    | Google OAuth         |
| GET    | /facebook           | ❌    | Facebook OAuth       |
| POST   | /2fa/enable         | ✅    | Enable 2FA           |
| POST   | /2fa/confirm        | ✅    | Confirm 2FA setup    |

## 👥 Users `/api/users`
| Method | Endpoint             | Auth  | Description          |
|--------|---------------------|-------|----------------------|
| GET    | /me                 | ✅    | Current user profile |
| PATCH  | /me                 | ✅    | Update profile       |
| POST   | /kyc                | ✅    | Submit KYC docs      |
| GET    | /:id                | ❌    | Public profile       |
| GET    | /:id/reviews        | ❌    | Seller reviews       |

## 🛒 Products `/api/products`
| Method | Endpoint             | Auth  | Description          |
|--------|---------------------|-------|----------------------|
| GET    | /                   | ❌    | Search & filter      |
| POST   | /                   | ✅    | Create listing       |
| GET    | /:id                | ❌    | Product details      |
| PATCH  | /:id                | ✅    | Update listing       |
| DELETE | /:id                | ✅    | Delete listing       |
| GET    | /featured           | ❌    | Featured products    |
| GET    | /categories         | ❌    | All categories       |

## 📦 Orders `/api/orders`
| Method | Endpoint             | Auth  | Description          |
|--------|---------------------|-------|----------------------|
| POST   | /                   | ✅    | Create order         |
| GET    | /                   | ✅    | My orders (buyer)    |
| GET    | /selling            | ✅    | My orders (seller)   |
| GET    | /:id                | ✅    | Order details        |
| POST   | /:id/deliver        | ✅    | Mark as delivered    |
| POST   | /:id/confirm        | ✅    | Confirm receipt      |
| POST   | /:id/dispute        | ✅    | Open dispute         |
| POST   | /:id/review         | ✅    | Leave review         |

## 💳 Payments `/api/payments`
| Method | Endpoint               | Auth  | Description          |
|--------|------------------------|-------|----------------------|
| POST   | /stripe/checkout       | ✅    | Create Stripe session|
| POST   | /stripe/webhook        | ❌    | Stripe webhook       |
| POST   | /paypal/order          | ✅    | Create PayPal order  |
| POST   | /paypal/capture        | ✅    | Capture PayPal       |
| POST   | /wallet/topup          | ✅    | Top up wallet        |
| POST   | /wallet/pay            | ✅    | Pay with wallet      |
| GET    | /wallet/balance        | ✅    | Wallet balance       |
| GET    | /transactions          | ✅    | Transaction history  |
| POST   | /escrow/:orderId/release | ✅  | Release escrow       |

## 💬 Chat `/api/chat`
| Method | Endpoint             | Auth  | Description          |
|--------|---------------------|-------|----------------------|
| GET    | /rooms              | ✅    | My chat rooms        |
| GET    | /rooms/:id/messages | ✅    | Message history      |

## 🔔 Notifications `/api/notifications`
| Method | Endpoint             | Auth  | Description          |
|--------|---------------------|-------|----------------------|
| GET    | /                   | ✅    | All notifications    |
| PATCH  | /:id/read           | ✅    | Mark as read         |
| PATCH  | /read-all           | ✅    | Mark all as read     |

## ⚙️ Admin `/api/admin`
| Method | Endpoint               | Auth  | Description          |
|--------|------------------------|-------|----------------------|
| GET    | /users                 | ADMIN | List all users       |
| PATCH  | /users/:id/ban         | ADMIN | Ban user             |
| PATCH  | /users/:id/kyc         | ADMIN | Approve/reject KYC   |
| GET    | /products              | ADMIN | All products         |
| PATCH  | /products/:id/approve  | ADMIN | Approve product      |
| GET    | /orders                | ADMIN | All orders           |
| GET    | /disputes              | ADMIN | All disputes         |
| PATCH  | /disputes/:id/resolve  | ADMIN | Resolve dispute      |
| GET    | /analytics             | ADMIN | Dashboard stats      |
| GET    | /analytics/revenue     | ADMIN | Revenue chart        |

---

## WebSocket Events (Socket.io)
### Client → Server
- `join_room` { roomId }
- `send_message` { roomId, content, type }
- `typing` { roomId }
- `get_history` { roomId, page }

### Server → Client
- `new_message` { id, roomId, senderId, content, createdAt }
- `user_typing` { userId }
- `notification` { type, title, body, data }
- `order_update` { orderId, status }
