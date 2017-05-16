const request = require('request');
const cheerio = require('cheerio');
const URL = require('url-parse');
var fs = require('fs');

var baseUrl = "https://medium.com";
var throttleSize = 5;

var linksVisited = [];
var linksToVisit = [];
var poolInitiated = false;
var currentConnections = 0;

linksToVisit.push(baseUrl + "/")
var start = new Date();
crawl();

function crawl() {
  if (linksToVisit.length > 0) {
    var nextUrl = linksToVisit.shift();
    if (linksVisited.indexOf(nextUrl) > -1) {
      crawl();
    } else {
      visitUrl(nextUrl);
    }
  } else {
    if (currentConnections == 0) {
      console.log(linksVisited);
      writeToCsv(linksVisited);
      var end = new Date();
      console.log("TimeTaken: " + (end - start) + " ms")
    }
    return;
  }
}

function visitUrl(url) {
  linksVisited.push(url);
  console.log("Visiting page " + url);
  currentConnections++;
  request(url, function(error, response, body) {
    if (response && response.statusCode == 200) {
      var parsedBody = cheerio.load(body);
      collectLinks(parsedBody, url);
      if (url == baseUrl + "/") {
        poolInitiated = true;
        crawl();
      }
    }
    currentConnections--;
    checkIfFree();
    console.log("concurrent connections: " + currentConnections);
  });
  if (poolInitiated) {
    checkIfFree();
  }
}

function collectLinks(parsedBody, url) {
  var relativeLinks = parsedBody("a[href^='/']");
  var absoluteLinks = parsedBody("a[href^='" + baseUrl + "']")
  relativeLinks.each(function() {
    var completeLink = baseUrl + parsedBody(this).attr('href');
    pushLinks(completeLink);
  });
  absoluteLinks.each(function() {
    var link = parsedBody(this).attr('href');
    pushLinks(link);
  });
  console.log("Relative links on page \"" + url + "\" = " + relativeLinks.length);
  console.log("Absolute links on page \"" + url + "\" = " + absoluteLinks.length);
  console.log("Links left to Visit ============> ", linksToVisit.length);
  console.log("Links Visited ==================> ", linksVisited.length);
}

function pushLinks(link){
  if (linksToVisit.indexOf(link) == -1 && linksVisited.indexOf(link) == -1) {
    linksToVisit.push(link);
  }
}

function checkIfFree() {
  if (currentConnections < throttleSize) {
    crawl();
  }
}

function writeToCsv(arr) {
  var file = fs.createWriteStream('array.csv');
  file.on('error', function(err) {
    console.log("Error creating csv")
  });
  file.write("Serial No.,Url\n");
  for (var i = 0; i < arr.length; i++) {
    file.write(i + 1 + "," + arr[i] + '\n');
  }
  file.end()
}
