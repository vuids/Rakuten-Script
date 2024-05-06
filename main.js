import { Worker } from 'worker_threads';
import { readCsv, writeToCSV } from './helperFunctions.js';

async function main(csvPath, taskLimit) {
    const proxies = await readCsv(csvPath);
    let successfulProxies = [];
    const maxConcurrency = 10;  // Concurrent workers - default 10
    let activeWorkers = 0;
    let totalTasks = 0;  // To keep count of how many tasks have run
    const workers = [];
    const csvFilePath = './output.csv';

    const handleWorkerCompletion = async (message) => {
        console.log(`Worker completion message received:`, message);
        if (message.success) {
            successfulProxies.push({ code: message.code });  // Adjust as necessary
        }

        // Check if the task limit is reached
        if (totalTasks < taskLimit && proxies.length > 0) {
            const nextProxy = proxies.pop();
            startWorker(nextProxy);
        }

        activeWorkers--;
        if (activeWorkers === 0) {
            console.log('All workers completed. Writing to CSV...');
            //console.log('Final data collected:', successfulProxies);
            await writeToCSV(csvFilePath, successfulProxies).then(() => {
                console.log('All workers completed and CSV written.');
            }).catch(error => console.error(`Error writing CSV: ${error.message}`));
        }
    };

    const startWorker = (proxy) => {
        const worker = new Worker('./worker.js', { workerData: proxy });
        activeWorkers++;
        totalTasks++;
        console.log(`Starting worker with proxy: ${proxy}`);

        worker.on('message', handleWorkerCompletion);
        worker.on('error', error => console.error(`Worker error: ${error.message}`));
        worker.on('exit', code => {
            if (code !== 0) console.error(`Worker stopped with exit code ${code}`);
        });
        workers.push(worker);
    };

    // Start initial workers up to max concurrency
    proxies.slice(0, maxConcurrency).forEach(proxy => {
        if (totalTasks < taskLimit) {
            startWorker(proxy);
        }
    });
}

main('./proxies.csv', 20).catch(console.error);
