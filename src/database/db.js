const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const dbPath = path.resolve(
  process.env.DB_PATH || './data/noamani.sqlite'
);

fs.mkdirSync(path.dirname(dbPath), {
  recursive: true
});

const db = new DatabaseSync(dbPath);

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  language TEXT DEFAULT 'ps',
  referrer_id TEXT,
  state TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  amount REAL NOT NULL CHECK(amount > 0),
  currency TEXT NOT NULL,
  note TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS approvals (
  request_id INTEGER NOT NULL,
  admin_id TEXT NOT NULL,
  decision TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(request_id, admin_id),
  FOREIGN KEY(request_id) REFERENCES requests(id)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`);

const defaults = db.prepare(
  'INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)'
);

defaults.run('MIN_AFN', process.env.MIN_AFN || '300');
defaults.run('MIN_USDT', process.env.MIN_USDT || '5');

function registerUser(user, referrerId = null) {
  const id = String(user.id);

  const ref =
    referrerId && String(referrerId) !== id
      ? String(referrerId)
      : null;

  db.prepare(`
    INSERT OR IGNORE INTO users
    (user_id,username,first_name,referrer_id)
    VALUES(?,?,?,?)
  `).run(
    id,
    user.username || null,
    user.first_name || '',
    ref
  );

  db.prepare(`
    UPDATE users
    SET username=?, first_name=?
    WHERE user_id=?
  `).run(
    user.username || null,
    user.first_name || '',
    id
  );
}

function getUser(id) {
  return db.prepare(
    'SELECT * FROM users WHERE user_id=?'
  ).get(String(id));
}

function setLanguage(id, language) {
  db.prepare(
    'UPDATE users SET language=? WHERE user_id=?'
  ).run(language, String(id));
}

function setState(id, state) {
  db.prepare(
    'UPDATE users SET state=? WHERE user_id=?'
  ).run(state, String(id));
}

function getState(id) {
  return db.prepare(
    'SELECT state FROM users WHERE user_id=?'
  ).get(String(id))?.state || null;
}

function createRequest(userId, kind, amount, currency, note) {
  const result = db.prepare(`
    INSERT INTO requests
    (user_id,kind,amount,currency,note)
    VALUES(?,?,?,?,?)
  `).run(
    String(userId),
    kind,
    amount,
    currency,
    note || null
  );

  return Number(result.lastInsertRowid);
}

function getHistory(userId) {
  return db.prepare(`
    SELECT * FROM requests
    WHERE user_id=?
    ORDER BY id DESC LIMIT 10
  `).all(String(userId));
}

function getPending() {
  return db.prepare(`
    SELECT r.*,u.username,u.first_name
    FROM requests r
    JOIN users u ON u.user_id=r.user_id
    WHERE r.status='PENDING'
    ORDER BY r.id DESC LIMIT 30
  `).all();
}

function getRequest(id) {
  return db.prepare(`
    SELECT r.*,u.language
    FROM requests r
    JOIN users u ON u.user_id=r.user_id
    WHERE r.id=?
  `).get(Number(id));
}

function getStats() {
  return db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM users) AS users,
      (SELECT COUNT(*) FROM requests) AS requests,
      (SELECT COUNT(*) FROM requests
        WHERE status='PENDING') AS pending,
      (SELECT COUNT(*) FROM requests
        WHERE status='APPROVED') AS approved,
      (SELECT COUNT(*) FROM requests
        WHERE status='REJECTED') AS rejected
  `).get();
}

function getMinimum(currency) {
  const key = currency === 'USDT'
    ? 'MIN_USDT'
    : 'MIN_AFN';

  const row = db.prepare(
    'SELECT value FROM settings WHERE key=?'
  ).get(key);

  return Number(row?.value || 300);
}

function setMinimum(currency, amount) {
  const key = currency === 'USDT'
    ? 'MIN_USDT'
    : 'MIN_AFN';

  db.prepare(`
    INSERT INTO settings(key,value)
    VALUES(?,?)
    ON CONFLICT(key)
    DO UPDATE SET value=excluded.value
  `).run(key, String(amount));
}

function addDecision(requestId, adminId, decision, adminIds) {
  db.exec('BEGIN IMMEDIATE');

  try {
    const request = getRequest(requestId);

    if (!request || request.status !== 'PENDING') {
      db.exec('ROLLBACK');
      return { error: 'NOT_PENDING' };
    }

    if (!adminIds.includes(String(adminId))) {
      db.exec('ROLLBACK');
      return { error: 'NOT_ADMIN' };
    }

    const existing = db.prepare(`
      SELECT * FROM approvals
      WHERE request_id=? AND admin_id=?
    `).get(Number(requestId), String(adminId));

    if (existing) {
      db.exec('ROLLBACK');
      return { error: 'ALREADY_VOTED' };
    }

    db.prepare(`
      INSERT INTO approvals
      (request_id,admin_id,decision)
      VALUES(?,?,?)
    `).run(
      Number(requestId),
      String(adminId),
      decision
    );

    const votes = db.prepare(`
      SELECT * FROM approvals WHERE request_id=?
    `).all(Number(requestId));

    if (votes.length < 2) {
      db.exec('COMMIT');
      return { status: 'WAITING' };
    }

    const status = votes.every(
      vote => vote.decision === 'APPROVE'
    ) ? 'APPROVED' : 'REJECTED';

    db.prepare(`
      UPDATE requests
      SET status=?
      WHERE id=? AND status='PENDING'
    `).run(status, Number(requestId));

    db.exec('COMMIT');

    return { status };

  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

module.exports = {
  registerUser,
  getUser,
  setLanguage,
  setState,
  getState,
  createRequest,
  getHistory,
  getPending,
  getRequest,
  getStats,
  getMinimum,
  setMinimum,
  addDecision
};
