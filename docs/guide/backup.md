# Database Backup

Velist includes an automatic database backup system with WAL (Write-Ahead Logging) support. Backups are created as single SQLite files that can be easily restored or uploaded to S3-compatible storage.

## How It Works

### Automatic Backup (Default)

Backups are triggered automatically based on the configured interval:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Bun Cron  │────►│   Backup    │────►│   Local     │
│  (Interval) │     │   Service   │     │   Storage   │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                           ├────────────────────────────►
                           │                      ┌─────────────┐
                           │                      │     S3      │
                           │                      │  (Optional) │
                           │                      └─────────────┘
```

**Default schedule:** Every 10 minutes  
**Retention:** Keep last 10 backups (configurable)

### Backup Process

When backup runs (automatic or manual):

1. **WAL Checkpoint** - Merge WAL data into main database
   ```sql
   PRAGMA wal_checkpoint(TRUNCATE)
   ```

2. **Copy Database** - Copy `dev.sqlite` to backup folder

3. **Convert to Single-File** - Remove WAL mode from backup
   ```sql
   PRAGMA journal_mode=DELETE
   PRAGMA VACUUM
   ```

4. **Upload to S3** (optional) - Upload backup file to S3

5. **Cleanup** - Delete old backups beyond retention limit

### File Structure

With WAL mode enabled (running database):
```
db/
├── dev.sqlite        # Main database
├── dev.sqlite-wal    # Write-ahead log
└── dev.sqlite-shm    # Shared memory
```

Backup (single file, no WAL):
```
storage/backups/
├── backup-2024-01-15T10-30-00-000Z.sqlite
├── backup-2024-01-15T10-20-00-000Z.sqlite
└── backup-2024-01-15T10-10-00-000Z.sqlite
```

## Configuration

Add to your `.env` file:

```bash
# Enable/disable auto-backup
BACKUP_ENABLED=true

# Backup interval (minutes)
BACKUP_INTERVAL_MINUTES=10

# Number of backups to keep locally
BACKUP_RETENTION_COUNT=10

# Local backup path
BACKUP_LOCAL_PATH=./storage/backups

# S3 upload (optional)
BACKUP_S3_ENABLED=false
BACKUP_S3_PATH=backups/database
```

## Backup Triggers

### 1. Automatic Backup (Recommended)

Backups run automatically based on `BACKUP_INTERVAL_MINUTES`.

**When it starts:**
- Server startup (if `BACKUP_ENABLED=true`)
- Then every X minutes based on interval

**Example with 10-minute interval:**
```
10:00 - Server starts → First backup
10:10 - Auto backup
10:20 - Auto backup
10:30 - Auto backup
...
```

### 2. Manual Backup

Trigger backup anytime via UI or API:

```bash
# Via API
curl -X POST /backup/now
```

Or click **"Backup Now"** button in the backup management UI at `/backup`.

### 3. WebSocket Notification

After each backup completes, a notification is sent:

```typescript
// In your component (automatic)
// You'll receive notification via WebSocket
{
  event: 'notification',
  data: {
    type: 'success',
    title: 'Database Backup Complete',
    message: 'backup-2024-01-15T10-30-00-000Z.sqlite created (2.5 MB)'
  }
}
```

## Management UI

Access the backup dashboard at `/backup`:

### Features:
- **Stats Cards** - DB size, backup count, auto-backup status, S3 status
- **Backup Now** - Trigger manual backup
- **Configuration** - Adjust interval, retention, S3 settings
- **Backup History** - List, download, delete backups
- **Download** - Get backup file directly

### Screenshots:

```
┌─────────────────────────────────────────┐
│  Database Backup                        │
│  Auto-backup with WAL checkpoint        │
├─────────────────────────────────────────┤
│  DB Size: 15 MB    │  Local: 10         │
│  Auto: Every 10m   │  S3: Disabled      │
├─────────────────────────────────────────┤
│  [Backup Now]  [Configure]              │
├─────────────────────────────────────────┤
│  Backup History                         │
│  ┌─────────────────────────────────┐   │
│  │ 🗂️ backup-2024-01-15... 2.5 MB │   │
│  │    2.5 MB • Jan 15, 10:30 AM   │   │
│  │    [⬇️] [🗑️]                    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Restoring from Backup

