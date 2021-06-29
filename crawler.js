const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const url = 'https://www.gcsurplus.ca/mn-eng.cfm?&snc=wfsav&vndsld=0&sc=ach-shop&lci=&sf=ferm-clos&so=ASC&srchtype=&hpcs=&hpsr=&kws=&jstp=&str=1&&sr=1&rpp=25';
const url2 = 'https://www.gcsurplus.ca/mn-eng.cfm?snc=wfsav&sc=ach-shop&vndsld=0&lci=&lcn=540097&str=1&sf=ferm-clos&so='
const crawler = () => {
puppeteer
  .launch()
  .then(browser => browser.newPage())
  .then(page => {
    return page.goto(url).then(function() {
      return page.content();
    });
  })
  .then(html => {
    const cleaner = /(?<![\b])[a-zA-Z]*/g
    const $ = cheerio.load(html);
    const itemNames = [];
    $('td[headers=itemInfo]')
    .find("a")
    .each(function(index, element) {
      itemNames.push({
        title: ($(element).text().match(cleaner).filter(entry => /\S/.test(entry))).join(' '),
        link: 'https://www.gcsurplus.ca/' + $(element).attr("href")
      });
    });
    $('dd[class=short]')
    .find("span")
    .each(function(index, element) {
      itemNames[index].price = $(element).text()
    });
  })
}


  const getData = async () => {
    const promise = new Promise((resolve, reject) => {
        setTimeout(() => resolve(crawler.itemNames), 10000)
      });
    
    const response = await promise
    const stringarr = JSON.stringify(response)
    //redis post (set)
    const client = redis.createClient({
        host: 'redis-10514.c60.us-west-1-2.ec2.cloud.redislabs.com',
        port: 10514,
        password: '7e9Ui1fX1YsdPy2vJyxI9vsV0Fb9qZ7J',
    })

    client.on('error', function (error) {
        console.error(error)
    })
    client.set('link', stringarr, redis.print)
}

getData()
setInterval(function () { getData(); }, 600*1000)
  .catch(console.error);





  

  

  

 