const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

export class Utils {

    static UserAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
        'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
        'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
        'Mozilla/5.0 (Linux; Android 11; SM-G991U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Mobile Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:92.0) Gecko/20100101 Firefox/92.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0',
        'Mozilla/5.0 (Android 11; Mobile; rv:92.0) Gecko/92.0 Firefox/92.0',
        'Mozilla/5.0 (Android 11; Mobile; rv:91.0) Gecko/91.0 Firefox/91.0',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36 Edg/93.0.961.52',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36 Edg/92.0.902.84',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36 Edg/93.0.961.52',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36 Edg/92.0.902.84',
        'Mozilla/5.0 (Linux; Android 11; SM-G991U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Mobile Safari/537.36 Edg/93.0.961.52',
        'Mozilla/5.0 (Linux; Android 11; SM-G991U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36 Edg/92.0.902.84',
        'Mozilla/5.0 (Linux; Android 11; SM-G991U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36',
    ];

    static ExtractBetween(original: string, first: string, second: string, withFirst = false, withSecond = false) {
        if (original === '')
            return '';
        try {
            let firstPos = original.indexOf(first);
            //not found
            if (firstPos == -1) {
                return '';
            }
            let firstInt = firstPos;

            let secondInt = original.indexOf(second, firstInt + first.length);
            //not found
            if (secondInt == -1) {
                return '';
            }
            if (!withFirst) {
                firstInt += first.length;
            }
            if (withSecond) {
                secondInt += second.length;
            }
            let result = original.substring(firstInt, secondInt);
            return result;
        }
        catch (Exception) {
            return '';
        }
    }

    static async sleep(ms = 0) {
        return new Promise(r => setTimeout(r, ms));
    }

    static randomUserAgent() {
        return Utils.UserAgents[Math.floor(Math.random() * Utils.UserAgents.length)]
    }

    static reportNumberHasError(array: any) {
        let fileName = `NumbersHasError-${new Date().getHours()}-${new Date().getMinutes()}-${Date.now()}.xlsx`;
        const filePath = path.join(__dirname, fileName);

        let excelFileName = fileName;
        let wb = XLSX.utils.book_new();
        let ws = XLSX.utils.json_to_sheet(array);
        XLSX.utils.book_append_sheet(wb, ws, 'clientsSheet');
        XLSX.writeFile(wb, excelFileName);
        const excelBuffer = XLSX.write(wb, {type: 'buffer', bookType: 'xlsx'});


        fs.writeFile(filePath, excelBuffer, (err: any) => {
            if (err) {
                console.error('An error occurred while saving the Excel file:', err);
                return;
            }
            console.log('The Excel file was successfully saved!');
        });
    }

    static reportNumberSuccess(array: any, salesmanName: string) {
        let fileName = `NumbersSuccess-For-${salesmanName}-${new Date().getHours()}-${new Date().getMinutes()}-${Date.now()}.xlsx`;
        const filePath = path.join(__dirname, fileName);

        let excelFileName = fileName;
        let wb = XLSX.utils.book_new();
        let ws = XLSX.utils.json_to_sheet(array);
        XLSX.utils.book_append_sheet(wb, ws, 'clientsSheet');
        XLSX.writeFile(wb, excelFileName);
        const excelBuffer = XLSX.write(wb, {type: 'buffer', bookType: 'xlsx'});


        fs.writeFile(filePath, excelBuffer, (err: any) => {
            if (err) {
                console.error('An error occurred while saving the Excel file:', err);
                return;
            }
            console.log('The Excel file was successfully saved!');
        });
    }
}