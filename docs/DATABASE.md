# 🗄️ Database Schema

## PostgreSQL Tables

### users
| Column            | Type         | Notes                          |
|-------------------|--------------|--------------------------------|
| id                | UUID PK      | Primary key                    |
| email             | VARCHAR UNIQUE | Indexed                      |
| password          | VARCHAR      | bcrypt hashed, select:false    |
| name              | VARCHAR      |                                |
| avatar            | VARCHAR      | S3 URL                         |
| role              | ENUM         | buyer / seller / admin         |
| is_verified       | BOOLEAN      | Email verified                 |
| is_banned         | BOOLEAN      |                                |
| two_factor_enabled| BOOLEAN      |                                |
| two_factor_secret | VARCHAR      | select:false                   |
| provider          | VARCHAR      | google / facebook              |
| provider_id       | VARCHAR      |                                |
| kyc_status        | ENUM         | pending / approved / rejected  |
| kyc_document_url  | VARCHAR      |                                |
| store_name        | VARCHAR      | Seller store name              |
| wallet_balance    | DECIMAL(10,2)| Internal wallet                |
| rating            | DECIMAL(3,2) | Average rating                 |
| total_reviews     | INT          |                                |
| total_sales       | INT          |                                |
| affiliate_code    | VARCHAR      | Unique referral code           |
| referred_by       | VARCHAR      | referrer user id               |
| created_at        | TIMESTAMP    |                                |
| updated_at        | TIMESTAMP    |                                |

### products
| Column            | Type         | Notes                          |
|-------------------|--------------|--------------------------------|
| id                | UUID PK      |                                |
| title             | VARCHAR      | Indexed (full-text)            |
| description       | TEXT         |                                |
| category          | ENUM         | accounts/game_currency/...     |
| sub_category      | VARCHAR      |                                |
| price             | DECIMAL(10,2)|                                |
| currency          | VARCHAR(3)   | USD, EUR, etc.                 |
| status            | ENUM         | active/inactive/pending        |
| images            | TEXT[]       | S3 URLs array                  |
| metadata          | JSONB        | Custom fields per category     |
| stock             | INT          |                                |
| total_sold        | INT          |                                |
| rating            | DECIMAL(3,2) |                                |
| total_reviews     | INT          |                                |
| is_featured       | BOOLEAN      |                                |
| tags              | TEXT[]       | Indexed                        |
| discount_percent  | DECIMAL(5,2) |                                |
| delivery_time     | VARCHAR      | "instant", "1-24h"            |
| seller_id         | UUID FK      | → users.id                     |
| created_at        | TIMESTAMP    |                                |

### orders
| Column              | Type         | Notes                        |
|---------------------|--------------|------------------------------|
| id                  | UUID PK      |                              |
| buyer_id            | UUID FK      | → users.id                   |
| seller_id           | UUID FK      | → users.id                   |
| product_id          | UUID FK      | → products.id                |
| amount              | DECIMAL(10,2)|                              |
| currency            | VARCHAR(3)   |                              |
| status              | ENUM         | pending/paid/delivered/...   |
| payment_method      | VARCHAR      | stripe/paypal/wallet         |
| payment_external_id | VARCHAR      | Stripe/PayPal order ID       |
| escrow_amount       | DECIMAL(10,2)| Held in escrow               |
| escrow_released_at  | TIMESTAMP    |                              |
| delivery_data       | JSONB        | Product delivery info        |
| buyer_confirmed     | BOOLEAN      |                              |
| dispute_id          | UUID FK      | → disputes.id                |
| paid_at             | TIMESTAMP    |                              |
| created_at          | TIMESTAMP    |                              |

### transactions
| Column      | Type         | Notes                          |
|-------------|--------------|--------------------------------|
| id          | UUID PK      |                                |
| user_id     | UUID FK      | → users.id                     |
| order_id    | UUID FK      | → orders.id (nullable)         |
| amount      | DECIMAL(10,2)| + credit / - debit             |
| type        | ENUM         | purchase/sale/topup/refund     |
| description | VARCHAR      |                                |
| created_at  | TIMESTAMP    |                                |

### reviews
| Column     | Type         | Notes                           |
|------------|--------------|---------------------------------|
| id         | UUID PK      |                                 |
| order_id   | UUID FK      | One review per order            |
| reviewer_id| UUID FK      | → users.id                      |
| product_id | UUID FK      | → products.id                   |
| seller_id  | UUID FK      | → users.id                      |
| rating     | INT          | 1-5                             |
| comment    | TEXT         |                                 |
| created_at | TIMESTAMP    |                                 |

### disputes
| Column     | Type         | Notes                           |
|------------|--------------|---------------------------------|
| id         | UUID PK      |                                 |
| order_id   | UUID FK      | → orders.id                     |
| opened_by  | UUID FK      | → users.id                      |
| reason     | TEXT         |                                 |
| status     | ENUM         | open/resolved/rejected          |
| resolution | TEXT         | Admin decision                  |
| resolved_by| UUID FK      | → users.id (admin)              |
| created_at | TIMESTAMP    |                                 |

### messages (Chat)
| Column     | Type         | Notes                           |
|------------|--------------|---------------------------------|
| id         | UUID PK      |                                 |
| room_id    | VARCHAR      | Indexed (orderid or "user1-user2") |
| sender_id  | UUID FK      | → users.id                      |
| content    | TEXT         |                                 |
| type       | ENUM         | text/image/file                 |
| is_read    | BOOLEAN      |                                 |
| created_at | TIMESTAMP    |                                 |

---

## Indexes
```sql
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_messages_room ON messages(room_id, created_at DESC);
CREATE INDEX idx_users_email ON users(email);
```
