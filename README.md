# Community Feed 🚀

> **A high-performance community discussion platform with threaded conversations and gamified engagement.**

Built with **Django REST Framework**, **React + Vite**, **Tailwind CSS** — engineered for **performance**, **data integrity**, and **concurrency safety**.

![Django](https://img.shields.io/badge/Django-4.x-092E20?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/DRF-REST-ff1709?logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)

---

## 🔗 Live Demo

- **Frontend:** `https://community-feed-kappa.vercel.app/`
- **Backend API:** `https://community-feed-bhlj.onrender.com/`

---

## ✨ Features

### Core Functionality
- ✅ **Threaded Discussions** — Reddit-style nested comments (up to 5 levels)
- ✅ **Gamified Likes** — Post likes = +5 karma, Comment likes = +1 karma
- ✅ **Live Leaderboard** — Top 5 contributors (last 24 hours only)
- ✅ **Elegant UI** — Dark theme with gradient accents and smooth animations

### Technical Excellence
- ✅ **N+1 Query Elimination** — 3 queries for 50+ nested comments
- ✅ **Race Condition Safe** — Database constraints prevent double-liking
- ✅ **Dynamic Aggregation** — Leaderboard computed from transaction history

---


## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Django 4.2, DRF, SQLite|
| **Frontend** | React 18.2, Vite 5.0, Tailwind CSS 3.4 |
| **API Client** | Axios |
| **DevOps** | Docker, Render, Vercel |

---

## 📁 Project Structure

```
community-feed/
├── backend/
│   ├── config/              # Django settings
│   ├── feed/                # Main app (models, views, serializers)
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Post, CommentTree, Leaderboard
│   │   ├── pages/           # Feed
│   │   ├── services/        # API client
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── README.md
└── EXPLAINER.md
```

---

## ⚙️ Environment Variables

### Backend (`.env`)
```env
DEBUG=True
SECRET_KEY=your-django-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:8000/api
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 16+
- npm or yarn

### Option 1: Local Development

#### Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start server
python manage.py runserver
```
✅ Backend: **http://localhost:8000/api/**

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
✅ Frontend: **http://localhost:3000**

---

### Option 2: Docker (Recommended)

```bash
# Build and start all services
docker compose up --build
```

✅ Frontend: **http://localhost:3000**  
✅ Backend: **http://localhost:8000/api/**

**Stop containers:**
```bash
docker compose down
```

---

## 📡 API Documentation

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/posts/` | List all posts |
| `GET` | `/api/posts/{id}/` | Get post with comment tree |
| `POST` | `/api/posts/create/` | Create new post |
| `POST` | `/api/posts/{id}/like/` | Like post (+5 karma) |
| `POST` | `/api/posts/{id}/unlike/` | Remove like |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/posts/{id}/comments/` | Add comment |
| `POST` | `/api/comments/{id}/like/` | Like comment (+1 karma) |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/leaderboard/` | Top 5 users (24h karma) |

---

## 🎮 Gamification Rules

| Action | Karma Points |
|--------|--------------|
| Post receives a like | **+5 karma** to author |
| Comment receives a like | **+1 karma** to author |

**Leaderboard Rules:**
- Only karma earned in the **last 24 hours** counts
- Rolling window (not daily reset)
- Dynamic calculation from transaction history



## 📚 Documentation

- **[EXPLAINER.md](EXPLAINER.md)** — Technical deep-dive (comment tree, leaderboard query, AI audit)


## 👤 Author

**Paridhi Sharma**
- GitHub: [@Paridhisharmagithub](https://github.com/Paridhisharmagithub)
- Email: sparidhi161.ps@gmail.com

