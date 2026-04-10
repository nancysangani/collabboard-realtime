# CollabBoard — Full Stack Real-time Project Management

A production-ready Kanban board with real-time collaboration, JWT auth, RBAC, Socket.io, bcrypt, and MongoDB Atlas.

---

## 🎥 Demo

Live Demo: 

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, React Router v6 |
| Drag & Drop | @hello-pangea/dnd |
| Real-time | Socket.io (client + server) |
| HTTP client | Axios |
| Backend | Node.js, Express |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Access Control | Role-based (Admin / Manager / Developer) |
| Database | MongoDB Atlas (Mongoose) |
| Env vars | dotenv |
| Notifications | react-hot-toast |
| Icons | lucide-react |

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

## Quick Start

### 1. MongoDB Atlas Setup
1. Go to https://cloud.mongodb.com → Create free cluster
2. Create a database user (username + password)
3. Whitelist your IP (or use 0.0.0.0/0 for dev)
4. Copy the connection string

### 2. Server Setup

```bash
cd server
npm install
```

Edit `server/.env`:
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

### 3. Client Setup

```bash
cd client
npm install
```

`client/.env` is already set to:
```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev    # starts on port 5173
```

### 4. Open the app

Go to http://localhost:5173

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

## ✨ Features

- Built real-time Kanban board with Socket.io room-based broadcasting; card updates sync across all connected clients instantly
- Implemented JWT authentication with 7-day expiry and bcrypt password hashing (12 salt rounds)
- Designed role-based access control (Admin/Manager/Developer) enforced at middleware level across 12+ API endpoints
- Modeled relational data in MongoDB Atlas using Mongoose with populated references across User, Project, Board, and Card collections
- Built drag-and-drop with optimistic UI updates and server reconciliation to handle concurrent edits

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

## 🐳 Docker

```bash
docker-compose up --build
```

---

## 👨‍💻 Author

- Nancy  
- GitHub: https://github.com/nancysangani