(function (window) {
    const CONFIG = {
        endpoint: 'http://localhost:3000/api/events',
        batchInterval: 2000, // 2 seconds
    };

    class Pixel {
        constructor() {
            this.queue = [];
            this.sessionId = this.getSessionId();
            this.init();
        }

        getSessionId() {
            let sid = sessionStorage.getItem('pixel_session_id');
            if (!sid) {
                sid = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now();
                sessionStorage.setItem('pixel_session_id', sid);
            }
            return sid;
        }

        init() {
            // Track pageview on load
            this.track('pageview');

            // Track clicks
            document.addEventListener('click', (e) => {
                this.track('click', {
                    target: e.target.tagName,
                    id: e.target.id,
                    text: e.target.innerText ? e.target.innerText.substring(0, 50) : ''
                });
            });

            // Flush periodically
            setInterval(() => this.flush(), CONFIG.batchInterval);

            // Flush on unload
            window.addEventListener('beforeunload', () => this.flush());
        }

        track(eventType, metadata = {}) {
            const event = {
                session_id: this.sessionId,
                event_type: eventType,
                url: window.location.href,
                referrer: document.referrer,
                timestamp: new Date().toISOString(),
                metadata: metadata
            };
            this.queue.push(event);
            console.log('Event queued:', event);
        }

        flush() {
            if (this.queue.length === 0) return;

            const eventsToSend = [...this.queue];
            this.queue = [];

            fetch(CONFIG.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventsToSend),
                keepalive: true // Ensure request completes even if page unloads
            }).catch(err => {
                console.error('Failed to send events', err);
                // Optional: retry logic or put back in queue
                // this.queue = [...eventsToSend, ...this.queue];
            });
        }
    }

    // Expose to window
    window.gravity = new Pixel();

})(window);
