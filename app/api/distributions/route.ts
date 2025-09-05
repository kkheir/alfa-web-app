import {NextRequest, NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {verifyToken} from '@/lib/auth';
import {db} from '@/lib/db';

// Initialize distributions table
function initDistributionsTable() {
    db.exec(`
    CREATE TABLE IF NOT EXISTS distributions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      target_audience TEXT NOT NULL,
      distribution_date DATE NOT NULL,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'scheduled', 'sent', 'cancelled')),
      recipient_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const token = cookies().get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({message: 'Unauthorized'}, {status: 401});
        }

        const decoded = await verifyToken(token);
        if (!decoded || !decoded.isAdmin) {
            return NextResponse.json({message: 'Admin access required'}, {status: 403});
        }

        // Initialize table
        initDistributionsTable();

        // Get all distributions
        const stmt = db.prepare(`
      SELECT id, title, description, target_audience, distribution_date, status, 
             recipient_count, created_at, updated_at
      FROM distributions 
      ORDER BY created_at DESC
    `);

        const data = stmt.all();

        return NextResponse.json({data});

    } catch (error) {
        console.error('Fetch distributions error:', error);
        return NextResponse.json(
            {message: 'Failed to fetch distributions'},
            {status: 500}
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const token = cookies().get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({message: 'Unauthorized'}, {status: 401});
        }

        const decoded = await verifyToken(token);
        if (!decoded || !decoded.isAdmin) {
            return NextResponse.json({message: 'Admin access required'}, {status: 403});
        }

        // Initialize table
        initDistributionsTable();

        const {title, description, target_audience, distribution_date, status} = await request.json();

        if (!title || !target_audience || !distribution_date) {
            return NextResponse.json({message: 'Title, target audience, and distribution date are required'}, {status: 400});
        }

        // Calculate recipient count based on target audience (mock calculation)
        let recipientCount = 0;
        switch (target_audience) {
            case 'all_employees':
                // Get count from imported_data table
                const allCount = db.prepare('SELECT COUNT(*) as count FROM imported_data').get() as {count: number};
                recipientCount = allCount.count;
                break;
            case 'department_it':
                const itCount = db.prepare("SELECT COUNT(*) as count FROM imported_data WHERE department LIKE '%IT%' OR department LIKE '%Technology%'").get() as {count: number};
                recipientCount = itCount.count;
                break;
            case 'department_hr':
                const hrCount = db.prepare("SELECT COUNT(*) as count FROM imported_data WHERE department LIKE '%HR%' OR department LIKE '%Human Resources%'").get() as {count: number};
                recipientCount = hrCount.count;
                break;
            case 'department_finance':
                const financeCount = db.prepare("SELECT COUNT(*) as count FROM imported_data WHERE department LIKE '%Finance%' OR department LIKE '%Accounting%'").get() as {count: number};
                recipientCount = financeCount.count;
                break;
            case 'managers':
                const managerCount = db.prepare("SELECT COUNT(*) as count FROM imported_data WHERE position LIKE '%Manager%' OR position LIKE '%Director%' OR position LIKE '%Lead%'").get() as {count: number};
                recipientCount = managerCount.count;
                break;
            default:
                recipientCount = 0;
        }

        // Insert distribution
        const insertStmt = db.prepare(`
      INSERT INTO distributions (title, description, target_audience, distribution_date, status, recipient_count)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        const result = insertStmt.run(title, description || '', target_audience, distribution_date, status || 'draft', recipientCount);

        return NextResponse.json({
            message: 'Distribution created successfully',
            id: result.lastInsertRowid
        });

    } catch (error) {
        console.error('Create distribution error:', error);
        return NextResponse.json(
            {message: 'Failed to create distribution'},
            {status: 500}
        );
    }
}
