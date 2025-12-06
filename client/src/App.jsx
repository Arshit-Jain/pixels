import { useState, useEffect } from 'react'
import './index.css'

function App() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats')
        const data = await res.json()
        setStats(data)
      } catch (err) {
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 5000) // Refresh every 5s
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="loading">Loading analytics...</div>

  return (
    <div className="dashboard">
      <header>
        <h1>Pixel Analytics</h1>
        <p>Real-time tracking dashboard</p>
      </header>

      <div className="grid">
        <div className="card">
          <h3>Total Sessions</h3>
          <div className="value">{stats?.total_sessions || 0}</div>
        </div>
        <div className="card">
          <h3>Total Events</h3>
          <div className="value">{stats?.total_events || 0}</div>
        </div>
        <div className="card">
          <h3>Avg Duration</h3>
          <div className="value">{stats?.avg_session_duration?.toFixed(1) || 0}s</div>
        </div>
      </div>

      <div className="section">
        <h2>Top Pages</h2>
        {stats?.top_pages?.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>URL</th>
                <th>Views</th>
              </tr>
            </thead>
            <tbody>
              {stats.top_pages.map((p, i) => (
                <tr key={i}>
                  <td style={{ wordBreak: 'break-all' }}>{p.url}</td>
                  <td>{p.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No page view data yet.</p>
        )}
      </div>

      <div className="section">
        <h2>Top Click Targets</h2>
        {stats?.top_click_targets?.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Target</th>
                <th>Clicks</th>
              </tr>
            </thead>
            <tbody>
              {stats.top_click_targets.map((t, i) => (
                <tr key={i}>
                  <td>{t.target || 'Unknown'}</td>
                  <td>{t.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No click data yet.</p>
        )}
      </div>
    </div>
  )
}

export default App
