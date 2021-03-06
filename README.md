# auctionapi

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<p align="center">

  <h3 align="center">Auction Crawler API</h3>

  <p align="center">
    Backend CRUD and web crawler to populate and store auction data for price comparison
    <br />
    <br />
    <a href="https://gobidup.com">View Demo</a>
    ·
    <a href="https://github.com/kitoshi/auctioncrawl-api/issues">Report Bug</a>
    ·
    <a href="https://github.com/kitoshi/auctioncrawl-api/issues">Request Feature</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary><h2 style="display: inline-block">Table of Contents</h2></summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

 <a href="https://tradingfever.com">
 <img src="screenshots/projectscreenshot.png" alt="project screenshot" width="480" height="480"></img>
 </a>

This is the backend portion of a full stack web crawler price comparison. We are using puppeteer to create instances of a chrome browser to navigate to government surplus auction listings and scraping keywords, prices, and urls with filtering done by cheerio. The keywords pulled are then sent to Ebay's "finding" service api to find matches and receives the listing URL and price. All this data is then sent to a redis(free) hosted data storage, where express will route fetch requests from the frontend.

Here's why I built this:

    - The ability to compare over 250 items at once saves a huge amount of time
    - The backend can self update listings as auctions expire or prices change
    - Express is a great boilerplate solution for handling routing and fetch requests.
    - Cost of hosting is zero.

### Built With

- [node.js](https://nodejs.org/en/)
- [express](https://expressjs.com/)
- [puppeteer](https://developers.google.com/web/tools/puppeteer)
- [cheerio](https://cheerio.js.org/)
- [redis](https://redis.io/)
- [google cloud platform](https://cloud.google.com/)

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.

- npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/kitoshi/auctioncrawl-api.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```

<!-- USAGE EXAMPLES -->

## Usage

1. You will need a [redis](https://redislabs.com/try-free/) host to set "client" in app.js with a .env file for the password
   <br>
   <img src="screenshots/redisclient.png" alt="redis screenshot" width="480" height="240"></img>
2. You will also need an auction site to crawl (see urls & link in app.js), the one in the release is [GCSurplus](https://www.gcsurplus.ca/) (Canadian Federal Gov't)
   <br>
   <img src="screenshots/gcsurplus.png" alt="gc surplus screenshot" width="480" height="480"></img>
3. Last account is an [Ebay Developer account](https://developer.ebay.com/) needed for access to the API. You will have to replace SECURITY_APPNAME with your personal string.
   <br>
   <img src="screenshots/ebaysecurityappname.png" alt="ebay screenshot" width="480" height="240"></img>
4. Run with npm start - console will return messages while crawler is in progress. Done after two OK replies from redis
5. Server will run default on [http://localhost:9000/](http://localhost:9000/), GET data available on routes http://localhost:9000/crawlerAPI, http://localhost:9000/ebayAPI
6. For production, backend can be hosted on [google cloud platform](https://cloud.google.com/) using their [app engine](https://cloud.google.com/appengine/docs/standard/nodejs/building-app). I used their [SDK](https://cloud.google.com/sdk) to port to the cloud service by command line in my code editor.

<!-- ROADMAP -->

## Roadmap

See the [open issues](https://github.com/kitoshi/auctioncrawl-api/issues) for a list of proposed features (and known issues).

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<!-- CONTACT -->

## Contact

Robert K. Charlton - kitoshi.charlton@gmail.com

Project Link: [https://github.com/kitoshi/auctioncrawl-api](https://github.com/kitoshi/auctioncrawl-api)

<!-- ACKNOWLEDGEMENTS -->

## Acknowledgements

- [Brian Haley, framework planning and mentoring](https://github.com/brian-e-haley)
- [O. Drew, readme template](https://github.com/othneildrew/Best-README-Template)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/kitoshi/auctioncrawl-api.svg?style=for-the-badge
[contributors-url]: https://github.com/kitoshi/auctioncrawl-api/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/kitoshi/auctioncrawl-api.svg?style=for-the-badge
[forks-url]: https://github.com/kitoshi/auctioncrawl-api/network/members
[stars-shield]: https://img.shields.io/github/stars/kitoshi/auctioncrawl-api.svg?style=for-the-badge
[stars-url]: https://github.com/kitoshi/auctioncrawl-api/stargazers
[issues-shield]: https://img.shields.io/github/issues/kitoshi/auctioncrawl-api.svg?style=for-the-badge
[issues-url]: https://github.com/kitoshi/auctioncrawl-api/issues
[license-shield]: https://img.shields.io/github/license/kitoshi/auctioncrawl-api.svg?style=for-the-badge
[license-url]: https://github.com/kitoshi/auctioncrawl-api/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/robert-k-charlton/