### Manual Restore (Current Method)

⚠️ **Warning:** This replaces your current database. Make sure to backup first!

```bash
# 1. Stop the server
# 2. Backup current database (just in case)
cp db/dev.sqlite db/dev.sqlite.backup.$(date +%s)

# 3. Copy backup file
cp storage/backups/backup-2024-01-15T10-30-00-000Z.sqlite db/dev.sqlite

# 4. Start server
bun run dev
```

### Programmatic Restore (Coming Soon)

```typescript
// Planned feature
await backupService.restore('backup-2024-01-15T10-30-00-000Z.sqlite')
```

## S3 Upload

Enable S3 backup for offsite storage:

```bash
# .env
BACKUP_S3_ENABLED=true
BACKUP_S3_PATH=backups/database

# Storage config (existing)
STORAGE_DRIVER=s3
S3_BUCKET=my-backups
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.wasabisys.com
S3_ACCESS_KEY=xxx
S3_SECRET_KEY=xxx
```

Backups will be uploaded to:
```
s3://my-backups/backups/database/backup-2024-01-15T10-30-00-000Z.sqlite
```

## Best Practices

### For Development:
```bash
# Default settings are fine
BACKUP_ENABLED=true
BACKUP_INTERVAL_MINUTES=10
BACKUP_RETENTION_COUNT=10
```

### For Production:
```bash
# Less frequent, more retention, S3 enabled
BACKUP_ENABLED=true
BACKUP_INTERVAL_MINUTES=60          # Every hour
BACKUP_RETENTION_COUNT=48           # Keep 2 days locally
BACKUP_S3_ENABLED=true              # Upload to S3
BACKUP_S3_PATH=backups/production   # Organized path
```

### For Critical Data:
```bash
# Frequent backups, long retention
BACKUP_ENABLED=true
BACKUP_INTERVAL_MINUTES=5           # Every 5 minutes
BACKUP_RETENTION_COUNT=144          # Keep 12 hours locally
BACKUP_S3_ENABLED=true              # S3 for disaster recovery
```

## Troubleshooting

### Backup not running?

Check if enabled:
```bash
grep BACKUP_ENABLED .env
```

Check server logs:
```
[Backup] Auto-backup started. Interval: 10 minutes
[Backup] Success: backup-2024-01-15T10-30-00-000Z.sqlite (2.5 MB)
```

### S3 upload failing?

Check storage configuration:
```bash
grep STORAGE_DRIVER .env
grep S3_ .env
```

Test storage:
```typescript
import { createStorage } from '$features/_core/storage'

const storage = createStorage()
const url = storage.getPublicUrl('test.txt')
console.log(url)
```

### WAL files not merging?

Check WAL mode is enabled:
```sql
PRAGMA journal_mode;
-- Should return: wal
```

Force checkpoint manually:
```sql
PRAGMA wal_checkpoint(TRUNCATE);
```

## API Reference

### Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/backup` | Backup management UI |
| POST | `/backup/now` | Trigger manual backup |
| POST | `/backup/config` | Update configuration |
| DELETE | `/backup/:filename` | Delete backup |

### Service Methods

```typescript
import { backupService } from '$features/backup/service'

// Start auto-backup
backupService.start()

// Stop auto-backup
backupService.stop()

// Manual backup
const result = await backupService.performBackup(userId)
// { success: true, filename: '...', size: 2500000, s3Uploaded: true }

// Get backups
const backups = await backupService.getBackups()

// Update config
backupService.updateConfig({
  intervalMinutes: 30,
  s3Enabled: true
})
```

## See Also

- [Storage](./storage.md) - S3/local storage configuration
- [Notifications](./notifications.md) - Real-time backup notifications
- [Database](./database.md) - SQLite & WAL mode details
