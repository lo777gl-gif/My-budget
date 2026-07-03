import * as cheerio from 'cheerio';
async function test() {
  const r = await fetch('https://ru.tradingeconomics.com/country-list/inflation-rate');
  const html = await r.text();
  const $ = cheerio.load(html);
  $('table tr').each((i, el) => {
    console.log($(el).find('td:nth-child(1)').text().trim());
  });
}
test();
