export default function AdminDashboard() {
  return (
    <div>
      {/* Quick Stats Card */}
      <div className="card p-6 mb-6">
        <h2 className="card-title mb-2">Quick Stats</h2>
        <p className="text-sm text-gray-600 mb-5">
          Overview of archive content
        </p>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <div className="text-3xl font-bold text-hunter-gold">617</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-hunter-gold">860</div>
            <div className="text-sm text-gray-600">Songs</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-hunter-gold">215</div>
            <div className="text-sm text-gray-600">Venues</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-hunter-gold">142</div>
            <div className="text-sm text-gray-600">Musicians</div>
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
              <tr>
                <td>2002-08-07</td>
                <td>Gallatin Gateway Inn</td>
                <td>Bozeman, MT</td>
                <td>Solo Hunter</td>
                <td>
                  <a href="/admin/events/1" className="btn btn-secondary btn-small">Edit</a>
                </td>
              </tr>
              <tr>
                <td>2001-11-16</td>
                <td>Great American Music Hall</td>
                <td>San Francisco, CA</td>
                <td>Solo Hunter</td>
                <td>
                  <a href="/admin/events/2" className="btn btn-secondary btn-small">Edit</a>
                </td>
              </tr>
              <tr>
                <td>1984-03-21</td>
                <td>Jonathan Swift's</td>
                <td>Cambridge, MA</td>
                <td>Dinosaurs</td>
                <td>
                  <a href="/admin/events/3" className="btn btn-secondary btn-small">Edit</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}