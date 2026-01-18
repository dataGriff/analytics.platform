# Chat App - Analytics Platform Demo

A real-time chat application demonstrating comprehensive analytics tracking using the channel-agnostic schema.

## Features

### Chat Functionality
- **Multiple Conversations**: Create and manage multiple chat conversations
- **Real-time Messaging**: Send messages and receive bot responses
- **Quick Actions**: Pre-defined quick action buttons for common interactions
- **Typing Indicators**: Visual feedback when the bot is responding
- **Message History**: Persistent conversation history

### Analytics Tracking
All user interactions are tracked and sent to the analytics platform:

- **Message Events**: User messages and bot responses
- **Session Events**: Conversation start/end, app load
- **Interaction Events**: Button clicks, quick actions, typing indicators
- **Navigation Events**: Conversation switching
- **Feedback Events**: User feedback and ratings

### UI Components

#### Main Chat Interface
- Conversation list sidebar
- Active chat area with message history
- Quick action buttons
- Message input with send button
- Real-time typing indicator

#### Analytics Panel
- Live message count
- Current conversation info
- Session duration tracker
- Recent events log
- Link to Grafana dashboard

## Running the Chat App

### Option 1: Direct File Access
Simply open `index.html` in your web browser:
```bash
open chat-app/index.html
```

### Option 2: Local Web Server
Using Python's built-in HTTP server:
```bash
cd chat-app
python3 -m http.server 8080
```
Then visit: http://localhost:8080

### Option 3: Docker (with full platform)
The chat app is included in the docker-compose setup:
```bash
docker compose up
```
Then visit: http://localhost:8082

## Analytics Integration

### Events Tracked

1. **App Load**
   - Tracks when the application loads
   - Captures referrer and load time

2. **Conversation Management**
   - New conversation creation
   - Conversation start/end
   - Conversation switching

3. **Messages**
   - User message sent (text, length)
   - Bot response (intent, confidence score)

4. **User Interactions**
   - Quick action button clicks
   - Typing start events
   - Custom button interactions

5. **Session Tracking**
   - Session ID generation
   - Device ID persistence
   - Session duration calculation

### Channel-Agnostic Schema

All events follow the standardized schema:
```javascript
{
    channel: 'chat',
    platform: 'web-desktop',
    event_type: 'message',
    event_category: 'engagement',
    resource_id: 'conv-123',
    resource_title: 'Conversation 1',
    interaction_target: 'user_message',
    session_id: 'session-xyz',
    device_id: 'device-abc',
    user_id: 'user-123',
    interaction_text: 'Hello bot!',
    timestamp: '2026-01-01T12:00:00.000Z',
    metadata: { ... }
}
```

## Architecture

### File Structure
```
chat-app/
├── index.html       # Main HTML structure
├── styles.css       # Complete styling
├── analytics.js     # Analytics tracking class
├── app.js          # Chat application logic
├── Dockerfile      # Docker configuration
└── README.md       # This file
```

### Classes

#### ChatAnalytics
Handles all analytics event tracking:
- Session management
- Event sending
- Event history
- Platform detection

#### ChatApp
Main application logic:
- Conversation management
- Message handling
- Bot responses
- UI updates

## Bot Responses

The demo includes a simple bot with intent recognition:

- **Help**: Provides information about the app
- **Status**: Shows system status
- **Feedback**: Handles feedback requests
- **Support**: Offers support information
- **Default**: General response for unrecognized inputs

## Viewing Analytics

### Grafana Dashboard
1. Start the full platform: `docker compose up`
2. Visit: http://localhost:3000
3. Login: admin/admin
4. Navigate to the Multi-Channel Analytics Dashboard
5. Filter by channel: `chat`

### Event Log
The analytics panel on the right shows:
- Recent events in real-time
- Session statistics
- Message counts
- Active conversation info

## Customization

### Adding New Bot Responses
Edit the `initBotResponses()` method in `app.js`:
```javascript
'custom': {
    text: "Your custom response",
    intent: 'custom_intent',
    confidence: 0.9
}
```

### Modifying Analytics Events
Extend the `ChatAnalytics` class in `analytics.js` with new tracking methods:
```javascript
async trackCustomEvent(conversationId, data) {
    return await this.sendEvent(
        conversationId,
        'custom_event',
        'custom_target',
        data,
        'user_action'
    );
}
```

### Styling
All styles are in `styles.css`. The app uses:
- CSS Grid for layout
- Flexbox for components
- CSS animations for smooth interactions
- Responsive design for mobile devices

## Integration with Analytics Platform

The chat app sends events to:
- **API Endpoint**: http://localhost:3001/analytics
- **Kafka Topic**: analytics-events
- **Bento Processing**: Real-time event processing
- **PostgreSQL Storage**: analytics_events table
- **Grafana Visualization**: Multi-channel dashboard

## Development

### Testing Event Tracking
Open browser console to see:
```
Chat analytics event sent: message
Chat analytics event sent: interaction
```

### Debugging
Check the analytics panel for:
- Recent events list
- Message counts
- Session info

### Local Storage
The app uses localStorage for:
- User ID persistence
- Device ID tracking
- Event history (last 10 events)

And sessionStorage for:
- Session ID (per browser session)

## Next Steps

1. **Enhance Bot Intelligence**: Add NLP or integrate with AI services
2. **Add File Sharing**: Track document and media uploads
3. **Implement Reactions**: Track emoji reactions to messages
4. **Add User Profiles**: Track user preferences and settings
5. **Real-time Collaboration**: Add multiple users chatting together
6. **Export Conversations**: Add conversation export functionality

## Troubleshooting

### Events not showing in Grafana
- Ensure docker-compose is running: `docker compose ps`
- Check analytics API: http://localhost:3001/health
- Verify Kafka is running: `docker compose logs kafka`

### Bot not responding
- Check browser console for errors
- Verify `analytics.js` and `app.js` are loaded
- Clear localStorage and refresh: `localStorage.clear()`

### Styling issues
- Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Clear browser cache
- Check that `styles.css` is loading

## License

Part of the Analytics Platform Demo - MIT License
