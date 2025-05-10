import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import Database from "better-sqlite3";
import { resolve } from "path";
import { v4 as uuidv4 } from "uuid";
import { join } from "path";
import fs from "fs";
import { eq } from "drizzle-orm";

// Ensure this is only run on the server
if (typeof window !== "undefined") {
  throw new Error("This module should only be imported on the server");
}

// Define Project type
export interface Project {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  requirements?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Get the database path
const DB_PATH = resolve(process.cwd(), "data/sqlite.db");
console.log("Using database at path:", DB_PATH);

// Check if database file exists before connecting
if (fs.existsSync(DB_PATH)) {
  const stats = fs.statSync(DB_PATH);
  console.log(`✅ Database file exists (${stats.size} bytes)`);
} else {
  console.log("⚠️ Database file doesn't exist, will be created");

  // Ensure the data directory exists
  const dataDir = join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`📁 Created data directory: ${dataDir}`);
  }
}

// Initialize the database connection
export const sqlite = new Database(DB_PATH);
export const db = drizzle(sqlite, { schema });

// For debugging - drop and recreate the table
export function resetDatabase() {
  try {
    console.log("🔄 Resetting database schema...");
    // Drop the existing table
    sqlite.exec(`DROP TABLE IF EXISTS projects`);
    console.log("✅ Dropped existing projects table");

    // Recreate the table with the correct schema
    sqlite.exec(`
      CREATE TABLE projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        requirements TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    console.log("✅ Recreated projects table");
    return true;
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    return false;
  }
}

// Uncomment the next line if you need to reset the database during development
// resetDatabase();

// Initialize the database schema
try {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  console.log("✅ Database schema initialized");
} catch (error) {
  console.error("❌ Error initializing database schema:", error);
}

// Helper function to convert snake_case keys to camelCase
function snakeToCamel(obj: Record<string, any>): Record<string, any> {
  if (!obj || typeof obj !== "object") {
    console.error("Expected an object in snakeToCamel, received:", obj);
    return {};
  }

  const newObj: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );
      newObj[camelKey] = obj[key];
    }
  }
  return newObj;
}

// Helper function to get all projects with proper camelCase property names
export async function getAllProjects(): Promise<Project[]> {
  try {
    // Use raw SQL to avoid issues with drizzle property mapping
    const projects = sqlite.prepare("SELECT * FROM projects").all() as any[];

    // Convert properties from snake_case to camelCase
    return projects.map((project) => snakeToCamel(project) as Project);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

// Helper function to get a single project by ID with proper camelCase property names
export async function getProjectById(
  id: number | string
): Promise<Project | null> {
  try {
    let project: any = null;

    console.log(`🔍 Looking up project with ID: "${id}"`);

    // Try to convert to number (for DB id lookups)
    if (typeof id === "string" && /^\d+$/.test(id)) {
      const projectId = parseInt(id, 10);
      project = sqlite
        .prepare("SELECT * FROM projects WHERE id = ?")
        .get(projectId);
    }

    // If not found by ID or not a numeric string, try UUID lookup
    if (!project && typeof id === "string") {
      project = sqlite.prepare("SELECT * FROM projects WHERE uuid = ?").get(id);
    }

    if (!project) {
      console.log(`❌ Project not found with ID: "${id}"`);
      return null;
    }

    console.log(`✅ Found project with id/uuid: "${id}"`);

    // Convert properties from snake_case to camelCase
    return snakeToCamel(project) as Project;
  } catch (error) {
    console.error(`Error fetching project with ID ${id}:`, error);
    return null;
  }
}

// Helper function to create a new project with proper database column names
export async function createProject(
  name: string,
  description: string = "",
  requirements: string = ""
): Promise<Project> {
  try {
    const uuid = uuidv4();
    const now = new Date().toISOString();

    // Use a statement without specifying id at all - let SQLite handle it
    sqlite
      .prepare(
        `
      INSERT INTO projects (uuid, name, description, requirements, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?)
    `
      )
      .run(uuid, name, description, requirements, now, now);

    // Fetch the inserted project by UUID (safer than relying on last_insert_rowid())
    const result = sqlite
      .prepare("SELECT * FROM projects WHERE uuid = ?")
      .get(uuid) as Record<string, any>;

    if (!result) {
      throw new Error("Failed to retrieve the created project");
    }

    console.log("✅ Project created:", result);

    // Convert properties from snake_case to camelCase
    return snakeToCamel(result) as Project;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}

// Insert a project - returns the inserted project
export function insertProject(
  name: string,
  description: string = "",
  requirements: string = ""
): Project {
  try {
    const uuid = uuidv4();
    const now = new Date().toISOString();

    const result = sqlite
      .prepare(
        "INSERT INTO projects (id, uuid, name, description, requirements, created_at, updated_at) VALUES (NULL, ?, ?, ?, ?, ?, ?) RETURNING *"
      )
      .get(uuid, name, description, requirements, now, now) as Record<
      string,
      any
    >;

    console.log(`✅ Inserted project: ${JSON.stringify(result)}`);

    return snakeToCamel(result) as Project;
  } catch (error) {
    console.error("❌ Error inserting project:", error);
    throw error;
  }
}

// Delete a project
export function deleteProject(uuid: string): boolean {
  try {
    const result = sqlite
      .prepare(`DELETE FROM projects WHERE uuid = ?`)
      .run(uuid);
    return result.changes > 0;
  } catch (error) {
    console.error("Error deleting project:", error);
    return false;
  }
}

// Delete multiple projects
export function deleteProjects(uuids: string[]): boolean {
  try {
    const placeholders = uuids.map(() => "?").join(", ");
    const result = sqlite
      .prepare(`DELETE FROM projects WHERE uuid IN (${placeholders})`)
      .run(...uuids);
    return result.changes > 0;
  } catch (error) {
    console.error("Error deleting multiple projects:", error);
    return false;
  }
}

/**
 * Updates the requirements document for a project
 * @param uuid The project UUID
 * @param requirements The markdown content for requirements
 * @returns Updated project or null if not found
 */
export async function updateProjectRequirements(
  uuid: string,
  requirements: string
): Promise<Project | null> {
  try {
    // First check if the project exists
    const project = await getProjectById(uuid);
    if (!project) {
      console.log(`❌ Project not found with UUID: "${uuid}"`);
      return null;
    }

    // Update the project requirements
    const updatedProject = await db
      .update(schema.projects)
      .set({
        requirements,
        updatedAt: new Date(),
      })
      .where(eq(schema.projects.uuid, uuid))
      .returning()
      .get();

    return snakeToCamel(updatedProject) as Project;
  } catch (error) {
    console.error(`Error updating project requirements:`, error);
    return null;
  }
}
