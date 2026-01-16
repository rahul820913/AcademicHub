const router = require('express').Router();
const puppeteer = require('puppeteer');

router.get('/schedule', async (req, res) => {
  const { rollNo } = req.query;
  if (!rollNo) return res.status(400).json({ message: "Roll number required" });

  let browser;
  try {
    
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();

   
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
            req.abort();
        } else {
            req.continue();
        }
    });


    await page.goto('https://exam-schedule-system.vercel.app/', { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });

    const inputSelector = 'input';
    await page.waitForSelector(inputSelector, { timeout: 15000 });

    await page.focus(inputSelector);
    
    await page.click(inputSelector, { clickCount: 3 });
    await page.keyboard.press('Backspace');

    await page.type(inputSelector, rollNo, { delay: 100 });
    
    await page.keyboard.press('Enter');

    try {
        await page.waitForFunction(
          () => document.querySelector('table tbody tr') || document.body.innerText.includes('No results'),
          { timeout: 10000 }
        );
    } catch (e) {
        console.log("Wait for results timed out.");
    }

    
    const schedule = await page.evaluate(() => {
        if (document.body.innerText.includes('No results found')) return [];

        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        return rows.map(row => {
            const cols = row.querySelectorAll('td');
            if (cols.length < 5) return null; 
            
            return {
                rollNo: cols[0]?.innerText.trim(),
                day: cols[1]?.innerText.trim(),
                code: cols[2]?.innerText.trim(),
                date: cols[3]?.innerText.trim(),
                shift: cols[4]?.innerText.trim(),
                room: cols[5]?.innerText.trim(),
                title: cols[6]?.innerText.trim(),
            };
        }).filter(item => item !== null);
    });

    await browser.close();
    res.json(schedule);

  } catch (err) {
    if (browser) await browser.close();
    console.error("Scraping Error:", err.message);
    res.status(500).json({ message: `Failed to fetch schedule: ${err.message}` });
  }
});

module.exports = router;