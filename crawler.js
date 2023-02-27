const fetch = require('node-fetch');
require('dotenv').config;

//firestore
const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: 'operating-ally-304222',
  keyFilename: 'firestore.json'
});

//crawler
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const itemNames = [];
const priceList = [];
const ebayList = [];
let combinedList = [];
const ebayListFiltered = [];
const urls = [
  'https://www.gcsurplus.ca/mn-eng.cfm?&snc=wfsav&vndsld=0&sc=ach-shop&lci=&sf=ferm-clos&so=ASC&srchtype=&hpcs=&hpsr=&kws=&jstp=&str=1&sr=1&rpp=25',
  'https://www.gcsurplus.ca/mn-eng.cfm?&snc=wfsav&vndsld=0&sc=ach-shop&lci=&sf=ferm-clos&so=ASC&srchtype=&hpcs=&hpsr=&kws=&jstp=&str=26&sr=1&rpp=25',
  'https://www.gcsurplus.ca/mn-eng.cfm?&snc=wfsav&vndsld=0&sc=ach-shop&lci=&sf=ferm-clos&so=ASC&srchtype=&hpcs=&hpsr=&kws=&jstp=&str=51&sr=1&rpp=25',
  'https://www.gcsurplus.ca/mn-eng.cfm?&snc=wfsav&vndsld=0&sc=ach-shop&lci=&sf=ferm-clos&so=ASC&srchtype=&hpcs=&hpsr=&kws=&jstp=&str=76&sr=1&rpp=25',
  'https://www.gcsurplus.ca/mn-eng.cfm?&snc=wfsav&vndsld=0&sc=ach-shop&lci=&sf=ferm-clos&so=ASC&srchtype=&hpcs=&hpsr=&kws=&jstp=&str=101&sr=1&rpp=25',
  'https://www.gcsurplus.ca/mn-eng.cfm?&snc=wfsav&vndsld=0&sc=ach-shop&lci=&sf=ferm-clos&so=ASC&srchtype=&hpcs=&hpsr=&kws=&jstp=&str=126&sr=1&rpp=25',
  'https://www.gcsurplus.ca/mn-eng.cfm?&snc=wfsav&vndsld=0&sc=ach-shop&lci=&sf=ferm-clos&so=ASC&srchtype=&hpcs=&hpsr=&kws=&jstp=&str=151&sr=1&rpp=25'
];

const crawler = async () => {
  try {
    for (const url of urls) {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url);
      const content = await page.content();
      //cheerio
      await filterElements(content);
      browser.close();
    }
    return itemNames;
  } catch (error) {
    console.log(`puppeteer error: ${error}`);
    return error;
  }
};

async function filterElements(content) {
  const $ = cheerio.load(content);
  const cleaner = /(?<![\b])[a-zA-Z0-9]*/g;
  //regex pulling in extra numbers
  $('td[headers=itemInfo]')
    .find('a')
    .each(function (index, element) {
      itemNames.push({
        title: $(element)
          .text()
          .match(cleaner)
          .filter((entry) => /\S/.test(entry))
          .join(' ')
          .slice(0, -6),
        link: `https://www.gcsurplus.ca/` + $(element).attr('href')
      });
    });
  $('dd[class=short]')
    //id includes currentBidId
    .find('span[id^=currentBidId]')
    .each(function (index, element) {
      console.log(`${index}, ${$(element).text()}`);
      priceList.push({
        price: $(element).text()
      });
    });
  return;
}

const getEbayItemData = async () => {
  try {
    for (const product of itemNames) {
      await fetch(
        `https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByKeywords` +
          `&SECURITY-APPNAME=${process.env.SECURITY_APPNAME}` +
          `&RESPONSE-DATA-FORMAT=JSON` +
          `&GLOBAL-ID=EBAY-US` +
          `&keywords=${product.title}` +
          `&paginationInput.entriesPerPage=1`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log(`searching for ${product.title}`);
          ebayList.push(data);
        })
        .catch((err) => err);
    }
    return ebayList;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const filterEbayItemInfo = async () => {
  for (const item of ebayList) {
    let price = 'N/A';
    let link = 'N/A';
    try {
      if (
        item.findItemsByKeywordsResponse[0].searchResult[0].item[0] !==
        undefined
      ) {
        price =
          item.findItemsByKeywordsResponse[0].searchResult[0].item[0]
            .sellingStatus[0].currentPrice[0].__value__;
        link =
          item.findItemsByKeywordsResponse[0].searchResult[0].item[0]
            .viewItemURL[0];
      }
    } catch (error) {
      console.log(`no ebay data: ${error}`);
    }

    ebayListFiltered.push({
      price: price,
      link: link
    });
  }
  return ebayListFiltered;
};

const mergeCrawledData = async () => {
  for (const [index, item] of itemNames.entries()) {
    console.log(`index: ${index}, item: ${item.title}`);
    combinedList.push({
      itemName: item.title,
      itemLink: item.link,
      gcPrice: (priceList[index] && priceList[index].price) || 'N/A',
      ebayLink: ebayListFiltered[index].link,
      ebayPrice: ebayListFiltered[index].price
    });
  }
  console.log(`big list: ${combinedList}`);
  return combinedList;
};
const sendData = async () => {
  //firestore
  console.log(`sending data to firestore`);
  await db.collection('gc_ebay_list').doc('api_crawl').set({ combinedList });
};

const getAll = async () => {
  await crawler(),
    await getEbayItemData(),
    await filterEbayItemInfo(),
    await mergeCrawledData(),
    await sendData();
};

getAll();

module.exports = crawler;
