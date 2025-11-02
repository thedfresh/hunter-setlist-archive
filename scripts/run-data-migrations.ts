import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    const migrationsDir = path.join(process.cwd(), 'prisma', 'data-migrations');

    // Ensure tracking table exists
    await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS data_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT NOW()
    );
  `);

    // Get already applied migrations
    const applied = await prisma.$queryRawUnsafe<Array<{ filename: string }>>(
        'SELECT filename FROM data_migrations ORDER BY filename'
    );
    const appliedSet = new Set(applied.map(m => m.filename));

    // Get all migration files
    const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

    console.log(`Found ${files.length} migration files, ${appliedSet.size} already applied`);

    // Run pending migrations
    for (const file of files) {
        if (appliedSet.has(file)) {
            console.log(`✓ Skipping ${file} (already applied)`);
            continue;
        }

        console.log(`→ Running ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

        // Split SQL file into statements by semicolon
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));  // Skip comment-only lines

        let allSucceeded = true;
        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            try {
                await prisma.$executeRawUnsafe(stmt);
            } catch (error) {
                allSucceeded = false;
                // Show partial statement and line number for debugging
                const lines = stmt.split('\n');
                const preview = lines.slice(0, 2).join(' ');
                console.error(`✗ Failed statement ${i + 1} in ${file}:`, preview);
                console.error(error);
                throw error;
            }
        }
        if (allSucceeded) {
            await prisma.$executeRawUnsafe(
                `INSERT INTO data_migrations (filename) VALUES ($1)`,
                file
            );
            console.log(`✓ Applied ${file}`);
        }
    }

    console.log('All data migrations complete!');
}

main()
    .catch(e => {
        console.error('Migration failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
