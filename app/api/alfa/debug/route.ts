import {NextRequest, NextResponse} from 'next/server';
import {alfaHelper} from '../Helpers/alfaHelper';

export async function POST(request: NextRequest) {
    try {
        console.log('🚀 Starting debug session...');
        const {user, password, step} = await request.json();

        if (!user || !password) {
            return NextResponse.json({
                success: false,
                error: 'Missing user or password',
                debug: {receivedData: {user: !!user, password: !!password}}
            }, {status: 400});
        }

        const helper = new alfaHelper({user, password}, 1);
        console.log('✅ alfaHelper instance created');

        let result: any = {success: false, debug: {}};

        switch (step) {
            case 'login':
                console.log('🔍 Testing login step only...');
                result.loginResult = await helper.login();
                result.debug.requestVerificationToken = helper.requestVerificationToken;
                result.debug.hasLoginCookies = helper.hasLoginCookies;
                result.success = result.loginResult;
                break;

            case 'submit':
                console.log('🔍 Testing login + submit credentials...');
                const loginResult = await helper.login();
                result.debug.loginResult = loginResult;

                if (loginResult) {
                    result.submitResult = await helper.submitCredentials();
                    result.debug.submitResult = result.submitResult;
                    result.success = result.submitResult;
                } else {
                    result.success = false;
                    result.error = 'Login failed';
                }
                break;

            case 'full':
            default:
                console.log('🔍 Testing full login flow...');
                result.fullResult = await helper.startLogin();
                result.debug.allPanels = helper.allPanels;
                result.debug.singlePanelType = helper.singlePanelType;
                result.success = !!result.fullResult;
                break;
        }

        console.log('🏁 Debug session completed:', result.success ? '✅ Success' : '❌ Failed');
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('💥 Debug session error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack,
            debug: {errorType: error.constructor.name}
        }, {status: 500});
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Alfa Debug Endpoint',
        usage: 'POST with { user, password, step }',
        steps: ['login', 'submit', 'full'],
        example: {
            user: 'your_username',
            password: 'your_password',
            step: 'login'
        }
    });
}
