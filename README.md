# CollabBoard — Full Stack Real-time Project Management

A production-ready Kanban board with real-time collaboration, JWT auth, RBAC, Socket.io, bcrypt, and MongoDB Atlas.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![React](https://img.shields.io/badge/Frontend-React-blue)

---

## 🎥 Demo

**Live Demo:** [https://collabboard-realtime-nwpq.onrender.com](https://collabboard-realtime-nwpq.onrender.com)

**Test Account:** 
- Email: `admin@gmail.com`
- Password: `Admin@123`

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, React Router v6 |
| Drag & Drop | @hello-pangea/dnd |
| Real-time | Socket.io (client + server) |
| HTTP client | Axios |
| Backend | Node.js, Express |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Access Control | Role-based (Admin / Manager / Developer) |
| Database | MongoDB Atlas (Mongoose) |
| Env vars | dotenv |
| Notifications | react-hot-toast |
| Icons | lucide-react |

---

## 🎯 Key Highlights

✅ **Real-time Collaboration** — Socket.io room-based broadcasting for instant card sync across all connected users  
✅ **Role-Based Access Control (RBAC)** — 3 roles (Admin/Manager/Developer) with middleware-enforced permissions on 12+ endpoints  
✅ **Optimistic UI + Server Reconciliation** — Drag-and-drop with instant client feedback, no blocking on server updates  
✅ **Secure Authentication** — JWT (7-day expiry) + bcrypt password hashing (12 salt rounds)  
✅ **MongoDB Relational Data** — Mongoose with populated references (User → Project → Board → Card)  
✅ **Production Deployment** — Docker containerized, deployed on Render, environment-based configuration  
✅ **Error Handling & UX** — Session expiry detection, auto-redirect, toast notifications, form validation  
✅ **Scalable Architecture** — Modular folder structure, separated concerns (routes, middleware, models, socket handlers)

---

## Folder Structure

```
collabboard/
├── server/
│   ├── config/
│   │   └── db.js                  # MongoDB Atlas connection
│   ├── middleware/
│   │   └── auth.js                # JWT protect + RBAC authorize
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Board.js
│   │   └── Card.js
│   ├── routes/
│   │   ├── auth.routes.js         # register, login, /me
│   │   ├── project.routes.js      # CRUD projects + boards
│   │   └── card.routes.js         # CRUD cards + reorder
│   ├── socket/
│   │   └── boardSocket.js         # All Socket.io event handlers
│   ├── .env                       # ← fill in your secrets
│   ├── index.js                   # Entry point
│   └── package.json
│
└── client/
    ├── src/
    │   ├── context/
    │   │   ├── AuthContext.jsx     # Global user + token state
    │   │   └── SocketContext.jsx   # Global socket connection
    │   ├── hooks/
    │   │   └── useBoard.js        # Cards state + socket sync
    │   ├── services/
    │   │   └── api.js             # Axios instance + all API calls
    │   ├── pages/
    │   │   ├── AuthPage.jsx       # Login + Register
    │   │   ├── DashboardPage.jsx  # All projects
    │   │   └── ProjectPage.jsx    # Single project + boards
    │   ├── components/
    │   │   ├── Board/
    │   │   │   ├── KanbanBoard.jsx    # DragDropContext
    │   │   │   ├── KanbanColumn.jsx   # Droppable column
    │   │   │   └── KanbanCard.jsx     # Draggable card
    │   │   ├── Layout/
    │   │   │   └── Navbar.jsx
    │   │   └── UI/
    │   │       └── ProtectedRoute.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose (optional)
- MongoDB Atlas account

### Option 1: Quick Start with Docker (Recommended)

```bash
# Backend + MongoDB (in one command)
docker-compose up

# Frontend (in another terminal)
cd client
npm run dev
```

Visit: http://localhost:5173

### Option 2: Manual Setup

**Step 1: MongoDB Atlas**
1. Go to https://cloud.mongodb.com → Create free cluster
2. Create a database user (username + password)
3. Whitelist your IP (or use 0.0.0.0/0 for dev)
4. Copy the connection string

**Step 2: Server Setup**

```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/collabboard?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_minimum_32_chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev    # starts with nodemon on port 5000
```

**Step 3: Client Setup**

```bash
cd client
npm install
npm run dev    # starts on port 5173
```

Visit: http://localhost:5173

### Roles on First Login
- Register as **Admin** to create projects
- Register as **Manager** to manage cards
- Register as **Developer** to create and view cards

---

## RBAC Permissions

| Action | Admin | Manager | Developer |
|--------|-------|---------|-----------|
| Create/delete projects | ✅ | ❌ | ❌ |
| Create boards | ✅ | ✅ | ❌ |
| Create cards | ✅ | ✅ | ✅ |
| Edit any card | ✅ | ✅ | ❌ |
| Delete cards | ✅ | ✅ | ❌ |
| Assign cards | ✅ | ✅ | ❌ |

---

## Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `board:join` | client → server | Join a board room |
| `board:leave` | client → server | Leave a board room |
| `card:move` | client → server | Card dragged to new column |
| `card:moved` | server → clients | Broadcast move to others |
| `card:update` | client → server | Card content updated |
| `card:updated` | server → clients | Broadcast update to others |
| `card:created` | client → server | New card created |
| `card:deleted` | client → server | Card deleted |
| `cards:reordered` | client → server | Bulk reorder after drag |
| `user:joined` | server → clients | User joined the board |
| `user:left` | server → clients | User disconnected |

---

## API Endpoints

### Auth
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Protected |

### Projects
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/projects` | Protected |
| POST | `/api/projects` | Admin only |
| GET | `/api/projects/:id` | Protected |
| DELETE | `/api/projects/:id` | Admin only |
| GET | `/api/projects/:id/boards/:boardId/cards` | Protected |

### Cards
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/cards` | Protected |
| PATCH | `/api/cards/:id` | Protected |
| DELETE | `/api/cards/:id` | Admin / Manager |
| PATCH | `/api/cards/reorder/bulk` | Protected |

---

## 🔐 Security

- Passwords hashed using bcrypt
- JWT stored securely on client
- Environment variables protected via .env
- Sensitive data excluded via .gitignore

---

## 📌 Future Improvements

- Add unit & integration tests
- Implement notifications (email / in-app)
- Add file attachments to cards
- Improve mobile responsiveness

---

## 🐳 Production Deployment

### Docker Build

**Build image:**
```bash
docker build -t collabboard .
```

**Run with environment file:**
```bash
docker run -p 5000:5000 --env-file .env.production collabboard
```

Or pass variables directly:
```bash
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/collabboard \
  -e JWT_SECRET=your_secret_key \
  -e JWT_EXPIRES_IN=7d \
  -e CLIENT_URL=https://your-domain.com \
  collabboard
```

### Deploy to Render.com

1. Push code to GitHub
2. Create new service on [Render.com](https://render.com)
3. Connect your GitHub repository
4. Set environment variables:
   ```
   NODE_ENV=production
   MONGO_URI=<your_mongodb_uri>
   JWT_SECRET=<32_char_secret>
   JWT_EXPIRES_IN=7d
   CLIENT_URL=<your_render_url>
   PORT=5000
   ```
5. Deploy!

The app automatically serves:
- React frontend from `/`
- API endpoints from `/api/*`
- Static files with proper caching

---

## 👨‍💻 Author

- Nancy  
- GitHub: https://github.com/nancysangani