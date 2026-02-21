import 'dotenv/config';
import { Pool } from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const pool = new Pool({
    connectionString: process.env.DATABASE_CONNECTION_STRING,
});

async function ensureMigrationsTable(): Promise<void> {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            filename VARCHAR(255) NOT NULL UNIQUE,
            executed_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
    `);
}

async function getExecutedMigrations(): Promise<string[]> {
    const result = await pool.query('SELECT filename FROM migrations ORDER BY id');
    return result.rows.map((row) => row.filename);
}

async function markMigrationAsExecuted(filename: string): Promise<void> {
    await pool.query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
}

async function executeMigration(filePath: string, filename: string): Promise<void> {
    console.log(`Executing migration: ${filename}`);
    const sql = readFileSync(filePath, 'utf-8');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(sql);
        await markMigrationAsExecuted(filename);
        await client.query('COMMIT');
        console.log(`✓ Successfully executed: ${filename}`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`✗ Failed to execute: ${filename}`, error);
        throw error;
    } finally {
        client.release();
    }
}

export async function runMigrations(): Promise<void> {
    try {
        console.log('Starting migration process...');
        await ensureMigrationsTable();

        const migrationsDir = join(__dirname, '.');
        const files = readdirSync(migrationsDir)
            .filter((file) => file.endsWith('.sql'))
            .sort();

        if (files.length === 0) {
            console.log('No migration files found.');
            return;
        }

        const executedMigrations = await getExecutedMigrations();

        let executedCount = 0;
        for (const file of files) {
            if (executedMigrations.includes(file)) {
                console.log(`⊘ Skipping already executed: ${file}`);
                continue;
            }
            await executeMigration(join(migrationsDir, file), file);
            executedCount++;
        }

        if (executedCount === 0) {
            console.log('All migrations are up to date.');
        } else {
            console.log(`\n✓ Migration process completed. ${executedCount} migration(s) executed.`);
        }
    } finally {
        await pool.end();
    }
}
