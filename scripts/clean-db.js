const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'db', 'portfolio.db');
const walPath = path.join(__dirname, '..', 'db', 'portfolio.db-wal');
const shmPath = path.join(__dirname, '..', 'db', 'portfolio.db-shm');

function cleanDb() {
  if (!fs.existsSync(dbPath)) return;

  try {
    const db = new Database(dbPath);
    // TRUNCATE flushes all WAL pages into portfolio.db and truncates WAL to 0
    db.pragma('wal_checkpoint(TRUNCATE)');
    db.close();
  } catch (err) {
    console.error('Warning during checkpoint:', err.message);
  }

  // Ensure auxiliary files are cleanly removed
  for (const file of [walPath, shmPath]) {
    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
      } catch {
        // If locked by another active process, ignore
      }
    }
  }

  console.log('✅ Database checkpointed into portfolio.db (WAL and SHM cleaned).');
}

cleanDb();
