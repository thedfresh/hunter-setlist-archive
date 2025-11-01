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

        try {
            await prisma.$executeRawUnsafe(sql);
            await prisma.$executeRawUnsafe(
                `INSERT INTO data_migrations (filename) VALUES ($1)`,
                file
            );
            console.log(`✓ Applied ${file}`);
        } catch (error) {
            console.error(`✗ Failed to apply ${file}:`, error);
            throw error;
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
