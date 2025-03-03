import Database from "better-sqlite3";
import { join } from "path";
import fs from "fs";

// Ensure this is only run on the server
if (typeof window !== "undefined") {
  throw new Error("This module should only be imported on the server");
}

// Create the data directory if it doesn't exist
const dataDir = join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Get the database path
const dbPath = join(process.cwd(), "data", "sqlite.db");

// Initialize the database connection
export const sqlite = new Database(dbPath);

// Helper functions
export function initializeDatabase() {
  // Create projects table if it doesn't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT NOT NULL,
      uuid TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  console.log("✅ Database initialized successfully");
}

// Helper function to get all projects
export function getAllProjects() {
  return sqlite.prepare(`SELECT * FROM projects`).all();
}

// Helper function to get a project by ID
export function getProjectById(identifier: string) {
  try {
    // First try to find by UUID
    const byUuid = sqlite
      .prepare(
        `
      SELECT * FROM projects WHERE uuid = ?
    `
      )
      .get(identifier);

    if (byUuid) return byUuid;

    // If not found, try to find by ID
    return sqlite
      .prepare(
        `
      SELECT * FROM projects WHERE id = ?
    `
      )
      .get(identifier);
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

// Helper function to delete a project
export function deleteProject(uuid: string) {
  return sqlite.prepare(`DELETE FROM projects WHERE uuid = ?`).run(uuid);
}

// Helper function to delete multiple projects
export function deleteProjects(uuids: string[]) {
  // Use placeholders for each UUID
  const placeholders = uuids.map(() => "?").join(", ");
  return sqlite
    .prepare(`DELETE FROM projects WHERE uuid IN (${placeholders})`)
    .run(...uuids);
}

// Helper function to insert a project
export function insertProject(project: {
  id: string;
  uuid: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return sqlite
    .prepare(
      `INSERT INTO projects (id, uuid, name, description, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      project.id,
      project.uuid,
      project.name,
      project.description,
      project.createdAt.getTime(),
      project.updatedAt.getTime()
    );
}
