import { prisma } from '@/lib/prisma';
import { formatEventDate } from '@/lib/formatters/dateFormatter';


export default async function AdminDashboard() {
  const [eventCount, songCount, venueCount, musicianCount, bandCount, contributorCount] = await Promise.all([
    prisma.event.count(),
    prisma.song.count(),
    prisma.venue.count(),
    prisma.musician.count(),
    prisma.band.count(),
    prisma.contributor.count(),
  ]);

  const recentEvents = await prisma.event.findMany({
    take: 20,
    orderBy: [
      { updatedAt: 'desc' }
    ],
    include: {
      venue: true,
      primaryBand: true
    }
  });

  return (
    <div>
      {/* Quick Stats Card */}
      <div className="card p-6 mb-6">
        <h2 className="card-title mb-2">Quick Stats</h2>
        <p className="text-sm text-gray-600 mb-5">
          Overview of archive content
        </p>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <div>
            <a href="/admin/events" className="block text-3xl font-bold text-hunter-gold hover:text-hunter-gold-dark transition">{eventCount}</a>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
          <div>
            <a href="/admin/songs" className="block text-3xl font-bold text-hunter-gold hover:text-hunter-gold-dark transition">{songCount}</a>
            <div className="text-sm text-gray-600">Songs</div>
          </div>
          <div>
            <a href="/admin/venues" className="block text-3xl font-bold text-hunter-gold hover:text-hunter-gold-dark transition">{venueCount}</a>
            <div className="text-sm text-gray-600">Venues</div>
          </div>
          <div>
            <a href="/admin/musicians" className="block text-3xl font-bold text-hunter-gold hover:text-hunter-gold-dark transition">{musicianCount}</a>
            <div className="text-sm text-gray-600">Musicians</div>
          </div>
          <div>
            <a href="/admin/bands" className="block text-3xl font-bold text-hunter-gold hover:text-hunter-gold-dark transition">{bandCount}</a>
            <div className="text-sm text-gray-600">Bands</div>
          </div>
          <div>
            <a href="/admin/contributors" className="block text-3xl font-bold text-hunter-gold hover:text-hunter-gold-dark transition">{contributorCount}</a>
            <div className="text-sm text-gray-600">Contributors</div>
          </div>
        </div>
      </div>

      {/* Recent Events Card */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title m-0">Recent Events</h2>
          <a href="/admin/events/new" className="btn btn-primary btn-medium">Add Event</a>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Venue</th>
                <th>City</th>
                <th>Performer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-6">No recent events found.</td>
                </tr>
              ) : (
                recentEvents.map((event: any) => {
                  const venueName = event.venue?.name || 'Unknown Venue';
                  const city = event.venue?.city || 'Unknown Location';
                  const state = event.venue?.stateProvince || '';
                  const performer = event.primaryBand?.name || 'Solo Hunter';
                  return (
                    <tr key={event.id}>
                      <td>{formatEventDate(event)}</td>
                      <td>{venueName}</td>
                      <td>{city}{state ? `, ${state}` : ''}</td>
                      <td>{performer}</td>
                      <td>
                        <a href={`/admin/events/${event.id}`} className="btn btn-secondary btn-small">Edit</a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}