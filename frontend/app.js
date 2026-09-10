const API = "/api";
const PYTHON_URL = "http://127.0.0.1:8000";

const form = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const search = document.getElementById("search");
const statusFilter = document.getElementById("statusFilter");
const message = document.getElementById("message");

async function loadTasks() {
  const params = new URLSearchParams();
  if (statusFilter.value !== "all") params.set("status", statusFilter.value);
  if (search.value.trim()) params.set("search", search.value.trim());

  const res = await fetch(`${API}/tasks?${params}`);
  const tasks = await res.json();

  taskList.innerHTML = "";

  if (!tasks.length) {
    taskList.innerHTML = '<div class="empty">No tasks found.</div>';
  } else {
    tasks.forEach(renderTask);
  }

  loadStats();
}

async function loadStats() {
  const res = await fetch(`${API}/tasks/stats/summary`);
  const stats = await res.json();

  document.getElementById("total").textContent = stats.total;
  document.getElementById("pending").textContent = stats.pending;
  document.getElementById("completed").textContent = stats.completed;
  document.getElementById("highPriority").textContent = stats.high_priority;
}

function renderTask(task) {
  const div = document.createElement("div");
  div.className = `task ${task.completed ? "done" : ""}`;

  div.innerHTML = `
    <div>
      <div class="task-title">
        ${escapeHTML(task.title)}
        <span class="badge ${task.priority}">${task.priority}</span>
      </div>
      <div class="task-desc">${escapeHTML(task.description || "")}</div>
      <div class="meta">
        ${task.due_date ? `Due: ${task.due_date} · ` : ""}
        Created: ${new Date(task.created_at).toLocaleDateString()}
      </div>
    </div>
    <div class="actions">
      <button title="Toggle" onclick="toggleTask(${task.id})">
        ${task.completed ? "↩️" : "✓"}
      </button>
      <button title="Delete" class="delete" onclick="deleteTask(${task.id})">🗑️</button>
    </div>
  `;

  taskList.appendChild(div);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    priority: document.getElementById("priority").value,
    due_date: document.getElementById("dueDate").value || null
  };

  if (!payload.title) return;

  // Ask Python service for a smart recommendation.
  try {
    const aiRes = await fetch(`${PYTHON_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (aiRes.ok) {
      const analysis = await aiRes.json();
      if (payload.priority === "medium") {
        payload.priority = analysis.recommended_priority;
      }
      message.textContent =
        `Python analysis: ${analysis.recommended_priority} priority (score ${analysis.urgency_score}/100).`;
    }
  } catch {
    message.textContent = "Python analyzer is offline; using selected priority.";
  }

  const res = await fetch(`${API}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    message.textContent = "Could not create task.";
    return;
  }

  form.reset();
  document.getElementById("priority").value = "medium";
  loadTasks();
});

async function toggleTask(id) {
  await fetch(`${API}/tasks/${id}/toggle`, { method: "PATCH" });
  loadTasks();
}

async function deleteTask(id) {
  if (!confirm("Delete this task?")) return;

  await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
  loadTasks();
}

document.getElementById("refreshBtn").addEventListener("click", loadTasks);
statusFilter.addEventListener("change", loadTasks);

let searchTimer;
search.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadTasks, 250);
});

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

loadTasks();
