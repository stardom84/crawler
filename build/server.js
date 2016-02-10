var Crawler = require('simplecrawler'), fs = require('fs'), request = require('request'), url = require('url'), path = require('path');
var domain = 'www.musinsa.com';
var myCrawler = new Crawler(domain);
var download = function (uri, filename, dest, callback) {
	request.head(uri, function (err, res) {
		request(uri)
			.pipe(fs.createWriteStream(dest))
			.on('close', callback);
	});
};
myCrawler.initialPath = '/index.php?m=street&gender=f&_y=2016%2C2015%2C2014&_mon=&p=1';
myCrawler.initialPort = 80;
myCrawler.initialProtocol = 'http';
myCrawler.maxDepth = 1;
myCrawler.userAgent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.16 Safari/537.36';
myCrawler.supportedMimeTypes.push(/^image\/jpeg/i);
myCrawler.supportedMimeTypes.push(/^image\/jpeg/i);
myCrawler
	.on('fetchstart', function (queueItem, requestOptions) {
		console.log('start!');
		console.log('queueItem', queueItem);
		console.log('requestOptions', requestOptions);
	})
	.on('discoverycomplete', function (queueItem, resources) {
		console.log('discoverycomplete!');
	})
	.on('fetchcomplete', function (queueItem, responseBuffer, response) {
		console.log('Completed fetching resource:', queueItem.url);
		// parse url
		var parsed = url.parse(queueItem.url);
		// where to save downloaded data
		var outputDirectory = path.join(__dirname, domain);
		// get directory name in order to create any nested dirs
		var dirname = outputDirectory + parsed.pathname.replace(/\/[^\/]+$/, '');
		// path to save file
		var filepath = outputDirectory + parsed.pathname;
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
				fs.mkdir(dirname, '\u0755', true, function () {
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
		console.log('Completed');
	});
myCrawler.start();
