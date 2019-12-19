const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://reddit.com/r/wallstreetbets/search/?q=earnings&restrict_sr=1&sort=new');

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

//   for (let i = 0; i < 10; i++) {
//     await page.evaluate(_ => {
//         window.scrollBy(0, window.innerHeight);
//       });
//       await sleep(200);
//   }          

  const getSent = require('./getSent')
  async function scrapeSubPage(hl) {
    //   concat all comments into single sentiment statement
    const comments = await page.$$('p')
    let cmtTxt = [];
    for (let cmt of comments) {
        const txt = await page.evaluate(el => el.innerText, cmt);
        cmtTxt.push(txt.toLowerCase());
    }
    cmtTxt = cmtTxt.slice(6);
    const sents = cmtTxt.map(cmt => getSent(cmt))
    const avg = sents.map(sent => sent.score).reduce((a,v) => {
        return a + v
    }, 0) / sents.length;

    return {hl, avg, sents}
  }

  async function getHeadlines() {
    const els = await page.$$('h3');
    const headlines = [];
    for (let hl of els) {
        const txt = await page.evaluate(el => el.innerText, hl);
        headlines.push({title: txt, hasEarnings: txt.toLowerCase().includes('earnings')});
    }
    return [headlines.slice(1), els.slice(1)];
  }

//   console.log('earnings in title?', hls.map(hl => hl.hasEarnings))

  let [headlines, els] = await getHeadlines();
  const summaries = [];

  for (let i of Array(headlines.length).keys()) {
    [headlines, els] = await getHeadlines() // must re-get elements on page reload
    const el = els[i];
    const headline = headlines[i];
    if (headline.hasEarnings) {
        console.log('clicking', headline);
        await el.click();
        const summary = await scrapeSubPage(headline.title);
        summaries.push(summary);
        await page.goBack();
    }
    i++;
  }

    console.log(summaries);


  await sleep(1000);

  await browser.close();

})();