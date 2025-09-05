import {NextRequest, NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {verifyToken} from '@/lib/auth';
import {db} from '@/lib/db';

type RouteParams = {
    params: {
        id: string;
    };
};

export async function PUT(request: NextRequest, {params}: RouteParams) {
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

        const {title, description, target_audience, distribution_date, status} = await request.json();
        const distributionId = parseInt(params.id);

        if (!title || !target_audience || !distribution_date) {
            return NextResponse.json({message: 'Title, target audience, and distribution date are required'}, {status: 400});
        }

        // Calculate recipient count based on target audience
        let recipientCount = 0;
        switch (target_audience) {
            case 'all_employees':
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

        // Update distribution
        const updateStmt = db.prepare(`
      UPDATE distributions 
      SET title = ?, description = ?, target_audience = ?, distribution_date = ?, 
          status = ?, recipient_count = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

        const result = updateStmt.run(title, description || '', target_audience, distribution_date, status || 'draft', recipientCount, distributionId);

        if (result.changes === 0) {
            return NextResponse.json({message: 'Distribution not found'}, {status: 404});
        }

        return NextResponse.json({
            message: 'Distribution updated successfully'
        });

    } catch (error) {
        console.error('Update distribution error:', error);
        return NextResponse.json(
            {message: 'Failed to update distribution'},
            {status: 500}
        );
    }
}

export async function DELETE(request: NextRequest, {params}: RouteParams) {
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

        const distributionId = parseInt(params.id);

        // Delete distribution
        const deleteStmt = db.prepare('DELETE FROM distributions WHERE id = ?');
        const result = deleteStmt.run(distributionId);

        if (result.changes === 0) {
            return NextResponse.json({message: 'Distribution not found'}, {status: 404});
        }

        return NextResponse.json({
            message: 'Distribution deleted successfully'
        });

    } catch (error) {
        console.error('Delete distribution error:', error);
        return NextResponse.json(
            {message: 'Failed to delete distribution'},
            {status: 500}
        );
    }
}
