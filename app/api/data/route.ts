import {NextRequest, NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {verifyToken} from '@/lib/auth';
import {db} from '@/lib/db';

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

        // Get all imported data
        const stmt = db.prepare(`
      SELECT id, name, email, phone, department, position, salary, created_at, updated_at
      FROM imported_data 
      ORDER BY id DESC
    `);

        const data = stmt.all();

        return NextResponse.json({data});

    } catch (error) {
        console.error('Fetch data error:', error);
        return NextResponse.json(
            {message: 'Failed to fetch data'},
            {status: 500}
        );
    }
}

export async function PUT(request: NextRequest) {
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

        const {updates} = await request.json();

        if (!Array.isArray(updates)) {
            return NextResponse.json({message: 'Updates must be an array'}, {status: 400});
        }

        // Prepare update statement
        const updateStmt = db.prepare(`
      UPDATE imported_data 
      SET name = ?, email = ?, phone = ?, department = ?, position = ?, salary = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

        let updatedCount = 0;
        const errors: string[] = [];

        // Update each record
        for (const update of updates) {
            try {
                const {id, name, email, phone, department, position, salary} = update;

                if (!id) {
                    errors.push('Missing ID for update');
                    continue;
                }

                const result = updateStmt.run(
                    name || '',
                    email || '',
                    phone || '',
                    department || '',
                    position || '',
                    parseFloat(salary) || 0,
                    id
                );

                if (result.changes > 0) {
                    updatedCount++;
                }
            } catch (error) {
                errors.push(`Failed to update record ${update.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        return NextResponse.json({
            message: `Successfully updated ${updatedCount} records`,
            updatedCount,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Update data error:', error);
        return NextResponse.json(
            {message: 'Failed to update data'},
            {status: 500}
        );
    }
}

export async function DELETE(request: NextRequest) {
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

        // Clear all imported data
        const stmt = db.prepare('DELETE FROM imported_data');
        const result = stmt.run();

        return NextResponse.json({
            message: `Deleted ${result.changes} records`,
            deletedCount: result.changes
        });

    } catch (error) {
        console.error('Delete data error:', error);
        return NextResponse.json(
            {message: 'Failed to delete data'},
            {status: 500}
        );
    }
}
