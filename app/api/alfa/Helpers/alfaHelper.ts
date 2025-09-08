import GotHttp from './GotHttp';
import {Utils} from './Utils';
import * as cheerio from 'cheerio';
const fs = require('fs');
const path = require('path');

export class alfaHelper {
    hasLoginCookies;
    baseUrl;
    requestVerificationToken = '';
    email;
    password;
    proxy;
    http;
    numberHasError = [];
    numberSuccess = [];
    static defaultNumberToSkip = '';
    singlePanelType = false;
    allPanels: any = [];

    constructor(userDetails: any, workerNumber: number) {
        console.log(userDetails)
        this.http = new GotHttp();
        this.hasLoginCookies = false;
        this.baseUrl = 'https://www.alfa.com.lb';
        this.email = userDetails.user;
        if (this.email === 'k') {
            this.email = '81477690'
        }
        this.password = userDetails.password;
        if (this.password === 'k') {
            this.password = 'Kzone@92022';
        }

        // Enable proxy for local debugging (HTTP traffic inspection)
        this.proxy = {
            ip: '127.0.0.1',
            port: 8888,
            username: '',
            password: ''
        };

        // Uncomment below to disable proxy
        // this.proxy = {};

        // if (remote.app.isPackaged) {
        //     this.proxy = {}
        // }
        const appDataDir = path.join(process.env.APPDATA, 'AlfaAutoSubmit');
        if (!fs.existsSync(appDataDir)) {
            fs.mkdirSync(appDataDir, {recursive: true});
        }
        // Utils.logs(appDataDir);
        // this.cookiesFilePath = path.join(appDataDir, `login-cookies-${this.workerNumber}-${this.email}`);
    }

    async startLogin() {
        let result = await this.login();
        if (result) {
            result = await this.submitCredentials();
            if (result) {
                return await this.getAllPanels();
            }
        }
    }

