# Notification System Design

# Stage 1

## APIs

### Get Notifications

GET /notifications

### Get Notification By ID

GET /notifications/:id

### Create Notification

POST /notifications

Request

```json
{
  "type": "Placement",
  "message": "Amazon Hiring"
}
```

### Mark Notification As Read

PATCH /notifications/:id/read

### Delete Notification

DELETE /notifications/:id

### Get Unread Notifications

GET /notifications/unread

## Real-Time Notifications

WebSocket based communication.

Flow:

Client → WebSocket Server → Notification Broadcast

---

# Stage 2

## Database

PostgreSQL

### Students

```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);
```

### Notifications

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    notification_type VARCHAR(20),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Student Notifications

```sql
CREATE TABLE student_notifications (
    student_id INT,
    notification_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    PRIMARY KEY(student_id, notification_id)
);
```

### Scaling Challenges

- Large notification volume
- Slow reads
- Expensive sorting

### Solutions

- Indexing
- Partitioning
- Read Replicas
- Redis Cache

---

# Stage 3

### Existing Query

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt DESC;
```

### Issue

The query performs expensive scans and sorting when notification volume increases.

### Index

```sql
CREATE INDEX idx_student_read_created
ON notifications(studentID, isRead, createdAt DESC);
```

### Placement Notifications In Last 7 Days

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= NOW() - INTERVAL '7 days';
```

### Indexing Every Column

Not recommended because it increases storage requirements and slows inserts and updates.

---

# Stage 4

## Performance Improvements

- Redis Cache
- Pagination
- WebSockets
- Read Replicas
- Lazy Loading

## Tradeoffs

- Additional infrastructure
- Cache maintenance
- Increased memory usage
- Replication overhead

---

# Stage 5

## Issues

- Sequential execution
- Slow processing
- No retry mechanism
- Failure handling problems

## Improved Design

Notification Service

↓

Database

↓

Message Queue (Kafka/RabbitMQ)

↓

Worker Services

↓

Email + Push Notifications

## Failure Handling

- Retry Queue
- Dead Letter Queue
- Event Reprocessing

## Pseudocode

```python
def notify_all(student_ids, message):

    notification_id = save_to_db(message)

    publish_event(
        notification_id,
        student_ids
    )

worker():

    event = consume_event()

    send_email(event)

    send_push_notification(event)
```
