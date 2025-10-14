import { prisma } from '@/lib/prisma';

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export async function GET() {
    const entries = await prisma.rssEntry.findMany({
        where: { isPublished: true },
        orderBy: { pubDate: 'desc' }
    });

    const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Robert Hunter Performance Archives Updates</title>
    <link>https://stillunsung.com</link>
    <description>New shows and features added to the Robert Hunter performance archive</description>
    <language>en-us</language>
    ${entries.map(entry => `
    <item>
      <title>${escapeXml(entry.title)}</title>
      <description>${escapeXml(entry.description)}</description>
      ${entry.link ? `<link>${escapeXml(entry.link)}</link>` : ''}
      <pubDate>${new Date(entry.pubDate).toUTCString()}</pubDate>
      <guid isPermaLink="false">rss-entry-${entry.id}</guid>
    </item>`).join('')}
  </channel>
</rss>`;

    return new Response(feedXml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600'
        }
    });
}
