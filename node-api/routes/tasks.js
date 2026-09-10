const express = require("express");
const db = require("../database");

const router = express.Router();

router.get("/", (req, res) => {
  const { status, priority, search } = req.query;
  let sql = "SELECT * FROM tasks WHERE 1=1";
  const params = [];

  if (status === "completed") {
    sql += " AND completed = 1";
  } else if (status === "pending") {
    sql += " AND completed = 0";
  }

  if (["low", "medium", "high"].includes(priority)) {
    sql += " AND priority = ?";
    params.push(priority);
  }

  if (search) {
    sql += " AND (title LIKE ? OR description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += " ORDER BY completed ASC, id DESC";

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post("/", (req, res) => {
  const { title, description = "", priority = "medium", due_date = null } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }

  if (!["low", "medium", "high"].includes(priority)) {
    return res.status(400).json({ error: "Invalid priority" });
  }

  const createdAt = new Date().toISOString();

  db.run(
    `INSERT INTO tasks (title, description, priority, due_date, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [title.trim(), description, priority, due_date, createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.get("SELECT * FROM tasks WHERE id = ?", [this.lastID], (getErr, row) => {
        if (getErr) return res.status(500).json({ error: getErr.message });
        res.status(201).json(row);
      });
    }
  );
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const { title, description = "", priority = "medium", due_date = null, completed = false } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }

  if (!["low", "medium", "high"].includes(priority)) {
    return res.status(400).json({ error: "Invalid priority" });
  }

  db.run(
    `UPDATE tasks
     SET title = ?, description = ?, priority = ?, due_date = ?, completed = ?
     WHERE id = ?`,
    [title.trim(), description, priority, due_date, completed ? 1 : 0, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Task not found" });

      db.get("SELECT * FROM tasks WHERE id = ?", [id], (getErr, row) => {
        if (getErr) return res.status(500).json({ error: getErr.message });
        res.json(row);
      });
    }
  );
});

router.patch("/:id/toggle", (req, res) => {
  const id = Number(req.params.id);

  db.run(
    `UPDATE tasks
     SET completed = CASE WHEN completed = 1 THEN 0 ELSE 1 END
     WHERE id = ?`,
    [id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Task not found" });

      db.get("SELECT * FROM tasks WHERE id = ?", [id], (getErr, row) => {
        if (getErr) return res.status(500).json({ error: getErr.message });
        res.json(row);
      });
    }
  );
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted" });
  });
});

router.get("/stats/summary", (req, res) => {
  db.get(
    `SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS completed,
      SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN priority = 'high' AND completed = 0 THEN 1 ELSE 0 END) AS high_priority
     FROM tasks`,
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        total: row.total || 0,
        completed: row.completed || 0,
        pending: row.pending || 0,
        high_priority: row.high_priority || 0
      });
    }
  );
});

module.exports = router;
