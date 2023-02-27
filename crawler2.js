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
const sessionID = [];

const sessionGrab = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://www.bcauction.ca/open.dll/");
  const cookies = await page.cookies();
  await page.setCookie(cookies[0], cookies[1]);
  console.log(cookies);
  sessionID.push(cookies[1]);
  browser.close();
};

const urls = [
  "https://www.bcauction.ca/open.dll/submitDocSearch?doc_search_by=TendSimp&searchResult=True&isChanged=no&dllAnchor=allOpenOpportunities&productDisID=simpleAll&productDesc=Browse%20All%20Open%20Auctions&UseProfile=&drillProductDisID=&AuctionNew_help=This%20is%20a%20new%20auction%20that%20you%20have%20not%20viewed%20before&AuctionChanged_help=This%20is%20an%20amended%20auction%20notice&AuctionOpen_help=This%20is%20a%20currently%20open%20auction&dllPage=open_tenders_basic_content.html&dllAnchor_pageLevel=pageLevel&Keyword=&orgPoptID=-1&field_disID1=5810716&field_disID2=4460126&field_disID3=4369494&field_disID4=5033717&field_disID5=4791529&field_disID6=6987006&field_disID7=4357614&field_disID8=4357626&field_disID9=7018662&field_disID10=4369502&field_disID11=6987010&field_disID12=4357610&field_disID13=4357618&field_disID14=5033721&field_disID15=4369506&field_disID16=6212297&field_disID17=5519821&field_disID18=4791533&field_disID19=4460122&field_disID21=4357622&field_disID22=4369478&field_disID23=4369498&fieldCount=23&display_order=EndingFirst&sessionID=" +
    sessionID[0] +
    "&document_search_status=Active&selected_org_active=All&search_DocType=All&search_DocTypeQual=All&recordNum=0&currentPage=1",
  "https://www.bcauction.ca/open.dll/submitDocSearch?doc_search_by=TendSimp&searchResult=True&isChanged=no&dllAnchor=allOpenOpportunities&productDisID=simpleAll&productDesc=Browse%20All%20Open%20Auctions&UseProfile=&drillProductDisID=&AuctionNew_help=This%20is%20a%20new%20auction%20that%20you%20have%20not%20viewed%20before&AuctionChanged_help=This%20is%20an%20amended%20auction%20notice&AuctionOpen_help=This%20is%20a%20currently%20open%20auction&dllPage=open_tenders_basic_content.html&dllAnchor_pageLevel=pageLevel&Keyword=&orgPoptID=-1&field_disID1=5810716&field_disID2=4460126&field_disID3=4369494&field_disID4=5033717&field_disID5=4791529&field_disID6=6987006&field_disID7=4357614&field_disID8=4357626&field_disID9=7018662&field_disID10=4369502&field_disID11=6987010&field_disID12=4357610&field_disID13=4357618&field_disID14=5033721&field_disID15=4369506&field_disID16=6212297&field_disID17=5519821&field_disID18=4791533&field_disID19=4460122&field_disID21=4357622&field_disID22=4369478&field_disID23=4369498&fieldCount=23&display_order=EndingFirst&sessionID=" +
    sessionID[0] +
    "&document_search_status=Active&selected_org_active=All&search_DocType=All&search_DocTypeQual=All&recordNum=31&currentPage=2",
  "https://www.bcauction.ca/open.dll/submitDocSearch?doc_search_by=TendSimp&searchResult=True&isChanged=no&dllAnchor=allOpenOpportunities&productDisID=simpleAll&productDesc=Browse%20All%20Open%20Auctions&UseProfile=&drillProductDisID=&AuctionNew_help=This%20is%20a%20new%20auction%20that%20you%20have%20not%20viewed%20before&AuctionChanged_help=This%20is%20an%20amended%20auction%20notice&AuctionOpen_help=This%20is%20a%20currently%20open%20auction&dllPage=open_tenders_basic_content.html&dllAnchor_pageLevel=pageLevel&Keyword=&orgPoptID=-1&field_disID1=5810716&field_disID2=4460126&field_disID3=4369494&field_disID4=5033717&field_disID5=4791529&field_disID6=6987006&field_disID7=4357614&field_disID8=4357626&field_disID9=7018662&field_disID10=4369502&field_disID11=6987010&field_disID12=4357610&field_disID13=4357618&field_disID14=5033721&field_disID15=4369506&field_disID16=6212297&field_disID17=5519821&field_disID18=4791533&field_disID19=4460122&field_disID21=4357622&field_disID22=4369478&field_disID23=4369498&fieldCount=23&display_order=EndingFirst&sessionID=" +
    sessionID[0] +
    "&document_search_status=Active&selected_org_active=All&search_DocType=All&search_DocTypeQual=All&recordNum=61&currentPage=3",
  "https://www.bcauction.ca/open.dll/submitDocSearch?doc_search_by=TendSimp&searchResult=True&isChanged=no&dllAnchor=allOpenOpportunities&productDisID=simpleAll&productDesc=Browse%20All%20Open%20Auctions&UseProfile=&drillProductDisID=&AuctionNew_help=This%20is%20a%20new%20auction%20that%20you%20have%20not%20viewed%20before&AuctionChanged_help=This%20is%20an%20amended%20auction%20notice&AuctionOpen_help=This%20is%20a%20currently%20open%20auction&dllPage=open_tenders_basic_content.html&dllAnchor_pageLevel=pageLevel&Keyword=&orgPoptID=-1&field_disID1=5810716&field_disID2=4460126&field_disID3=4369494&field_disID4=5033717&field_disID5=4791529&field_disID6=6987006&field_disID7=4357614&field_disID8=4357626&field_disID9=7018662&field_disID10=4369502&field_disID11=6987010&field_disID12=4357610&field_disID13=4357618&field_disID14=5033721&field_disID15=4369506&field_disID16=6212297&field_disID17=5519821&field_disID18=4791533&field_disID19=4460122&field_disID21=4357622&field_disID22=4369478&field_disID23=4369498&fieldCount=23&display_order=EndingFirst&sessionID=" +
    sessionID[0] +
    "&document_search_status=Active&selected_org_active=All&search_DocType=All&search_DocTypeQual=All&recordNum=91&currentPage=4",
  "https://www.bcauction.ca/open.dll/submitDocSearch?doc_search_by=TendSimp&searchResult=True&isChanged=no&dllAnchor=allOpenOpportunities&productDisID=simpleAll&productDesc=Browse%20All%20Open%20Auctions&UseProfile=&drillProductDisID=&AuctionNew_help=This%20is%20a%20new%20auction%20that%20you%20have%20not%20viewed%20before&AuctionChanged_help=This%20is%20an%20amended%20auction%20notice&AuctionOpen_help=This%20is%20a%20currently%20open%20auction&dllPage=open_tenders_basic_content.html&dllAnchor_pageLevel=pageLevel&Keyword=&orgPoptID=-1&field_disID1=5810716&field_disID2=4460126&field_disID3=4369494&field_disID4=5033717&field_disID5=4791529&field_disID6=6987006&field_disID7=4357614&field_disID8=4357626&field_disID9=7018662&field_disID10=4369502&field_disID11=6987010&field_disID12=4357610&field_disID13=4357618&field_disID14=5033721&field_disID15=4369506&field_disID16=6212297&field_disID17=5519821&field_disID18=4791533&field_disID19=4460122&field_disID21=4357622&field_disID22=4369478&field_disID23=4369498&fieldCount=23&display_order=EndingFirst&sessionID=" +
    sessionID[0] +
    "&document_search_status=Active&selected_org_active=All&search_DocType=All&search_DocTypeQual=All&recordNum=121&currentPage=5",
  "https://www.bcauction.ca/open.dll/submitDocSearch?doc_search_by=TendSimp&searchResult=True&isChanged=no&dllAnchor=allOpenOpportunities&productDisID=simpleAll&productDesc=Browse%20All%20Open%20Auctions&UseProfile=&drillProductDisID=&AuctionNew_help=This%20is%20a%20new%20auction%20that%20you%20have%20not%20viewed%20before&AuctionChanged_help=This%20is%20an%20amended%20auction%20notice&AuctionOpen_help=This%20is%20a%20currently%20open%20auction&dllPage=open_tenders_basic_content.html&dllAnchor_pageLevel=pageLevel&Keyword=&orgPoptID=-1&field_disID1=5810716&field_disID2=4460126&field_disID3=4369494&field_disID4=5033717&field_disID5=4791529&field_disID6=6987006&field_disID7=4357614&field_disID8=4357626&field_disID9=7018662&field_disID10=4369502&field_disID11=6987010&field_disID12=4357610&field_disID13=4357618&field_disID14=5033721&field_disID15=4369506&field_disID16=6212297&field_disID17=5519821&field_disID18=4791533&field_disID19=4460122&field_disID21=4357622&field_disID22=4369478&field_disID23=4369498&fieldCount=23&display_order=EndingFirst&sessionID=" +
    sessionID[0] +
    "&document_search_status=Active&selected_org_active=All&search_DocType=All&search_DocTypeQual=All&recordNum=151&currentPage=6",
  "https://www.bcauction.ca/open.dll/submitDocSearch?doc_search_by=TendSimp&searchResult=True&isChanged=no&dllAnchor=allOpenOpportunities&productDisID=simpleAll&productDesc=Browse%20All%20Open%20Auctions&UseProfile=&drillProductDisID=&AuctionNew_help=This%20is%20a%20new%20auction%20that%20you%20have%20not%20viewed%20before&AuctionChanged_help=This%20is%20an%20amended%20auction%20notice&AuctionOpen_help=This%20is%20a%20currently%20open%20auction&dllPage=open_tenders_basic_content.html&dllAnchor_pageLevel=pageLevel&Keyword=&orgPoptID=-1&field_disID1=5810716&field_disID2=4460126&field_disID3=4369494&field_disID4=5033717&field_disID5=4791529&field_disID6=6987006&field_disID7=4357614&field_disID8=4357626&field_disID9=7018662&field_disID10=4369502&field_disID11=6987010&field_disID12=4357610&field_disID13=4357618&field_disID14=5033721&field_disID15=4369506&field_disID16=6212297&field_disID17=5519821&field_disID18=4791533&field_disID19=4460122&field_disID21=4357622&field_disID22=4369478&field_disID23=4369498&fieldCount=23&display_order=EndingFirst&sessionID=" +
    sessionID[0] +
    "&document_search_status=Active&selected_org_active=All&search_DocType=All&search_DocTypeQual=All&recordNum=181&currentPage=7",
];

const bcCrawler = async () => {
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const browser = await puppeteer.launch();
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    await page.goto(url);
    const content = await page.content();
    await new Promise((r) => {
      setTimeout(r, 500);
      //cheerio
      const $ = cheerio.load(content);
      const cleaner = /(?<![\b])[a-zA-Z0-9]*/g;
      //regex pulling in extra numbers
      $("span[class=searchResultsTitle]")
        .find("b")
        .each(function (index, element) {
          console.log(index + "itemname");
          itemNames.push({
            title: $(element)
              .text()
              .match()
              .filter((entry) => /\S/.test(entry))
              .join(" ")
              .slice(0, -6),
          });
          console.log(itemNames);
        });
      browser.close();
    });
  }
};

const crawler2 = async () => {
  sessionGrab(), bcCrawler();
};

crawler2();

module.exports = crawler2;
