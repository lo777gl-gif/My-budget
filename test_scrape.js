const cheerio = require('cheerio');
fetch('https://ru.tradingeconomics.com/country-list/inflation-rate')
  .then(r => r.text())
  .then(html => {
    const $ = cheerio.load(html);
    const rates = {};
    $('table tr').each((i, el) => {
      const country = $(el).find('td:nth-child(1)').text().trim();
      const rate = $(el).find('td:nth-child(2)').text().trim();
      if(country.includes('Казахстан') || country.includes('Россия') || country.includes('Соединенные Штаты') || country.includes('США')) {
        rates[country] = rate;
      }
    });
    console.log(rates);
  }).catch(console.error);
