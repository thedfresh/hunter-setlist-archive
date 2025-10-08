// Regenerate slugs for all events missing a slug
// Usage: node scripts/regenerate-event-slugs.js [--dry-run]

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function pad(n) {
  return String(n).padStart(2, '0');
}

function generateEventSlug(event) {
  // Build slug from year, month, day, showTiming
  let slug = '';
  if (event.year) {
    slug += event.year;
    if (event.month) {
      slug += '-' + pad(event.month);
      if (event.day) {
        slug += '-' + pad(event.day);
      } else {
        // Year and month only: yyyy-mm-xx
        slug += '-xx';
      }
    } else {
      // Year only: yyyy-xx-xx
      slug += '-xx-xx';
    }
    if (event.showTiming && (event.showTiming.toLowerCase() === 'early' || event.showTiming.toLowerCase() === 'late')) {
      slug += '-' + event.showTiming.toLowerCase();
    }
  } else {
    slug = 'unknown';
  }
  return slug;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const events = await prisma.event.findMany({ where: { slug: null } });
  let updatedCount = 0;
  for (const event of events) {
    const slug = generateEventSlug(event);
    // Ensure uniqueness
    let uniqueSlug = slug;
    let suffix = 2;
    while (await prisma.event.findFirst({ where: { slug: uniqueSlug, NOT: { id: event.id } } })) {
      uniqueSlug = `${slug}-${suffix++}`;
    }
    if (dryRun) {
      console.log(`[DRY RUN] Would update event ${event.id}: ${uniqueSlug}`);
    } else {
      await prisma.event.update({ where: { id: event.id }, data: { slug: uniqueSlug } });
      console.log(`Updated event ${event.id}: ${uniqueSlug}`);
      updatedCount++;
    }
  }
  console.log(`\n${dryRun ? 'Previewed' : 'Updated'} ${updatedCount} events.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
