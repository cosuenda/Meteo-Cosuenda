
const rssUrl = "https://api.allorigins.win/raw?url=" + 
  encodeURIComponent("https://www.meteoclimatic.net/feed/rss_es.xml");

fetch(rssUrl)
  .then(res => res.text())
  .then(data => {
    console.log(data.includes("ESARA5000000050409A"));
  });

