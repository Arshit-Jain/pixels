const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve pixel.js and test page

// Initialize Database Schema
const initDb = async () => {
    try {
        const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await db.query(schemaSql);
        console.log('Database schema initialized');
    } catch (err) {
        console.error('Error initializing database schema:', err);
    }
};

initDb();

// Ingestion API
app.post('/api/events', async (req, res) => {
    const events = req.body;
    const userAgent = req.headers['user-agent'];

    if (!Array.isArray(events)) {
        return res.status(400).json({ error: 'Invalid payload, expected array of events' });
    }

    try {
        for (const event of events) {
            const { session_id, event_type, url, referrer, timestamp, metadata } = event;

            // 1. Insert into events table
            await db.query(
                `INSERT INTO events (session_id, event_type, url, referrer, timestamp, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [session_id, event_type, url, referrer, timestamp, metadata]
            );

            // 2. Upsert into sessions table
            // We calculate duration dynamically on read, or update it here. 
            // For simplicity, we'll update start/end times and page_views.
            const isPageview = event_type === 'pageview' ? 1 : 0;

            await db.query(`
                INSERT INTO sessions (session_id, start_time, page_views, user_agent)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (session_id) DO UPDATE SET
                    end_time = EXCLUDED.start_time,
                    page_views = sessions.page_views + EXCLUDED.page_views,
                    user_agent = COALESCE(sessions.user_agent, EXCLUDED.user_agent)
                `, [session_id, timestamp, isPageview, userAgent]);
        }

        res.status(200).json({ message: 'Events ingested successfully' });
    } catch (err) {
        console.error('Error ingesting events:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Analytics API
app.get('/api/stats', async (req, res) => {
    try {
        // 1. Total Sessions (from sessions table)
        const totalSessionsResult = await db.query('SELECT COUNT(*) as count FROM sessions');

        // 2. Total Events (from events table)
        const totalEventsResult = await db.query('SELECT COUNT(*) as count FROM events');

        // 3. Most common click targets (from events table)
        const clickTargetsResult = await db.query(`
      SELECT metadata->>'target' as target, COUNT(*) as count 
      FROM events 
      WHERE event_type = 'click' 
      GROUP BY target 
      ORDER BY count DESC 
      LIMIT 5
    `);

        // 4. Average session duration (from sessions table)
        // Duration = end_time - start_time
        const avgDurationResult = await db.query(`
      SELECT AVG(EXTRACT(EPOCH FROM (end_time - start_time))) as avg_duration
      FROM sessions
      WHERE end_time IS NOT NULL AND start_time IS NOT NULL
    `);

        // 5. Top Pages (from events table)
        const topPagesResult = await db.query(`
      SELECT url, COUNT(*) as count
      FROM events
      WHERE event_type = 'pageview'
      GROUP BY url
      ORDER BY count DESC
      LIMIT 5
    `);

        res.json({
            total_sessions: parseInt(totalSessionsResult.rows[0].count),
            total_events: parseInt(totalEventsResult.rows[0].count),
            top_click_targets: clickTargetsResult.rows,
            top_pages: topPagesResult.rows,
            avg_session_duration: parseFloat(avgDurationResult.rows[0].avg_duration || 0)
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
