var Crawler = require('simplecrawler'), FetchQueue = require('simplecrawler/lib/queue.js'), fs = require('fs'), request = require('request'), url = require('url'), path = require('path');
var domain = 'www.musinsa.com', paths = '/index.php?m=street&gender=f&_y=2015%2C2014&uid=23526', port = 80;
// paths = '/index.php?m=street&gender=f&_y=2016%2C2015%2C2014&_mon=&p=',
var myCrawler = new Crawler(domain, paths + '1', port);
var download = function (uri, filename, dest, callback) {
	request.head(uri, function (err, res) {
		request(uri)
			.pipe(fs.createWriteStream(dest))
			.on('close', callback);
	});
};
var setConfig = function () {
	myCrawler.initialProtocol = 'http';
	myCrawler.maxDepth = 2;
	myCrawler.userAgent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.16 Safari/537.36';
	myCrawler.scanSubdomains = true;
	myCrawler.supportedMimeTypes = [];
	myCrawler.supportedMimeTypes = [
		/^text\/html/i,
		/^application\/octet\-stream/i
	];
	myCrawler.discoverRegex = [];
	myCrawler.discoverRegex.push(/\s(?:href|src)\s?=\s?(["']).*(jpg).*?\1/ig);
	myCrawler.addFetchCondition(function (parsedURL) {
		return parsedURL.path.match(/\.jpg/ig);
	});
};
var setListeners = function () {
	myCrawler
		.on('fetchstart', function (queueItem, requestOptions) {
			console.log('start!');
			console.log('queueItem', queueItem);
			console.log('requestOptions', requestOptions);
		})
		.on('discoverycomplete', function (queueItem, resources) {
			/*myCrawler.queue = new FetchQueue();
			 resources.forEach((url:string) => {
			 if (/list.street_list/g.test(url)) {
			 myCrawler.queueURL(url);
			 }
			 });*/
			console.log('discoverycomplete!');
		})
		.on('fetchcomplete', function (queueItem, responseBuffer, response) {
			console.log('Completed fetching resource:', queueItem.url);
			// parse url
			var parsed = url.parse(queueItem.url);
			// where to save downloaded data
			var outputDirectory = path.join(__dirname, domain);
			// get directory name in order to create any nested dirs
			var dirname = outputDirectory;
			// path to save file
			var filepath = path.join(outputDirectory, parsed.pathname.split('/').slice(-1)[0]);
			// check if DIR exists
			fs.exists(dirname, function (exists) {
				// if DIR exists, write file
				if (exists) {
					fs.writeFile(filepath, responseBuffer, function () {
						//
					});
				}
				else {
					// else, recursively create dir using node-fs, then write file
					fs.mkdir(dirname, 0755, true, function () {
						fs.writeFile(filepath, responseBuffer, function () {
							//
						});
					});
				}
			});
			console.log('I just received %s (%d bytes)', queueItem.url, responseBuffer.length);
			console.log('It was a resource of type %s', response.headers['content-type']);
		})
		.on('complete', function () {
			myCrawler = new Crawler(domain, paths + '2', port);
			setListeners();
			setConfig();
			myCrawler.start();
			console.log('Completed');
		});
};
setListeners();
setConfig();
myCrawler.start();
