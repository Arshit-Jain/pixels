# Pixel Tracking & Analytics Pipeline

A proof-of-concept analytics system with a client-side pixel, Node.js backend, and React dashboard.

## Architecture
- **Pixel**: Vanilla JS, batches events, handles session IDs.
- **Backend**: Node.js + Express.
- **Database**: PostgreSQL (Supabase).
- **Frontend**: React + Vite.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

2. **Configure Database**
   - Create a `.env` file in the root directory.
   - Add your Supabase connection string:
     ```
     DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
     ```

3. **Run the System**
   - **Backend**: `npm run dev` (Runs on port 3000)
   - **Frontend**: `cd client && npm run dev` (Runs on port 5173)

## Usage

1. **Test the Pixel**
   - Open `http://localhost:3000/test.html` in your browser.
   - Click the buttons to generate events.
   - Events are flushed every 2 seconds or on unload.

2. **View Analytics**
   - Open `http://localhost:5173` to view the dashboard.
   - You should see the session count and event stats update.

## API Endpoints
- `POST /api/events`: Ingest batched events.
- `GET /api/stats`: Retrieve analytics metrics.
