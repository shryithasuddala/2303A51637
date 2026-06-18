## Vehicle Scheduler Backend

# Stage 1

## Core Actions

1. Create Notification
2. Get Notifications
3. Get Unread Notifications
4. Mark Notification as Read
5. Mark All Notifications as Read
6. Delete Notification
7. Real-time Notification Delivery

## API Design

### Create Notification

POST /api/notifications

Request:

```json
{
  "studentId": 1042,
  "type": "Placement",
  "message": "CSX Corporation hiring"
}
```

Response:

```json
{
  "id": "uuid",
  "status": "created"
}
```

### Get Notifications

GET /api/notifications?studentId=1042

Response:

```json
{
  "notifications": []
}
```

### Get Unread Notifications

GET /api/notifications/unread?studentId=1042

Response:

```json
{
  "notifications": []
}
```

### Mark Notification Read

PATCH /api/notifications/{id}/read

Response:

```json
{
  "status": "success"
}
```

### Mark All Notifications Read

PATCH /api/notifications/read-all

Response:

```json
{
  "status": "success"
}
```

### Delete Notification

DELETE /api/notifications/{id}

Response:

```json
{
  "status": "deleted"
}
```

## Real-Time Notifications

Use WebSockets.

Flow:

Student Login
→ WebSocket Connection
→ Notification Generated
→ Push Notification to Connected Client
→ UI Updates Instantly

# Stage 2

## Database Choice

MongoDB

### Why MongoDB?

- High write throughput
- Flexible schema
- Suitable for notification data
- Easy horizontal scaling

## Notification Schema

```json
{
  "_id": "ObjectId",
  "studentId": 1042,
  "notificationType": "Placement",
  "message": "CSX Corporation hiring",
  "isRead": false,
  "createdAt": "timestamp"
}
```

## Problems at Scale

1. Slow unread notification queries
2. Large notification collections
3. High write traffic

## Solutions

1. Indexing
2. Sharding
3. Archiving old notifications

## Queries

Get Student Notifications

```javascript
db.notifications.find({
  studentId: 1042,
});
```

Unread Notifications

```javascript
db.notifications.find({
  studentId: 1042,
  isRead: false,
});
```

# Stage 3

## Query Analysis

Query:

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt DESC;
```

### Why Slow?

Without indexes:

- Full table scan
- Sorting cost increases with millions of records

Complexity:

O(N)

## Recommended Index

```sql
CREATE INDEX idx_notifications
ON notifications(studentID,isRead,createdAt DESC);
```

### Why Not Index Every Column?

Problems:

- Increased storage
- Slower inserts
- Higher maintenance cost

Index only frequently queried columns.

## Placement Notifications in Last 7 Days

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE notificationType='Placement'
AND createdAt >= NOW() - INTERVAL '7 DAY';
```
# Stage 4

## Performance Improvements

### Redis Cache

Store unread notifications in cache.

Benefits:

- Faster reads
- Reduced DB load

### Pagination

Instead of loading all notifications:

```http
GET /notifications?page=1&limit=20
```

### Lazy Loading

Load notifications only when needed.

### WebSockets

Push notifications instantly.

## Tradeoffs

Redis:
+ Fast
- Extra infrastructure

Pagination:
+ Less data transfer
- Additional API logic

WebSockets:
+ Real-time updates
- Persistent connections

# Stage 5

## Problems in Existing Design

1. Sequential processing
2. Slow execution
3. No retry mechanism
4. Partial failures
5. Not scalable

## Improved Design

Use Queue-Based Architecture.

Flow:

HR
→ Notification Service
→ Message Queue
→ Workers
→ Email Service
→ Push Service

## Failure Handling

If email fails:

- Retry automatically
- Dead Letter Queue for failed jobs

## Why Save to DB First?

Database becomes source of truth.

Notification is never lost.

## Improved Pseudocode

```python
def notify_all(student_ids, message):

    notification_id = save_to_db(message)

    for student_id in student_ids:

        queue.publish({
            "notification_id": notification_id,
            "student_id": student_id
        })

worker():
    consume()
    send_email()
    push_notification()
```