import got from 'got';
import {CookieJar} from 'tough-cookie';
import * as tunnel from 'tunnel';

export default class GotHttp {
    autoRedirect = false;
    requestTimeout = 120000;
    cookies = new CookieJar();

    fixRequestOptions(options: any) {
        // Handle proxy configuration
        if (options.proxy && options.proxy.ip) {
            let proxy_info = {
                proxy: {
                    host: options.proxy.ip,
                    port: options.proxy.port,
                    proxyAuth: options.proxy.username && options.proxy.password ? `${options.proxy.username}:${options.proxy.password}` : undefined
                }
            };
            options['agent'] = {
                http: tunnel.httpOverHttp(proxy_info),
                https: tunnel.httpsOverHttp({
                    ...proxy_info,
                    // Disable certificate validation for proxy debugging
                    rejectUnauthorized: false
                }),
            };

            console.log('🔧 Using proxy configuration:', options.proxy);
        }

        // Remove proxy option as it's not a valid got option
        delete options.proxy;

        // Remove invalid browser-specific options
        delete options.withCredentials; if (options.postData) {
            options['json'] = options.postData;
        } else {
            options['json'] = undefined;
        }
        if (options.body) {
            options['body'] = options.body;
        } else {
            options['body'] = undefined;
        }
        if (options.autoRedirect != undefined) {
            options['followRedirect'] = options.autoRedirect;
        }

        // Handle requestTimeout option - convert to timeout for got
        if (options.requestTimeout) {
            options['timeout'] = {
                request: options.requestTimeout
            };
            delete options.requestTimeout; // Remove the invalid option
        } else {
            options['timeout'] = {
                request: this.requestTimeout
            };
        }

        options['throwHttpErrors'] = false;
        options['retry'] = {limit: 0};  // Proper retry configuration
        options['methodRewriting'] = false;

        // Enhanced HTTPS configuration for proxy debugging
        options['https'] = {
            rejectUnauthorized: false,
            // Additional options for proxy compatibility
            checkServerIdentity: () => undefined
        };

        return options;
    }

    async getRequest(url: string, options: any) {
        try {
            console.log('🌐 Making GET request to:', url);
            console.log('🔧 Request options:', JSON.stringify(this.fixRequestOptions(options), null, 2));
            const response = await got.get(url, this.fixRequestOptions(options));
            console.log('✅ GET request successful, status:', response.statusCode);
            return response;
        } catch (error: any) {
            console.error('❌ GET request failed:', error.message);
            console.error('🔍 Error details:', {
                code: error.code,
                name: error.name,
                options: error.options ? 'Present' : 'Not present'
            });

            // Return a structured error response that matches expected response format
            return {
                statusCode: error.response?.statusCode || 500,
                headers: error.response?.headers || {},
                body: error.response?.body || null,
                error: error.message,
                isError: true
            };
        }
    }

    async postRequest(url: string, options: any) {
        try {
            console.log('🌐 Making POST request to:', url);
            console.log('🔧 Request options:', JSON.stringify(this.fixRequestOptions(options), null, 2));
            const response = await got.post(url, this.fixRequestOptions(options));
            console.log('✅ POST request successful, status:', response.statusCode);
            return response;
        } catch (error: any) {
            console.error('❌ POST request failed:', error.message);
            console.error('🔍 Error details:', {
                code: error.code,
                name: error.name,
                options: error.options ? 'Present' : 'Not present'
            });

            // Return a structured error response that matches expected response format
            return {
                statusCode: error.response?.statusCode || 500,
                headers: error.response?.headers || {},
                body: error.response?.body || null,
                error: error.message,
                isError: true
            };
        }
    }
}