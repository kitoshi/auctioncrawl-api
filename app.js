const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const dotenv = require("dotenv");
const fetch = require("node-fetch");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
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
app.use("/users", usersRouter);
app.use("/crawlerAPI", crawlerAPIrouter);
app.use("/ebayAPI", ebayAPIrouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

//redis
const redis = require("redis");
const { promisify } = require("util");
const client = redis.createClient({
  host: "redis-10514.c60.us-west-1-2.ec2.cloud.redislabs.com",
  port: 10514,
  password: "7e9Ui1fX1YsdPy2vJyxI9vsV0Fb9qZ7J",
});
const get = promisify(client.get).bind(client);
const set = promisify(client.set).bind(client);
const getList = promisify(client.lrange).bind(client);

//crawler
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const itemNames = [];
const priceList = [];
const combinedList = [];
const ebayList = [];
//const url =
// "https://www.gcsurplus.ca/mn-eng.cfm?&snc=wfsav&vndsld=0&sc=ach-shop&lci=&sf=ferm-clos&so=ASC&srchtype=&hpcs=&hpsr=&kws=&jstp=&str=1&&sr=1&rpp=25";
const url2 =
  "https://www.gcsurplus.ca/mn-eng.cfm?&snc=wfsav&vndsld=0&sc=ach-shop&lci=&sf=ferm-clos&so=ASC&srchtype=&hpcs=&hpsr=&kws=&jstp=&str=26&sr=1&rpp=25";
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
  //crawler is working dont touch
  await new Promise((r) => {
    setTimeout(r, 40000);
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      puppeteer
        .launch()
        .then((browser) => browser.newPage())
        .then(async (page) => {
          page.setDefaultNavigationTimeout(60000);
          return page.goto(url).then(function () {
            return page.content();
          });
        })
        .then(async(html) => {
          const cleaner = /(?<![\b])[a-zA-Z]*/g;
          const $ = cheerio.load(html);
          $("td[headers=itemInfo]")
            .find("a")
            .each(function (index, element) {
              itemNames.push({
                title: $(element)
                  .text()
                  .match(cleaner)
                  .filter((entry) => /\S/.test(entry))
                  .join(" "),
                link: "https://www.gcsurplus.ca/" + $(element).attr("href")
            })
            });
          $("dd[class=short]")
            .find("span")
            .each(function (index, element) {

              priceList.push({
                price: $(element).text(),
              });
              console.log("working");
            });
        })
        .catch(console.error);
    }
  });
};

 //move this in function

const callEbay = async () => {
  await new Promise((r) => {
    setTimeout(r, 10000);
    console.log(itemNames);
    console.log("callebaystart");
    for (let z = 0; z < itemNames.length; z++) {
      fetch(
        `https://svcs.sandbox.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByKeywords` +
          `&SECURITY-APPNAME=RobertCh-auctionc-SBX-c58419a39-58c60cb7` +
          `&RESPONSE-DATA-FORMAT=JSON` +
          `&GLOBAL-ID=EBAY-ENCA` +
          `&keywords=${itemNames[z].title}` +
          `&paginationInput.entriesPerPage=1`
      )
        .then((response) => response.json())
        .then((data) => {
          ebayList.push(data);
        })
        .catch((err) => err);
    }
  });
};

const sendEbay = async () => {
  await new Promise((r) => {
    setTimeout(r, 10000);
    for (let v = 0; v < itemNames.length; v++) {
      combinedList.push({
        ...itemNames[v],
        ...priceList[v],
      });
    }
  });
  await new Promise((r) => {
    setTimeout(r, 10000);
    console.log("sendebay");
    console.log(combinedList);
    const stringarr = JSON.stringify(combinedList);
    const ebaystr = JSON.stringify(ebayList);
    //redis post (set)
    client.on("error", function (error) {
      console.error(error);
    });
    client.set("findItemsByKeywordsResponse", ebaystr, redis.print);
    client.set("link", stringarr, redis.print);
  });
};

const getAll = async () => {
  await crawler(), await callEbay(), await sendEbay();
};

getAll();

module.exports = app;
