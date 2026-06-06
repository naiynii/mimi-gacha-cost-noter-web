import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import path from 'path';
import fs from 'fs';

let doc = null;
let masterSheet = null;
let isReady = false;

function formatSheetDate(dateStr) {
    if (!dateStr) return '';
    
    // 1. If it matches DD/MM/YYYY strictly (2 digits for day, 2 digits for month, 4 digits for year), return as is
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        return dateStr;
    }
    
    // 2. If it matches YYYY-MM-DD or YYYY/MM/DD
    const isoMatch = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
        return `${String(isoMatch[3]).padStart(2, '0')}/${String(isoMatch[2]).padStart(2, '0')}/${isoMatch[1]}`;
    }
    
    // 3. Fallback: Parse using JS Date
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed)) {
        const d = new Date(parsed);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }
    
    return dateStr;
}

export async function init() {
    if (isReady) return;

    try {
        let credentials;
        if (process.env.GOOGLE_CREDENTIALS_JSON) {
            try {
                credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
            } catch (err) {
                console.error('Failed to parse GOOGLE_CREDENTIALS_JSON environment variable:', err);
                throw new Error('Invalid GOOGLE_CREDENTIALS_JSON format.');
            }
        } else {
            // Resolve credentials path inside Next.js server
            // We look for google-credentials.json in the current working directory
            const credentialsPath = path.join(process.cwd(), 'google-credentials.json');
            if (!fs.existsSync(credentialsPath)) {
                throw new Error('Google credentials not found. Please set GOOGLE_CREDENTIALS_JSON env var or place google-credentials.json in the root directory.');
            }
            credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        }
        
        const serviceAccountAuth = new JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();
        
        masterSheet = doc.sheetsByTitle['Master Data'];
        if (!masterSheet) {
            masterSheet = await doc.addSheet({ 
                headerValues: ['ID', 'Timestamp', 'Topup_Date', 'User_ID', 'Username', 'Game_Name', 'Total_Amount', 'Items_Detail', 'Remark'], 
                title: 'Master Data' 
            });
        }
        
        isReady = true;
        console.log(`Connected to Google Sheet: ${doc.title}`);
    } catch (error) {
        console.error('Error connecting to Google Sheets:', error);
        throw error;
    }
}

export async function getUserGames(userId) {
    await init();
    if (!isReady || !masterSheet) return [];
    
    const rows = await masterSheet.getRows();
    const games = new Set();
    
    for (const row of rows) {
        if (row.get('User_ID') === userId && row.get('Game_Name')) {
            games.add(row.get('Game_Name'));
        }
    }
    
    return Array.from(games);
}

export async function addRecord(record) {
    await init();
    if (!isReady || !masterSheet) throw new Error("Google Sheets not ready.");
    await masterSheet.addRow(record);
}

export async function getSummary(userId, gameFilter = null) {
    await init();
    if (!isReady || !masterSheet) throw new Error("Google Sheets not ready.");
    
    const rows = await masterSheet.getRows();
    let total = 0;
    const items = [];

    for (const row of rows) {
        if (row.get('User_ID') === userId) {
            const rowGame = row.get('Game_Name');
            if (gameFilter && rowGame !== gameFilter) continue;
            
            total += parseFloat(row.get('Total_Amount') || 0);
            items.push({
                id: row.get('ID'),
                timestamp: row.get('Timestamp'),
                date: formatSheetDate(row.get('Topup_Date')),
                game: rowGame,
                amount: parseFloat(row.get('Total_Amount') || 0),
                detail: row.get('Items_Detail') || '',
                remark: row.get('Remark') || ''
            });
        }
    }

    return { total, items };
}

export async function getLatestRecord(userId) {
    await init();
    if (!isReady || !masterSheet) throw new Error("Google Sheets not ready.");

    const rows = await masterSheet.getRows();
    let latestRow = null;

    for (const row of rows) {
        if (row.get('User_ID') === userId) {
            latestRow = row;
        }
    }

    if (!latestRow) return null;

    return {
        id: latestRow.get('ID'),
        date: formatSheetDate(latestRow.get('Topup_Date')),
        game: latestRow.get('Game_Name'),
        amount: parseFloat(latestRow.get('Total_Amount') || 0),
        detail: latestRow.get('Items_Detail') || '',
        remark: latestRow.get('Remark') || '',
    };
}

export async function getRecentRecords(userId, limit = 10) {
    await init();
    if (!isReady || !masterSheet) throw new Error("Google Sheets not ready.");

    const rows = await masterSheet.getRows();
    const userRows = [];

    for (const row of rows) {
        if (row.get('User_ID') === userId) {
            userRows.push({
                id: row.get('ID'),
                timestamp: row.get('Timestamp'),
                date: formatSheetDate(row.get('Topup_Date')),
                game: row.get('Game_Name'),
                amount: parseFloat(row.get('Total_Amount') || 0),
                detail: row.get('Items_Detail') || '',
                remark: row.get('Remark') || '',
            });
        }
    }

    return userRows.slice(-limit).reverse();
}

export async function deleteRecord(recordId) {
    await init();
    if (!isReady || !masterSheet) throw new Error("Google Sheets not ready.");

    const rows = await masterSheet.getRows();
    for (const row of rows) {
        if (row.get('ID') === recordId) {
            await row.delete();
            return true;
        }
    }
    return false;
}
