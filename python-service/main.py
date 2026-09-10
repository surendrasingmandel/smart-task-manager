from datetime import datetime, date
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Smart Task Analyzer", version="1.0.0")


class Task(BaseModel):
    title: str
    description: str = ""
    due_date: str | None = None


@app.get("/health")
def health():
    return {"status": "ok", "service": "python-analyzer"}


@app.post("/analyze")
def analyze(task: Task):
    text = f"{task.title} {task.description}".lower()
    score = 0
    reasons = []

    urgent_words = ["urgent", "asap", "deadline", "today", "important", "critical", "exam", "interview"]
    if any(word in text for word in urgent_words):
        score += 50
        reasons.append("Urgent/important keyword detected")

    if task.due_date:
        try:
            due = datetime.fromisoformat(task.due_date).date()
            days_left = (due - date.today()).days
            if days_left <= 0:
                score += 50
                reasons.append("Due today or overdue")
            elif days_left <= 2:
                score += 35
                reasons.append("Due within 2 days")
            elif days_left <= 7:
                score += 15
                reasons.append("Due within a week")
        except ValueError:
            reasons.append("Due date could not be parsed")

    if score >= 70:
        priority = "high"
    elif score >= 30:
        priority = "medium"
    else:
        priority = "low"

    return {
        "recommended_priority": priority,
        "urgency_score": min(score, 100),
        "reasons": reasons or ["No urgent signals detected"]
    }
