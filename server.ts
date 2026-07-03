import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import * as cheerio from 'cheerio';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Cache variables to avoid fetching TradingEconomics too frequently
  let cachedRates = { kz: 8.5, ru: 8.0, us: 3.3, month: '' };
  let lastFetchTime = 0;
  const CACHE_TTL = 1000 * 60 * 60; // 1 hour

  app.get('/api/inflation', async (req, res) => {
    const now = Date.now();
    if (now - lastFetchTime < CACHE_TTL && cachedRates.month !== '') {
      return res.json(cachedRates);
    }

    try {
      const response = await fetch('https://ru.tradingeconomics.com/country-list/inflation-rate?continent=world');
      if (!response.ok) throw new Error('Failed to fetch from TradingEconomics');
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const rates: Record<string, number> = {};
      $('table tr').each((i, el) => {
        const country = $(el).find('td:nth-child(1)').text().trim();
        const rateText = $(el).find('td:nth-child(2)').text().trim();
        const rate = parseFloat(rateText);
        
        if (!isNaN(rate)) {
          if (country.includes('Казахстан')) rates.kz = rate;
          if (country.includes('Россия')) rates.ru = rate;
          if (country.includes('Соединенные Штаты') || country.includes('США')) rates.us = rate;
        }
      });

      const currentMonthName = new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

      cachedRates = {
        kz: rates.kz || cachedRates.kz,
        ru: rates.ru || cachedRates.ru,
        us: rates.us || cachedRates.us,
        month: currentMonthName
      };
      
      lastFetchTime = now;
      res.json(cachedRates);
    } catch (error) {
      console.error('Error fetching inflation rates:', error);
      // Return cached/fallback rates on error
      res.json(cachedRates);
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
