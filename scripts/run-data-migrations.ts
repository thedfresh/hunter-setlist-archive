import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    const migrationsDir = path.join(process.cwd(), 'prisma', 'data-migrations');

    await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS data_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT NOW()
    );
  `);

    const applied = await prisma.$queryRawUnsafe<Array<{ filename: string }>>(
        'SELECT filename FROM data_migrations ORDER BY filename'
    );
    const appliedSet = new Set(applied.map(m => m.filename));

    const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

    console.log(`Found ${files.length} migration files, ${appliedSet.size} already applied`);

    for (const file of files) {
        if (appliedSet.has(file)) {
            console.log(`✓ Skipping ${file} (already applied)`);
            continue;
        }

        console.log(`→ Running ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        try {
            await prisma.$transaction(async (tx) => {
                for (let i = 0; i < statements.length; i++) {
                    const stmt = statements[i];
                    try {
                        await tx.$executeRawUnsafe(stmt);
                    } catch (error) {
                        const lines = stmt.split('\n');
                        const preview = lines.slice(0, 2).join(' ');
                        console.error(`✗ Failed statement ${i + 1} in ${file}:`, preview);
                        throw error;
                    }
                }
            });

            await prisma.$executeRawUnsafe(
                `INSERT INTO data_migrations (filename) VALUES ($1)`,
                file
            );
            console.log(`✓ Applied ${file}`);
        } catch (error) {
            console.error(`✗ Failed ${file} - transaction rolled back, no changes committed`);
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