import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./bot_logs.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    user_id TEXT NOT NULL,
    reason TEXT,
    timestamp INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS points (
    user_id TEXT PRIMARY KEY,
    total INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS strikes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    overruled INTEGER DEFAULT 0,
    removal_reason TEXT,
    timestamp INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS modnotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    moderator TEXT NOT NULL,
    note TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS quarantine (
    user_id TEXT PRIMARY KEY,
    previous_roles TEXT NOT NULL
  )`);
});

export async function logAction(
  action: string, 
  userId: string, 
  reason?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO logs (action, user_id, reason, timestamp) VALUES (?, ?, ?, ?)',
      [action, userId, reason || '', Date.now()],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

export function getLogs(): Promise<{
  action: string;
  user_id: string;
  reason?: string;
  timestamp: number;
}[]> {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT action, user_id, reason, timestamp FROM logs ORDER BY timestamp DESC',
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows as {
          action: string;
          user_id: string;
          reason?: string;
          timestamp: number;
        }[]);
      }
    );
  });
}

export function updatePoints(userId: string, delta: number): Promise<number> {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT total FROM points WHERE user_id = ?',
      [userId],
      (err, row: { total: number } | undefined) => {
        if (err) return reject(err);
        const current = row ? row.total : 0;
        const newTotal = current + delta;
        db.run(
          'REPLACE INTO points (user_id, total) VALUES (?, ?)',
          [userId, newTotal],
          (err2) => {
            if (err2) return reject(err2);
            resolve(newTotal);
          }
        );
      }
    );
  });
}

export function removeStrike(userId: string, reason: string): Promise<{ message: string }> {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE strikes SET overruled = 1, removal_reason = ? WHERE user_id = ? AND overruled = 0 LIMIT 1',
      [reason, userId],
      function (err) {
        if (err) return reject(err);
        resolve({ message: `Strike overruled; ${this.changes || 0} strike(s) affected.` });
      }
    );
  });
}

export function clearQuarantineRecord(userId: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT previous_roles FROM quarantine WHERE user_id = ?',
      [userId],
      (err, row: { previous_roles: string } | undefined) => {
        if (err) return reject(err);
        if (row) {
          db.run('DELETE FROM quarantine WHERE user_id = ?', [userId], (err2) => {
            if (err2) return reject(err2);
            resolve(row.previous_roles.split(','));
          });
        } else {
          resolve([]);
        }
      }
    );
  });
}

export function addModNote(userId: string, note: string, moderator: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO modnotes (user_id, moderator, note, timestamp) VALUES (?, ?, ?, ?)',
      [userId, moderator, note, Date.now()],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

export function getModNotes(userId: string): Promise<{ note: string; moderator: string; timestamp: number }[]> {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT note, moderator, timestamp FROM modnotes WHERE user_id = ?',
      [userId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows as { note: string; moderator: string; timestamp: number }[]);
      }
    );
  });
}