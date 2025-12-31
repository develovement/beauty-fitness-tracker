# Beauty & Fitness Tracker

A mobile-first web application for tracking beauty and fitness routines, built with Node.js, Express, EJS, and Vanilla JavaScript.

## Features

### 1. Home Page (Beranda)
- Dynamic greeting based on time of day
- Circular progress indicator showing workout streak
- Quick access to start daily workout
- Statistics cards showing total workouts and weekly count
- Daily fitness tips

### 2. Calendar Page (Kalender)
- Interactive calendar showing current month
- Mark training days with localStorage persistence
- Navigate between months
- Visual indicators for today and completed training days
- Training streak tracking

### 3. Training Page (Latihan)
- 4 training sessions per day, 1 minute each
- Real-time camera preview (front-facing)
- Motion detection to ensure active exercise
- Automatic video recording every 10 seconds (3 videos per session)
- Session progress indicators
- Pause/resume functionality
- Videos automatically saved and marked for expert review

### 4. Photo Gallery (Foto)
- Document progress with photos
- Grid layout for easy viewing
- Camera integration for capturing photos
- localStorage persistence
- Empty state with call-to-action

### 5. Recording History (Rekaman)
- List of all recorded training videos
- Session and video number tracking
- Timestamps for each recording
- Status badges (sent to expert / waiting for review)
- Empty state with training prompt

## Technical Implementation

### Motion Detection
- Frame-difference algorithm for movement detection
- Configurable sensitivity levels
- Automatic pause when no motion detected
- Alert system to guide users

### Video Recording
- MediaRecorder API for capturing video
- 10-second intervals per recording
- Automatic chunking and blob creation
- Ready for Telegram Bot API integration
- Metadata tracking (session, timestamp, size)

### Data Storage
- **localStorage**: Primary storage for client-side data
- **Supabase**: Database for persistent storage and future features
  - workouts table
  - recordings table
  - photos table
  - training_dates table

### Camera Integration
- Front-facing camera access
- Mirror mode for natural viewing
- Fallback and error handling
- Permission management

## Technology Stack

- **Backend**: Node.js + Express
- **Views**: EJS templating
- **Frontend**: Vanilla JavaScript
- **Styling**: Tailwind CSS + Custom CSS
- **Icons**: Font Awesome 6
- **Database**: Supabase (PostgreSQL)
- **APIs**: MediaRecorder, getUserMedia, LocalStorage

## Project Structure

```
/public
  /css
    style.css              # Custom styles and mobile-first design
  /js
    app.js                 # Shared utilities and calendar logic
    timer.js               # Session management and video recording
    motion.js              # Motion detection algorithm
    supabase-client.js     # Supabase integration
/views
  home.ejs                 # Dashboard page
  latihan.ejs             # Training page
  kalender.ejs            # Calendar page
  foto.ejs                # Photo gallery
  rekaman.ejs             # Recording history
server.js                  # Express server
```

## Setup & Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open browser:
```
http://localhost:3000
```

## Usage

### Starting a Workout
1. Navigate to the Training page
2. Click "Mulai Latihan"
3. Allow camera access when prompted
4. Perform exercises for 1 minute per session
5. Videos are automatically recorded every 10 seconds
6. Complete all 4 sessions

### Marking Training Days
1. Go to Calendar page
2. Click "Tandai Hari Latihan"
3. Today will be marked as a completed training day
4. Streak counter updates automatically

### Taking Progress Photos
1. Visit the Photo Gallery page
2. Click "Ambil Foto"
3. Allow camera access
4. Take photo
5. Photo is saved locally

## Features in Detail

### Session Management
- 4 sessions total
- 1 minute per session
- 3 video recordings per session (10 seconds each)
- Progress indicators show current session
- Option to continue to next session or stop

### Motion Detection
- Checks for body movement every second
- Pauses timer if no motion detected
- Shows alert to guide user
- Previous recordings are preserved
- Resume after correcting position

### Data Persistence
All data is stored locally using localStorage:
- `workouts`: Array of completed workouts
- `workoutRecordings`: Array of video metadata
- `markedDates`: Array of training dates
- `photos`: Array of progress photos

Optional Supabase sync for cloud backup and multi-device access.

## Browser Compatibility

Requires modern browser with support for:
- MediaRecorder API
- getUserMedia API
- Canvas API
- localStorage
- ES6+ JavaScript

Recommended browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security & Privacy

- Camera access only when training starts
- All data stored locally by default
- Videos processed client-side
- No automatic upload without user consent
- Supabase integration with RLS policies

## Future Enhancements

- Telegram Bot integration for expert review
- User authentication
- Cloud video storage
- Exercise library with instructions
- Progress charts and analytics
- Social sharing features
- Push notifications for reminders

## Notes

- Motion detection uses frame difference algorithm (lightweight, no ML libraries)
- Video format: WebM with VP9 codec
- Camera defaults to front-facing (user-facing)
- All times are in local timezone
- Streak calculation based on consecutive days

## License

Private project - All rights reserved
