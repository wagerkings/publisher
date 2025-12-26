import Database from 'better-sqlite3';
import { getManifestPath } from './paths.js';

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    const dbPath = getManifestPath();
    db = new Database(dbPath);
    initializeSchema(db);
  }
  return db;
}

function initializeSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_path TEXT NOT NULL UNIQUE,
      source_hash TEXT NOT NULL,
      source_mtime INTEGER NOT NULL,
      model TEXT NOT NULL,
      last_processed_at INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'success'
    );

    CREATE TABLE IF NOT EXISTS outputs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_id INTEGER NOT NULL,
      social TEXT NOT NULL,
      type TEXT NOT NULL,
      output_path TEXT NOT NULL,
      output_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
      UNIQUE(file_id, social, type)
    );

    CREATE INDEX IF NOT EXISTS idx_files_source_path ON files(source_path);
    CREATE INDEX IF NOT EXISTS idx_files_model ON files(model);
    CREATE INDEX IF NOT EXISTS idx_outputs_file_id ON outputs(file_id);
  `);
}

export interface FileInfo {
  id: number;
  source_path: string;
  source_hash: string;
  source_mtime: number;
  model: string;
  last_processed_at: number;
  status: string;
}

export interface OutputInfo {
  id: number;
  file_id: number;
  social: string;
  type: string;
  output_path: string;
  output_hash: string;
  created_at: number;
}

export function getFileInfo(sourcePath: string): FileInfo | null {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM files WHERE source_path = ?');
  const row = stmt.get(sourcePath) as FileInfo | undefined;
  return row || null;
}

export function updateFile(
  sourcePath: string,
  sourceHash: string,
  sourceMtime: number,
  model: string,
  status: string = 'success'
): number {
  const database = getDb();
  const now = Date.now();

  const existing = getFileInfo(sourcePath);
  if (existing) {
    const stmt = database.prepare(`
      UPDATE files
      SET source_hash = ?, source_mtime = ?, last_processed_at = ?, status = ?
      WHERE id = ?
    `);
    stmt.run(sourceHash, sourceMtime, now, status, existing.id);
    return existing.id;
  } else {
    const stmt = database.prepare(`
      INSERT INTO files (source_path, source_hash, source_mtime, model, last_processed_at, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(sourcePath, sourceHash, sourceMtime, model, now, status);
    return Number(result.lastInsertRowid);
  }
}

export function getOutputs(fileId: number): OutputInfo[] {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM outputs WHERE file_id = ?');
  return stmt.all(fileId) as OutputInfo[];
}

export function recordOutput(
  fileId: number,
  social: string,
  type: string,
  outputPath: string,
  outputHash: string
): void {
  const database = getDb();
  const now = Date.now();

  const stmt = database.prepare(`
    INSERT OR REPLACE INTO outputs (file_id, social, type, output_path, output_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(fileId, social, type, outputPath, outputHash, now);
}

export function hasHashChanged(sourcePath: string, sourceHash: string): boolean {
  const fileInfo = getFileInfo(sourcePath);
  if (!fileInfo) {
    return true;
  }
  return fileInfo.source_hash !== sourceHash;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

