import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useStore } from '../../data/StoreContext'
import { getDailySeries, getServiceBreakdown } from '../../data/store'

const PIE_COLORS = ['#CC0000', '#ff1a1a', '#990000', '#f26d6d', '#6b1111', '#ffb3b3', '#c95a5a']
const RANGES = [
  { days: 7, label: '7 days' },
  { days: 14, label: '14 days' },
  { days: 30, label: '30 days' },
]

export default function AdminHome() {
  const data = useStore()
  const [range, setRange] = useState(14)

  // Derived on every render rather than memoised: `data` is what makes this
  // component re-render, and both roll-ups read that same snapshot, so caching
  // on it would only risk showing stale numbers.
  const series = getDailySeries(range)
  const breakdown = getServiceBreakdown()

  const newEnquiries = data.enquiries.filter((e) => e.status === 'New').length
  const bookingCounts = {
    Pending: data.bookings.filter((b) => b.status === 'Pending').length,
    Scheduled: data.bookings.filter((b) => b.status === 'Scheduled').length,
    Completed: data.bookings.filter((b) => b.status === 'Completed').length,
  }
  const totalVisits = data.analytics.filter((e) => e.type === 'visit').length
  const rangeVisits = series.reduce((sum, d) => sum + d.visits, 0)

  return (
    <>
      <div className="page-head">
        <h1>Dashboard</h1>
        <p>Everything happening at VR Store, at a glance.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="ti ti-inbox" />
          </div>
          <div>
            <div className="stat-label">Enquiries</div>
            <div className="stat-value">{data.enquiries.length}</div>
            <div className="stat-sub">
              <span className="hot">{newEnquiries} new</span> awaiting reply
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="ti ti-calendar-event" />
          </div>
          <div>
            <div className="stat-label">AMC & Bookings</div>
            <div className="stat-value">{data.bookings.length}</div>
            <div className="stat-sub">
              {bookingCounts.Pending} pending · {bookingCounts.Scheduled} scheduled ·{' '}
              {bookingCounts.Completed} done
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="ti ti-list-details" />
          </div>
          <div>
            <div className="stat-label">Live Listings</div>
            <div className="stat-value">{data.services.length + data.brands.length}</div>
            <div className="stat-sub">
              {data.services.length} services · {data.brands.length} brands ·{' '}
              {data.amcPlans.length} AMC cards
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="ti ti-eye" />
          </div>
          <div>
            <div className="stat-label">Site Visits</div>
            <div className="stat-value">{totalVisits}</div>
            <div className="stat-sub">{rangeVisits} in the last {range} days</div>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Traffic & submissions</h2>
              <p>Page visits against enquiries and bookings received.</p>
            </div>
            <div className="tabs" style={{ margin: 0 }}>
              {RANGES.map((r) => (
                <button
                  key={r.days}
                  type="button"
                  className={`tab${range === r.days ? ' active' : ''}`}
                  onClick={() => setRange(r.days)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#666' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#666' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="visits" name="Visits" stroke="#CC0000" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="enquiries" name="Enquiries" stroke="#1a1a1a" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="bookings" name="Bookings" stroke="#ff8a8a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Most-requested service</h2>
              <p>Across enquiries and booking requests.</p>
            </div>
          </div>
          <div className="chart-box">
            {breakdown.length === 0 ? (
              <p className="empty-row">No enquiries or bookings yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={breakdown} dataKey="value" nameKey="name" outerRadius="72%" label>
                    {breakdown.map((entry, i) => (
                      <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Form submissions by day</h2>
            <p>Enquiries and booking requests over the last {range} days.</p>
          </div>
        </div>
        <div className="chart-box" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#666' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#666' }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="enquiries" name="Enquiries" fill="#CC0000" radius={[4, 4, 0, 0]} />
              <Bar dataKey="bookings" name="Bookings" fill="#ff8a8a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}
