import * as cheerio from 'cheerio';
async function test() {
  const r = await fetch('https://ru.tradingeconomics.com/country-list/inflation-rate?continent=world');
  const html = await r.text();
  const $ = cheerio.load(html);
  const rates: Record<string, string> = {};
  $('table tr').each((i, el) => {
    const country = $(el).find('td:nth-child(1)').text().trim();
    const rate = $(el).find('td:nth-child(2)').text().trim();
    if(country.includes('Казахстан') || country.includes('Россия') || country.includes('Соединенные Штаты') || country.includes('США')) {
      rates[country] = rate;
    }
  });
  console.log(rates);
}
test();
