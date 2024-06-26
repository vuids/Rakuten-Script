import fs from 'fs';
import csv from 'csv-parser';
import { createReadStream, createWriteStream } from 'fs';
import { stringify } from 'csv-stringify';

export function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export function generateEmailAddress(catchall) {
    const randomString = generateRandomString(10);
    return `${randomString}@${catchall}`;
}

export function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

export async function readCsv(filePath) {
    const proxies = [];
    return new Promise((resolve, reject) => {
        createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                const proxy = row['proxy']?.trim(); // Ensure the column name in CSV is 'proxy'
                if (proxy) {
                    proxies.push(proxy);
                } else {
                    console.log("Invalid or missing proxy data:", row);
                }
            })
            .on('end', () => {
                //console.log('Proxies loaded:', proxies); // Log loaded proxies to verify
                resolve(proxies);
            })
            .on('error', reject);
    });
}
export function writeToCSV(filePath, data) {
    return new Promise((resolve, reject) => {
        console.log('Writing to CSV with data:', data);  // Debug log
        const csvStream = stringify({ header: true });
        const writableStream = createWriteStream(filePath);
        writableStream.on('finish', resolve);
        writableStream.on('error', reject);
        csvStream.on('error', reject);

        csvStream.pipe(writableStream);
        data.forEach(row => csvStream.write(row));
        csvStream.end();
    });
}


export function logData(data) {
    //console.log(data);
}
