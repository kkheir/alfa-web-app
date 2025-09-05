# Admin Panel - Tabbed Interface

## Overview
The admin panel now features a modern tabbed interface with three main sections:
1. **Manage Users** - User account management
2. **Manage Data** - Excel import and data management  
3. **Panel Distribution** - Distribution scheduling and management

## Tab 1: Manage Users
- Create, edit, and delete user accounts
- Set admin permissions
- Change user passwords
- View user activity

## Tab 2: Manage Data
- **Excel File Upload**: Upload .xlsx or .xls files with employee data
- **Flexible Column Mapping**: Automatically maps columns based on header names
- **Data Validation**: Validates file format and data types
- **Editable Table**: View and edit imported data in a user-friendly table
- **Bulk Save**: Save multiple row edits with a single click
- **Data Management**: Clear all imported data when needed

## Tab 3: Panel Distribution
- **Create Distributions**: Schedule panel distributions to employees
- **Target Audiences**: Select specific groups (All Employees, Departments, Managers)
- **Status Management**: Track distribution status (Draft, Scheduled, Sent, Cancelled)
- **Recipient Tracking**: Automatic calculation of recipient counts
- **Distribution History**: View and manage all past and upcoming distributions

## Excel File Format (Data Tab)
The Excel file should have the following structure:

### Required Headers (case-insensitive, flexible naming):
- **Name**: Employee full name (e.g., "Name", "Full Name", "Employee Name")
- **Email**: Email address (e.g., "Email", "Email Address")
- **Phone**: Phone number (e.g., "Phone", "Phone Number", "Contact")
- **Department**: Department name (e.g., "Department", "Dept")
- **Position**: Job title (e.g., "Position", "Title", "Job Title")
- **Salary**: Salary amount as number (e.g., "Salary", "Wage")

### Sample Excel Structure:
```
| Name          | Email              | Phone        | Department | Position     | Salary |
|---------------|--------------------|--------------|-----------|--------------| -------|
| John Doe      | john@company.com   | 555-0123     | IT        | Developer    | 75000  |
| Jane Smith    | jane@company.com   | 555-0124     | HR        | Manager      | 85000  |
| Bob Johnson   | bob@company.com    | 555-0125     | Finance   | Analyst      | 65000  |
```

## How to Use

### Navigation
1. Navigate to the Admin Panel
2. Use the tab navigation at the top to switch between sections:
   - **Manage Users**: User account management
   - **Manage Data**: Excel import and data editing
   - **Panel Distribution**: Distribution management

### Manage Data Tab - Upload Excel File
1. Click on the "Manage Data" tab
2. Click "Choose Excel File" in the Import section
3. Select your .xlsx or .xls file
4. Wait for the upload and processing to complete

### Manage Data Tab - View and Edit Data
1. After successful import, data appears in the table below
2. Click on any cell to edit the value
3. Modified rows are highlighted in yellow
4. The "Save Changes" button shows the number of unsaved changes

### Manage Data Tab - Save Changes
1. Click the "Save Changes" button at the top of the table
2. All modified rows will be saved to the database
3. Success message will confirm the number of saved records

### Panel Distribution Tab - Create Distribution
1. Click on the "Panel Distribution" tab
2. Click "New Distribution" button
3. Fill in the distribution details:
   - Title and description
   - Target audience
   - Distribution date
   - Status
4. Click "Create Distribution" to save

### Panel Distribution Tab - Manage Distributions
1. View all distributions in the list
2. Click "Edit" to modify a distribution
3. Click "Delete" to remove a distribution
4. Status is automatically updated based on the distribution date

## API Endpoints

### User Management
- **GET/POST/PUT/DELETE /api/users** - User CRUD operations

### Data Management  
- **POST /api/import** - Uploads and processes Excel files
- **GET /api/data** - Retrieves all imported data
- **PUT /api/data** - Updates multiple data records
- **DELETE /api/data** - Clears all imported data

### Distribution Management
- **GET/POST /api/distributions** - Distribution CRUD operations
- **PUT/DELETE /api/distributions/[id]** - Individual distribution operations

## Database Schema

### users table:
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  isAdmin BOOLEAN NOT NULL DEFAULT 0
)
```

### imported_data table:
```sql
CREATE TABLE imported_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT,
  phone TEXT,
  department TEXT,
  position TEXT,
  salary REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### distributions table:
```sql
CREATE TABLE distributions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  target_audience TEXT NOT NULL,
  distribution_date DATE NOT NULL,
  status TEXT DEFAULT 'draft',
  recipient_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Technical Features
- **Tabbed Interface**: Clean navigation between different admin functions
- **File Validation**: Checks file type and structure
- **Error Handling**: Provides detailed error messages
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Immediate feedback on actions
- **Data Persistence**: All changes are saved to SQLite database
- **Security**: Admin-only access with authentication checks
- **Distribution Management**: Schedule and track panel distributions
- **Recipient Calculation**: Automatic recipient count based on target audience
- **Status Tracking**: Monitor distribution status and history
