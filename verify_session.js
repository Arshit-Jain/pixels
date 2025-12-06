// const fetch = require('node-fetch'); // Built-in in Node 18+
// Node 18+ has built-in fetch.

const ENDPOINT = 'http://localhost:3000/api/events';
const STATS_ENDPOINT = 'http://localhost:3000/api/stats';

const sessionId = 'test_session_' + Date.now();
const events = [
    {
        session_id: sessionId,
        event_type: 'pageview',
        url: 'http://localhost:3000/test.html',
        referrer: '',
        timestamp: new Date().toISOString(),
        metadata: {}
    },
    {
        session_id: sessionId,
        event_type: 'click',
        url: 'http://localhost:3000/test.html',
        referrer: '',
        timestamp: new Date(Date.now() + 5000).toISOString(), // 5 seconds later
        metadata: { target: 'BUTTON', id: 'btn-buy' }
    }
];

async function runTest() {
    try {
        console.log('Sending events...');
        const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'User-Agent': 'TestScript/1.0' },
            body: JSON.stringify(events)
        });

        if (!res.ok) {
            throw new Error(`Failed to send events: ${res.status} ${res.statusText}`);
        }
        console.log('Events sent successfully.');

        // Wait a bit for processing if needed (though it's synchronous in our code)

        console.log('Fetching stats...');
        const statsRes = await fetch(STATS_ENDPOINT);
        const stats = await statsRes.json();

        console.log('Stats:', stats);

        if (stats.total_sessions > 0) {
            console.log('SUCCESS: Sessions detected.');
        } else {
            console.error('FAILURE: No sessions detected.');
        }

    } catch (err) {
        console.error('Test failed:', err);
    }
}

runTest();
