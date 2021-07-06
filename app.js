const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const crawlerAPIrouter = require("./routes/crawlerAPI");
const cors = require("cors");

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/crawlerAPI", crawlerAPIrouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//crawler
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const itemNames = [];
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
  .catch(console.error);
}

const sendData = async () => {
  await crawler()
  await callEbay()
  const redis = require("redis");
    const promise = new Promise((resolve, reject) => {
        setTimeout(() => resolve(itemNames), 10000)
      });
    
    const response = await promise
    console.log(response)
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
    //client.set('itemSearchURL', ebayList, redis.print)
}


const ebayList = []//move this in function

const callEbay = async () => {
  await crawler()
  fetch(
    `https://svcs.sandbox.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByKeywords`+
      `&SECURITY-APPNAME=RobertCh-auctionc-SBX-c58419a39-58c60cb7`+
      `&RESPONSE-DATA-FORMAT=JSON`+
      `&GLOBAL-ID=EBAY-ENCA`+
      `&REST-PAYLOAD`+
      `&keywords=blue%20shoes`
  )
.then((response) => response.json())
//.then((response) => ebayJSON = convert.xml2json(response, {compact: true, spaces: 4}))
//.then(
.then(data => {
    return console.log(data);
  })
.catch((err) => err);
}



crawler()
sendData()
callEbay()
setInterval(function () { sendData(); }, 600*1000*Math.random())
  
module.exports = app;
