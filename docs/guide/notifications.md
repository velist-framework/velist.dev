# Real-time Notifications

Velist includes a complete real-time notification system using WebSocket. Notifications are persisted to the database and delivered instantly to connected users.

## Features

- **Real-time delivery** via WebSocket
- **Persistent storage** in SQLite database
- **4 notification types**: `info`, `success`, `warning`, `error`
- **Unread count badge** in navbar
- **Mark as read** / **delete** functionality
- **Mobile responsive** dropdown UI

## How It Works

```
┌─────────────┐     WebSocket      ┌─────────────┐
│   Browser   │◄──────────────────►│   Server    │
│  (AppLayout)│   ws/notifications │   (Bun)     │
└─────────────┘                    └──────┬──────┘
     │                                    │
     │                                    │ Send
     │                                    │ Notification
     │                              ┌─────▼─────┐
     └──────────────────────────────┤   SQLite  │
         Receive & Display          │ Database  │
                                    └───────────┘
```

## Usage

### Sending Notifications from Your Feature

Use the `sendNotification()` helper function from the notifications API:

```typescript
import { sendNotification } from '../notifications/api'

// In your API route handler
await sendNotification({
  userId: 'user-uuid-here',
  type: 'success',        // 'info' | 'success' | 'warning' | 'error'
  title: 'Invoice Paid',
  message: 'Customer John paid $500 for Invoice #123'
})
```

### Full Example in API Route

```typescript
import { createProtectedApi } from '../_core/auth/protected'
import { sendNotification } from '../notifications/api'

export const invoicesApi = createProtectedApi('/invoices')

  .post('/', async (ctx) => {
    const { body, inertia } = ctx
    
    // Create invoice logic...
    const invoice = await createInvoice(body)
    
    // Notify the user
    await sendNotification({
      userId: (ctx as any).user.sub,
      type: 'success',
      title: 'Invoice Created',
      message: `Invoice #${invoice.number} has been created successfully.`
    })
    
    return inertia.redirect('/invoices')
  })
```

## WebSocket Events

The AppLayout component automatically handles these WebSocket events:

| Event | Description |
|-------|-------------|
| `connected` | Initial connection, receives unread count |
| `notification` | New notification received |
| `markedAsRead` | Single notification marked as read |
| `markedAllAsRead` | All notifications marked as read |

## Client-Side Actions

Users can interact with notifications through the dropdown in the navbar:

```typescript
// Mark single notification as read
ws.send(JSON.stringify({
  action: 'markAsRead',
  notificationId: 'uuid'
}))

// Mark all as read
ws.send(JSON.stringify({
  action: 'markAllAsRead'
}))

// Ping to keep connection alive
ws.send(JSON.stringify({ action: 'ping' }))
```

## Database Schema

```typescript
// Table: notifications
{
  id: string           // UUID v7
  user_id: string      // FK to users
  type: string         // info | success | warning | error
  title: string
  message: string
  read_at: string|null // null = unread
  created_at: string
}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | View all notifications page |
| GET | `/notifications/recent` | Get recent notifications (dropdown) |
| PUT | `/notifications/:id/read` | Mark notification as read |
| PUT | `/notifications/read-all` | Mark all as read |
| DELETE | `/notifications/:id` | Delete notification |

## Demo

The dashboard includes a demo section where you can test sending notifications to yourself:

1. Go to `/dashboard`
2. Scroll to "Real-time Notification Demo" section
3. Click any "Send" button
4. Watch the bell icon in the navbar update instantly!

## Cleanup

Notifications older than 90 days are automatically cleaned up. You can manually trigger cleanup:

```typescript
import { notificationService } from '../notifications/notificationService'

await notificationService.cleanup()
```

## Best Practices

1. **Keep messages concise** - Title: max 50 chars, Message: max 200 chars
2. **Use appropriate types**:
   - `success` - Completed actions (payment received, saved)
   - `info` - General updates (new feature, reminder)
   - `warning` - Attention needed (storage full, expiring soon)
   - `error` - Something failed (sync failed, payment error)
3. **Don't over-notify** - Too many notifications = user ignores them
4. **Include actionable context** - "Invoice #123 paid" not just "Payment received"

## Troubleshooting

### WebSocket not connecting?
- Check browser console for errors
- Ensure `ws://` (dev) or `wss://` (prod) protocol matches your setup
- Verify JWT token is valid (try logging out/in)

### Notifications not showing?
- Check database: `SELECT * FROM notifications WHERE user_id = '...'`
- Verify WebSocket is connected (green dot in bell icon)
- Check browser Network tab for WS connection

### Performance with many notifications?
- Only last 20 notifications shown in dropdown
- Full history at `/notifications` page
- Auto-cleanup removes 90+ day old notifications
