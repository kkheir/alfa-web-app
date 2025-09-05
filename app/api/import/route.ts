import {NextRequest, NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {verifyToken} from '@/lib/auth';
import {db} from '@/lib/db';
import * as XLSX from 'xlsx';

// Create the data table if it doesn't exist
function initDataTable() {
    db.exec(`
    CREATE TABLE IF NOT EXISTS imported_data (
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
  `);
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

        // Initialize data table
        initDataTable();

        // Get the uploaded file
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({message: 'No file uploaded'}, {status: 400});
        }

        // Read the Excel file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Parse Excel file
        const workbook = XLSX.read(buffer, {type: 'buffer'});
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});

        if (jsonData.length < 2) {
            return NextResponse.json({message: 'Excel file must have at least a header row and one data row'}, {status: 400});
        }

        // Assume first row is headers
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as any[][];

        // Map headers to expected columns (flexible mapping)
        const headerMap: {[key: string]: string} = {};
        headers.forEach((header, index) => {
            const normalizedHeader = header.toString().toLowerCase().trim();
            if (normalizedHeader.includes('name')) headerMap[index] = 'name';
            else if (normalizedHeader.includes('email')) headerMap[index] = 'email';
            else if (normalizedHeader.includes('phone')) headerMap[index] = 'phone';
            else if (normalizedHeader.includes('department')) headerMap[index] = 'department';
            else if (normalizedHeader.includes('position') || normalizedHeader.includes('title')) headerMap[index] = 'position';
            else if (normalizedHeader.includes('salary')) headerMap[index] = 'salary';
        });

        // Prepare insert statement
        const insertStmt = db.prepare(`
      INSERT INTO imported_data (name, email, phone, department, position, salary)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        let importedCount = 0;
        const errors: string[] = [];

        // Insert data
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            try {
                const data = {
                    name: '',
                    email: '',
                    phone: '',
                    department: '',
                    position: '',
                    salary: 0
                };

                // Map row data to columns
                headers.forEach((header, index) => {
                    const column = headerMap[index];
                    if (column && row[index] !== undefined) {
                        if (column === 'salary') {
                            data.salary = parseFloat(row[index]) || 0;
                        } else if (column === 'name') {
                            data.name = row[index]?.toString() || '';
                        } else if (column === 'email') {
                            data.email = row[index]?.toString() || '';
                        } else if (column === 'phone') {
                            data.phone = row[index]?.toString() || '';
                        } else if (column === 'department') {
                            data.department = row[index]?.toString() || '';
                        } else if (column === 'position') {
                            data.position = row[index]?.toString() || '';
                        }
                    }
                });

                insertStmt.run(data.name, data.email, data.phone, data.department, data.position, data.salary);
                importedCount++;
            } catch (error) {
                errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        return NextResponse.json({
            message: `Successfully imported ${importedCount} records`,
            importedCount,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Import error:', error);
        return NextResponse.json(
            {message: 'Failed to import Excel file', error: error instanceof Error ? error.message : 'Unknown error'},
            {status: 500}
        );
    }
}
