const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const fetch = require("node-fetch");
require("dotenv").config;
const indexRouter = require("./routes/index");
const crawlerAPIrouter = require("./routes/crawlerAPI");
const ebayAPIrouter = require("./routes/ebayAPI");
const cors = require("cors");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/crawlerAPI", crawlerAPIrouter);
app.use("/ebayAPI", ebayAPIrouter);

//firestore
const Firestore = require("@google-cloud/firestore");

const db = new Firestore({
  projectId: "operating-ally-304222",
  keyFilename: "firestore.json",
});

//crawler
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const itemNames = [];
const priceList = [];
const ebayList = [];
const urls = [
  "https://www.gcsurplus.ca/mn-eng.cfm?&snc=wfsav&vndsld=0&sc=ach-shop&lci=&sf=ferm-clos&so=ASC&srchtype=&hpcs=&hpsr=&kws=&jstp=&str=1&sr=1&rpp=25",
  "https://www.gcsurplus.ca/mn-eng.cfm?&snc=wfsav&vndsld=0&sc=ach-shop&lci=&sf=ferm-clos&so=ASC&srchtype=&hpcs=&hpsr=&kws=&jstp=&str=26&sr=1&rpp=25",
  "https://www.gcsurplus.ca/mn-eng.cfm?&snc=wfsav&vndsld=0&sc=ach-shop&lci=&sf=ferm-clos&so=ASC&srchtype=&hpcs=&hpsr=&kws=&jstp=&str=51&sr=1&rpp=25",
  "https://www.gcsurplus.ca/mn-eng.cfm?&snc=wfsav&vndsld=0&sc=ach-shop&lci=&sf=ferm-clos&so=ASC&srchtype=&hpcs=&hpsr=&kws=&jstp=&str=76&sr=1&rpp=25",
  "https://www.gcsurplus.ca/mn-eng.cfm?&snc=wfsav&vndsld=0&sc=ach-shop&lci=&sf=ferm-clos&so=ASC&srchtype=&hpcs=&hpsr=&kws=&jstp=&str=101&sr=1&rpp=25",
  "https://www.gcsurplus.ca/mn-eng.cfm?&snc=wfsav&vndsld=0&sc=ach-shop&lci=&sf=ferm-clos&so=ASC&srchtype=&hpcs=&hpsr=&kws=&jstp=&str=126&sr=1&rpp=25",
  "https://www.gcsurplus.ca/mn-eng.cfm?&snc=wfsav&vndsld=0&sc=ach-shop&lci=&sf=ferm-clos&so=ASC&srchtype=&hpcs=&hpsr=&kws=&jstp=&str=151&sr=1&rpp=25",
];

const crawler = async () => {
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const browser = await puppeteer.launch({ ignoreHTTPSErrors: true });
    const page = await browser.newPage();
    await page.goto(url);
    const content = await page.content();
    //cheerio
    const $ = cheerio.load(content);
    const cleaner = /(?<![\b])[a-zA-Z0-9]*/g;
    //regex pulling in extra numbers
    $("td[headers=itemInfo]")
      .find("a")
      .each(function (index, element) {
        itemNames.push({
          title: $(element)
            .text()
            .match(cleaner)
            .filter((entry) => /\S/.test(entry))
            .join(" ")
            .slice(0, -6),
          link: "https://www.gcsurplus.ca/" + $(element).attr("href"),
        });
      });
    $("dd[class=short]")
      .find("span")
      .each(function (index, element) {
        priceList.push({
          price: $(element).text(),
        });
        console.log("working");
      });
    await new Promise((r) => {
      setTimeout(r, 500);
    });
    browser.close();
  }
};

const callEbay = async () => {
  console.log("callebaystart");
  for (let z = 0; z < itemNames.length; z++) {
    await new Promise((r) => {
      setTimeout(r, 500);
      fetch(
        `https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByKeywords` +
          `&SECURITY-APPNAME=${process.env.SECURITY_APPNAME}` +
          `&RESPONSE-DATA-FORMAT=JSON` +
          `&GLOBAL-ID=EBAY-US` +
          `&keywords=${itemNames[z].title}` +
          `&paginationInput.entriesPerPage=1`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("searching");
          ebayList.push(data);
        })
        .catch((err) => err);
    });
  }
};

const sendEbay = async () => {
  const combinedList1 = [];
  const combinedList2 = [];
  const combinedEbay = [];
  for (let v = 0; v < 100; v++) {
    await new Promise((r) => {
      setTimeout(r, 100);
      combinedList1.push({
        ...itemNames[v],
        ...priceList[v],
      });
      console.log("combining");
    });
  }
  for (let b = 100; b < itemNames.length; b++) {
    await new Promise((r) => {
      setTimeout(r, 100);
      combinedList2.push({
        ...itemNames[b],
        ...priceList[b],
      });
      console.log("combining");
    });
  }

  for (let q = 0; q < ebayList.length; q++) {
    await new Promise((r) => {
      setTimeout(r, 100);
      combinedEbay.push({
        ...ebayList[q],
      });
      console.log("combining2");
    });
  }
  console.log("sendebay");
  const ebaystr = JSON.stringify(combinedEbay);

  //redis
  await new Promise((r) => {
    setTimeout(r, 10000);
    db.collection("combinedGC").doc("gcdata").set({ combinedList1 });
    db.collection("combinedGC").doc("gcdata2").set({ combinedList2 });
    const redis = require("redis");
    const client = redis.createClient({
      host: "redis-10514.c60.us-west-1-2.ec2.cloud.redislabs.com",
      port: 10514,
      password: process.env.REDIS_PASSWORD,
    });
    client.on("error", function (error) {
      console.error(error);
    });
    client.set("findItemsByKeywordsResponse", ebaystr, redis.print);
    setTimeout(r, 10000);
    client.quit();
  });
};

const getAll = async () => {
  await crawler(), await callEbay(), await sendEbay();
};

getAll();

module.exports = crawler;
