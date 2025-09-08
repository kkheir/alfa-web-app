import {NextRequest, NextResponse} from 'next/server';
import {alfaHelper} from '../Helpers/alfaHelper';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {user, password} = body;
        if (!user || !password) {
            return NextResponse.json({message: 'Missing user or password'}, {status: 400});
        }

        // Call alfaHelper login
        const helper = new alfaHelper({user, password}, 1);
        const loginResult = await helper.login();

        if (loginResult) {
            return NextResponse.json({message: 'Login successful'});
        } else {
            return NextResponse.json({message: 'Login failed'}, {status: 401});
        }
    } catch (error: any) {
        return NextResponse.json({message: 'Internal server error', error: error?.message}, {status: 500});
    }
} export async function GET() {
    return NextResponse.json({message: 'Alfa login endpoint is running'});
}
