import * as cheerio from 'cheerio';
async function test() {
  const r = await fetch('https://ru.tradingeconomics.com/kazakhstan/inflation-cpi');
  const html = await r.text();
  const $ = cheerio.load(html);
  const rate = $('#ctl00_ContentPlaceHolder1_ctl00_ctl01_Panel1 table tr:nth-child(2) td:nth-child(2)').text().trim();
  console.log(rate);
}
test();
