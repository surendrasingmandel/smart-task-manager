# 🚀 Smart Task Manager

A full-stack portfolio project using **Node.js + Express + Python + FastAPI + SQLite**.

## Architecture

- **Node.js / Express**: REST API and frontend server
- **Python / FastAPI**: task urgency analysis service
- **SQLite**: lightweight database
- **Vanilla HTML/CSS/JS**: responsive frontend

## Features

- Create, complete and delete tasks
- Priority and due-date support
- Search and status filtering
- Dashboard statistics
- Python-powered urgency recommendation
- SQLite persistence
- Responsive UI
- GitHub-ready structure

## Requirements

- Node.js 18+
- Python 3.10+

## Run locally

### 1. Start Python service

```bash
cd python-service

python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload --port 8000
```

Python service runs at `http://127.0.0.1:8000`.

### 2. Start Node.js API

Open a second terminal:

```bash
cd node-api
npm install
npm start
```

Open:

`http://localhost:3000`

## API endpoints

### Node.js

- `GET /api/health`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `PATCH /api/tasks/:id/toggle`
- `DELETE /api/tasks/:id`
- `GET /api/tasks/stats/summary`

### Python

- `GET /health`
- `POST /analyze`

## How Python + Node.js work together

The browser sends a new task to the Python FastAPI service first.

Python calculates an urgency score using keywords and due-date information, then returns a recommended priority.

Node.js stores the final task in SQLite.

## Example Python request

```json
{
  "title": "Finish project deadline",
  "description": "Submit the project ASAP",
  "due_date": "2026-09-12"
}
```

## Example response

```json
{
  "recommended_priority": "high",
  "urgency_score": 100,
  "reasons": [
    "Urgent/important keyword detected",
    "Due within 2 days"
  ]
}
```

## GitHub

Create a new GitHub repository and upload the project files.

Do not upload:

- `node_modules`
- `tasks.db`
- `.venv`

These are already included in `.gitignore`.

## License

MIT