    async login() {
        console.log('🔵 Starting login process...');
        console.log('📧 Email:', this.email);
        console.log('🔐 Password length:', this.password ? this.password.length : 0);
        console.log('🌐 Base URL:', this.baseUrl);

        if (this.hasLoginCookies) {
            console.log('🍪 Using existing login cookies');
            await this.getHomePage();
            return true;
        }
        let response: any = await this.http.getRequest(this.baseUrl + '/ar/account/login', {
            headers: {
                'Connection': 'keep-alive',
                'sec-ch-ua': '"Not;A=Brand";v="99", "Microsoft Edge";v="139", "Chromium";v="139"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-User': '?1',
                'Sec-Fetch-Dest': 'document',
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            requestTimeout: 400000,
            proxy: this.proxy,
            cookieJar: this.http.cookies
        })
        console.log('📡 Login page response status:', response.statusCode);
        console.log('📄 Response body length:', response.body ? response.body.length : 0);

        // Check if this is an error response
        if (response.isError) {
            console.error('❌ HTTP request failed:', response.error);
            return false;
        }

        if (response.body) {
            try {
                const $ = cheerio.load(response.body, {xmlMode: true});
                let requestVerificationToken = $('input[name=__RequestVerificationToken]');
                console.log('🔑 Found verification tokens:', requestVerificationToken.length);

                if (requestVerificationToken && requestVerificationToken[2] && requestVerificationToken[2].attribs['value']) {
                    this.requestVerificationToken = requestVerificationToken[2].attribs['value'];
                    console.log('✅ Request verification token acquired:', this.requestVerificationToken.substring(0, 20) + '...');
                    return true;
                } else {
                    console.log('❌ Request verification token not found or invalid structure');
                    console.log('Available tokens:', requestVerificationToken.map((i, el) => $(el).attr('value')));
                }
            } catch (error) {
                console.error('❌ Error parsing login page:', error);
            }
        }
        console.log('❌ Login failed - response:', {
            statusCode: response.statusCode,
            headers: response.headers,
            bodySnippet: response.body ? response.body.substring(0, 500) : 'No body'
        });
        return false;
    }

    async getHomePage(): Promise<any> {
        console.log('Getting home page..');
        let response: any;
        while (true) {
            response = await this.http.getRequest(this.baseUrl + '/en/account', {
                headers: {
                    'Connection': 'keep-alive',
                    'sec-ch-ua': '"Not;A=Brand";v="99", "Microsoft Edge";v="139", "Chromium";v="139"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'Upgrade-Insecure-Requests': '1',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-User': '?1',
                    'Sec-Fetch-Dest': 'document',
                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                    'Accept-Language': 'en-US,en;q=0.9',
                },
                requestTimeout: 120000,
                proxy: this.proxy,
                autoRedirect: false,
                cookieJar: this.http.cookies
            })
            if (response.statusCode == 200) {
                break;
            } else {
                return this.getHomePage();
            }
        }
        return true;
    }


    async submitCredentials(tries = 0): Promise<boolean> {
        console.log('🔵 Submitting login credentials (attempt:', tries + 1, ')');
        console.log('🔑 Using verification token:', this.requestVerificationToken.substring(0, 20) + '...');

        if (this.hasLoginCookies) {
            console.log('🍪 Already have login cookies, skipping credential submission');
            return true;
        }
        let response: any = await this.http.postRequest('https://www.alfa.com.lb/ar/account/login', {
            headers: {
                'Connection': 'keep-alive',
                'sec-ch-ua': '"Not;A=Brand";v="99", "Microsoft Edge";v="139", "Chromium";v="139"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-User': '?1',
                'Sec-Fetch-Dest': 'document',
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Accept-Language': 'en-US,en;q=0.9',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `__RequestVerificationToken=${this.requestVerificationToken}&Username=${this.email}&Password=${encodeURIComponent(this.password)}&RememberMe=true`,
            requestTimeout: 400000,
            autoRedirect: false,
            proxy: this.proxy,
            cookieJar: this.http.cookies
        })
        console.log('📡 Credential submission response status:', response.statusCode);
        console.log('📄 Response headers location:', response.headers['location'] || response.headers['Location']);

        if (response.body) {
            let redirectedUrl = response.headers['location'];
            if (!redirectedUrl) {
                redirectedUrl = response.headers['Location'];
            }
            console.log('redirectedUrl', redirectedUrl);
            if (redirectedUrl && (redirectedUrl.indexOf('/ar/account') > -1 || redirectedUrl.includes('/account'))) {
                response = await this.http.getRequest(this.baseUrl + redirectedUrl, {
                    headers: {
                        'Connection': 'keep-alive',
                        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
                        'Accept-Language': 'en',
                        'sec-ch-ua-mobile': '?0',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
                        'Accept': 'application/json, text/javascript, */*; q=0.01',
                        'sec-ch-ua-platform': '"Windows"',
                        'Sec-Fetch-Site': 'cross-site',
                        'Sec-Fetch-Mode': 'cors',
                        'Sec-Fetch-Dest': 'empty',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    requestTimeout: 120000,
                    proxy: this.proxy,
                    autoRedirect: false,
                    cookieJar: this.http.cookies
                });
                let allCookies = await this.http.cookies.getCookies(this.baseUrl);
                console.log(allCookies);
                if (allCookies && allCookies.length > 0) {
                    // fs.writeFileSync(this.cookiesFilePath, JSON.stringify(allCookies));

                    // here save login cookies in the database
                }
                console.log('login credentials submitted..');
                return true;
            }
        }
        console.log('Failed submitting login credentials..');
        if (tries++ < 5) {
            return await this.submitCredentials(tries);
        }
        return false;
    }
    getAllPanelsTries = 0;
    async getAllPanels() {
        console.log('Getting All Panels');
        while (true) {
            let response: any = await this.http.getRequest('https://www.alfa.com.lb/en/account/manage-my-fleet', {
                headers: {
                    'Connection': 'keep-alive',
                    'sec-ch-ua': '"Not;A=Brand";v="99", "Microsoft Edge";v="139", "Chromium";v="139"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'Upgrade-Insecure-Requests': '1',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-User': '?1',
                    'Sec-Fetch-Dest': 'document',
                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                requestTimeout: 120000,
                proxy: this.proxy,
                autoRedirect: false,
                cookieJar: this.http.cookies
            })
            if (response.body && response.statusCode === 200) {
                try {
                    if (response.body && response.body.includes('Sorry this section is not available for your current line type')) {
                        this.singlePanelType = true;
                        this.allPanels = [{'MSISDNNumber': this.email}];
                        console.log(`Found ${this.allPanels.length} pannels`);

                        return this.allPanels;
                    }
                    let data = Utils.ExtractBetween(response.body, 'var members = [{', '}];');
                    if (data) {
                        this.allPanels = JSON.parse(`[{${data}}]`);
                        console.log(`Found ${this.allPanels.length} pannels`);
                        return this.allPanels;
                    }
                } catch {}
            }
            let redirectedUrl = response.headers['location'] || response.headers['Location'];
            let logMessage = `Failed getting all panels${response.statusCode}, try again...`;
            if (redirectedUrl) {
                logMessage += ` | redirect: ${redirectedUrl}`;
            }
        }
        console.log('Failed getting all panels..code->');
        return false;
    }
}
