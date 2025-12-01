# Announcement Feature Documentation

## Overview
The announcement feature allows teachers and admins to create and broadcast announcements to students and other users in real-time. Students can view all announcements, mark them as read, and receive instant notifications when new announcements are created.

## Features

### 1. **Create Announcements** (Teachers & Admins Only)
- Only users with Teacher or Admin role can create announcements
- Announcements have:
  - Title (required)
  - Content (required)
  - Target audience: All, Students, or Teachers
  - Creation timestamp

### 2. **View Announcements**
- All users can view announcements via the dedicated Announcements page
- Announcements are displayed in reverse chronological order (newest first)
- Shows author information, timestamp, and target audience

### 3. **Real-time Notifications**
- Announcement icon appears in the top right of the header (mobile and desktop)
- Red dot indicator shows when there are unread announcements
- Socket.io integration provides instant updates to all connected users
- New announcements appear in the dropdown without page refresh

### 4. **Mark as Read**
- Users can mark announcements as read
- Read status is tracked in the database
- UI shows visual distinction between read and unread announcements

### 5. **Delete Announcements**
- Authors can delete their own announcements
- Admins can delete any announcement

## Technical Architecture

### Backend

#### Database Model (`server/models/Announcement.js`)
```javascript
{
  title: String,
  content: String,
  author: ObjectId (ref: User),
  target: String (enum: ['All', 'Student', 'Teacher', 'Admin']),
  readBy: [
    {
      userId: ObjectId,
      readAt: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

#### API Endpoints (`server/routes/announcementRoutes.js`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/announcements` | Get all announcements | Protected |
| GET | `/api/announcements/unread-count` | Get unread count | Protected |
| POST | `/api/announcements` | Create announcement | Faculty Only |
| PUT | `/api/announcements/read/:id` | Mark as read | Protected |
| PUT | `/api/announcements/:id` | Update announcement | Author/Admin |
| DELETE | `/api/announcements/:id` | Delete announcement | Author/Admin |

#### Controllers (`server/controllers/announcementController.js`)
- `createAnnouncement`: Create new announcement
- `getAnnouncements`: Fetch all announcements with read status
- `getUnreadCount`: Get count of unread announcements
- `markAsRead`: Mark announcement as read by current user
- `updateAnnouncement`: Update announcement details
- `deleteAnnouncement`: Delete announcement

#### Socket.io Events (`server/server.js`)
- `new-announcement`: Emit when announcement is created
- `announcement-read`: Emit when announcement is marked as read
- `announcement-created`: Listen for new announcements (client)

### Frontend

#### Components

**1. AnnouncementsDropdown (`components/AnnouncementsDropdown.tsx`)**
- Displays dropdown with recent announcements
- Shows unread count
- Mark as read functionality
- Real-time updates via Socket.io
- Accessible from top right icon in header

**2. AnnouncementsPage (`pages/AnnouncementsPage.tsx`)**
- Full page view of all announcements
- Create modal for teachers/admins
- Display all announcements with author info
- Delete functionality for own announcements
- Real-time updates

**3. Header Updates (`components/Header.tsx`)**
- Added announcement icon to both mobile and desktop headers
- Icon positioned in top right (before notifications)
- Red dot indicator for unread announcements
- Click to open announcements dropdown

#### API Client (`src/api/announcements.ts`)
```typescript
announcementsAPI.getAnnouncements()        // Get all
announcementsAPI.getUnreadCount()          // Get unread count
announcementsAPI.createAnnouncement(data)  // Create
announcementsAPI.markAsRead(id)            // Mark read
announcementsAPI.updateAnnouncement(id, data) // Update
announcementsAPI.deleteAnnouncement(id)    // Delete
```

#### Routes (`App.tsx`)
- `/announcements`: Main announcements page

## How to Use

### For Teachers/Admins:

1. **Create Announcement**:
   - Click the announcement icon in header (top right)
   - Click "New Announcement" button
   - Fill in title, content, and target audience
   - Click "Create"

2. **View Created Announcements**:
   - Go to `/announcements` page
   - See all announcements you've created

3. **Delete Announcement**:
   - Click "Delete" button on your announcement
   - Confirm deletion

### For Students:

1. **View Announcements**:
   - Click the announcement icon in header to see dropdown
   - Go to `/announcements` page for full view

2. **Mark as Read**:
   - Click on announcement in dropdown or page
   - Auto-marks as read

3. **Get Notifications**:
   - Red dot appears on announcement icon when new announcements arrive
   - New announcements appear instantly in dropdown

## Security

- **Authentication**: All endpoints require valid JWT token
- **Authorization**: Only teachers/admins can create announcements
- **Role-based Access**: Target audience filtering on frontend
- **Author Verification**: Only authors or admins can delete/update
- **Input Validation**: Title and content are required and validated

## Real-time Updates

The announcement system uses Socket.io for instant updates:

1. **Connection**: When user joins, they connect to Socket.io server
2. **Broadcast Creation**: When announcement created, emitted to all connected users
3. **Instant Display**: All users see new announcement immediately in dropdown
4. **No Page Refresh**: Updates happen without requiring page reload

## Future Enhancements

1. **Announcement Categories**: Add categorization (Academic, Events, etc.)
2. **Scheduled Announcements**: Schedule announcements for future dates
3. **Announcement Search**: Search announcements by keywords
4. **Announcement Filtering**: Filter by date, author, target audience
5. **Rich Text Editor**: Support for formatted content
6. **File Attachments**: Attach files/images to announcements
7. **Read Statistics**: Show percentage of users who read announcement
8. **Announcement Pins**: Pin important announcements to top
9. **Expiration Dates**: Set expiry date for announcements
10. **Email Notifications**: Send email with announcement content

## Troubleshooting

### Announcement Icon Not Showing
- Clear browser cache
- Ensure Header component imported correctly
- Check if ICONS.announcement is defined in constants.tsx

### Real-time Updates Not Working
- Verify Socket.io server is running
- Check browser console for Socket.io errors
- Ensure user is authenticated

### Unable to Create Announcement
- Verify user role is Teacher or Admin
- Check network tab for API errors
- Ensure required fields (title, content) are filled

### Read Status Not Updating
- Check browser console for errors
- Verify database connection
- Try refreshing page

## File Structure

```
/server
  /models
    - Announcement.js          # Mongoose schema
  /controllers
    - announcementController.js # Business logic
  /routes
    - announcementRoutes.js    # API endpoints

/Klians-App-main
  /components
    - AnnouncementsDropdown.tsx # Dropdown component
    - Header.tsx               # Updated with announcement icon
  /pages
    - AnnouncementsPage.tsx    # Main announcements page
  /src/api
    - announcements.ts         # API client
```

## Testing Checklist

- [ ] Create announcement as teacher
- [ ] Create announcement shows in dropdown immediately for all users
- [ ] Mark announcement as read updates status
- [ ] Delete button only visible to author/admin
- [ ] Target audience selector works
- [ ] Red dot shows when unread announcements exist
- [ ] Clicking announcement icon opens dropdown
- [ ] Page refresh shows persisted data
- [ ] Real-time updates work without page refresh
- [ ] Students cannot see "Create" button
- [ ] Teachers can create announcements
- [ ] Announcement content displays correctly
