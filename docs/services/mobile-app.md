# Analytics Platform - Mobile Demo App

A simple React Native mobile app built with Expo to test the analytics platform integration.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (optional, can use npx)

### Installation

```bash
cd mobile-app
npm install
```

### Running the App

#### Option 1: Expo Go (Easiest)

1. Install Expo Go app on your iOS or Android device
2. Start the development server:
   ```bash
   npm start
   ```
3. Scan the QR code with:
   - iOS: Camera app
   - Android: Expo Go app

#### Option 2: iOS Simulator (Mac only)

```bash
npm run ios
```

#### Option 3: Android Emulator

```bash
npm run android
```

#### Option 4: Web Browser

```bash
npm run web
```

## 📱 Testing Analytics Integration

### Important: Configure API Endpoint

Before running the app, make sure to update the API endpoint in `App.js`:

```javascript
const [analytics] = useState(() => new Analytics('http://YOUR_IP:3001', '1.0.0'));
```

Replace `YOUR_IP` with:
- Your machine's local IP address (e.g., `192.168.1.100`)
- If using Expo Go on a physical device
- `localhost` works only for web/emulator on same machine

### Find Your IP Address

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

### Test Flow

1. Launch the app on your device/emulator
2. Tap the various action buttons:
   - Primary Action
   - Secondary Action
   - Success Action
   - Simulate Swipe Left
3. View the event log at the bottom of the screen
4. Check Grafana dashboard at http://localhost:3000 to see events processed
5. Check PostgreSQL for stored events

## 🎯 Features

- **Session Tracking**: Unique session ID per app launch
- **Device Identification**: Persistent device ID stored in AsyncStorage
- **Event Logging**: Local event history showing last 5 events
- **Multiple Event Types**: 
  - Button taps (interaction events)
  - Screen views (navigation events)
  - Gesture tracking (swipe events)
- **Device Information**: Shows platform, device model, and session details
- **Channel-Agnostic Schema**: Uses same event structure as website, agent, etc.

## 📊 Analytics Events

The app sends events to the analytics platform with the following structure:

```json
{
  "channel": "mobile",
  "platform": "ios" | "android",
  "event_type": "interaction" | "navigation" | "gesture",
  "event_category": "user_action" | "navigation" | "gesture",
  "resource_id": "Home",
  "interaction_target": "btn-primary-action",
  "session_id": "session-...",
  "device_id": "device-...",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "metadata": {
    "device_model": "iPhone 14",
    "os_version": "17.0",
    "app_version": "1.0.0"
  }
}
```

## 🔧 Troubleshooting

### Cannot Connect to Analytics API

1. Ensure docker containers are running:
   ```bash
   docker compose up
   ```

2. Check if analytics-api is accessible:
   ```bash
   curl http://localhost:3001/health
   ```

3. If using physical device with Expo Go:
   - Use your machine's IP address, not `localhost`
   - Ensure device is on same WiFi network
   - Check firewall settings

### Events Not Appearing in Grafana

1. Check analytics-api logs:
   ```bash
   docker logs analytics-api
   ```

2. Check Bento logs:
   ```bash
   docker logs bento
   ```

3. Query PostgreSQL directly:
   ```bash
   docker exec -it postgres psql -U analytics_user -d analytics_db -c "SELECT * FROM analytics_events WHERE channel='mobile' ORDER BY timestamp DESC LIMIT 5;"
   ```

## 📱 Building for Production

### iOS

```bash
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

(Requires Expo Application Services account)

## 🛠 Development

### Project Structure

```
mobile-app/
├── App.js              # Main app component
├── analytics.js        # Analytics SDK implementation
├── app.json           # Expo configuration
├── package.json       # Dependencies
└── README.md          # This file
```

### Customization

- Modify button actions in `App.js`
- Add new event types in `analytics.js`
- Customize styling in `App.js` StyleSheet
- Add new screens for navigation tracking

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Analytics Platform Schema](../schema.md)
