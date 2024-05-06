// worker.js
import puppeteer from 'puppeteer';
import { parentPort, workerData } from 'worker_threads';
import { delay, generateSixDigitNumber, logData } from './helperFunctions.js';

async function mainWithBrowser() {
    // Validate workerData format before processing
    if (typeof workerData !== 'string') {
        console.error('Worker data must be a string in the format "ip:port:username:password"');
        return; // Exit if data is not in expected format
    }
    const dataParts = workerData.split(':');
    if (dataParts.length !== 4) {
        console.error('Worker data is incomplete or improperly formatted:', workerData);
        return; // Exit if data parts do not split into exactly four parts
    }
    const [ip, port, name, pwd] = dataParts;

    const proxyUrl = `http://${ip}:${port}`;
    const password = 'Password123456_';  // Assuming this is a static password for demonstration
    const catchall = 'gmail.com';
    const email = generateSixDigitNumber(catchall);

    try {
        const browser = await puppeteer.launch({
            //executablePath: browserPath, // Uncomment and provide path if using a non-standard browser or location
            headless: false, // Set to false for debugging, true for production
            executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
            defaultViewport: { width: 1200, height: 1080 },
            args: [`--proxy-server=${proxyUrl}`]
        });

        const page = await browser.newPage();
        page.on('dialog', async dialog => {
            if (dialog.type() === 'alert' && dialog.message().includes('proxy')) {
                await dialog.dismiss();
            }
        });

        await page.authenticate({
            username: name,
            password: pwd,
        });

        await page.goto('https://www.rakuten.com/auth/v2/signup?flow=flow-rewards-hub-10percent-50cap-7days&variant_type=NO_HEADER_NO_BONUS_LINK&view_mode=external_spacing&bonus_id=NULL_IGNORE&app_name=activation-web&app_version=1.7.4');
        //Logging in
        await page.waitForSelector('#emailAddress');
        await page.type('#emailAddress', email);
        await page.waitForSelector('#password');
        await page.type('#password', password);
        await page.keyboard.press('Enter');

        await delay(2000);
        const urlToNavigate = 'https://www.rakuten.com/account';
        await page.goto(urlToNavigate);
        try {
            // Navigate to the URL
            const response = await page.goto(urlToNavigate, {waitUntil: 'networkidle0'});

            // Check if navigation was successful
            if (response && response.ok()) {
                //console.log(`Successfully navigated to ${urlToNavigate} for ${email}`);
            } else {
                throw new Error(`Failed to load page, status code: ${response.status()}`);
            }

            // Grabbing code
            const code = await page.evaluate(() => {
                //Change div to Rakuten Code
                const element = document.querySelector('div[data-testid="account-left-member-name"]');

                if (element) {
                    // Extract the text, assuming there are no other elements with text in this div
                    return element.textContent.trim();  // .trim() to remove any excess whitespace
                }
                return null;  // Return null if the element is not found
            });

            // Check if code was successfully extracted
            if (code) {
                console.log('Successfully extracted code:', code);
                // Send success message to main thread with the code
                parentPort.postMessage({ success: true, code: code });
            } else {
                console.error('Failed to extract code: Element not found');
                // Send failure message to main thread
                parentPort.postMessage({ success: false, error: 'Failed to extract code: Element not found' });
            }
        } catch (error) {
            console.error('Error during page operations:', error);
            // Send failure message to main thread if needed
            parentPort.postMessage({success: false, error: error.message});
        } finally {
            // Close the browser
            await browser.close();
        }

    } catch (error) {
        console.error(`Error during browser setup: ${error.message}`);
        // Send failure message to main thread if needed
        parentPort.postMessage({success: false, error: error.message});
    }
}

mainWithBrowser();
