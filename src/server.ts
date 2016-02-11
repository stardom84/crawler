var Crawler = require('simplecrawler'),
	FetchQueue = require('simplecrawler/lib/queue.js'),
	fs = require('fs'),
	request = require('request'),
	url = require('url'),
	path = require('path');

var domain = 'www.musinsa.com',
	paths = '/index.php?r=home&a=login&isSSL=&referer=&usessl=&id=sawadee&pw=sawadee1919&idpwsave=checked',
	port = 80;
// paths = '/index.php?m=street&gender=f&_y=2016%2C2015%2C2014&_mon=&p=',

var myCrawler = new Crawler(domain, paths + '1', port);
var download = (uri:string, filename:string, dest:string, callback:Function) => {
	request.head(uri, (err:Object, res:Object) => {
		request(uri)
			.pipe(fs.createWriteStream(dest))
			.on('close', callback);
	});
};

var setConfig = () => {
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

	myCrawler.addFetchCondition((parsedURL:Object) => {
		return parsedURL.path.match(/(\.jpg)/ig);
	});
};

var setListeners = () => {
	myCrawler
		.on('addcookie ', (cookie:any) => {
			console.log('cookie====>>>', cookie);
		})
		.on('fetchstart', (queueItem:Object, requestOptions:any) => {
			console.log('start!');

			requestOptions.method = 'POST';
			requestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';


			console.log('queueItem', queueItem);
			console.log('requestOptions', requestOptions);
		})
		.on('discoverycomplete', (queueItem:any, resources:any) => {
			/*myCrawler.queue = new FetchQueue();
			 resources.forEach((url:string) => {
			 if (/list.street_list/g.test(url)) {
			 myCrawler.queueURL(url);
			 }
			 });*/

			console.log('discoverycomplete!');
		})
		.on('fetchcomplete', (queueItem:any, responseBuffer:any, response:any) => {
			console.log('Completed fetching resource:', queueItem.url);

			myCrawler.queueURL('http://www.musinsa.com/index.php?m=street&_y=2015&uid=23526');
			// parse url
			var parsed = url.parse(queueItem.url);


			// where to save downloaded data
			var outputDirectory = path.join(__dirname, domain);

			// get directory name in order to create any nested dirs
			var dirname = outputDirectory;

			// path to save file
			var filepath = path.join(outputDirectory, parsed.pathname.split('/').slice(-1)[0]);

			// check if DIR exists
			fs.exists(dirname, (exists:any) => {

				// if DIR exists, write file
				if (exists) {
					fs.writeFile(filepath, responseBuffer, () => {
						//
					});
				} else {
					// else, recursively create dir using node-fs, then write file
					fs.mkdir(dirname, 0755, true, () => {
						fs.writeFile(filepath, responseBuffer, () => {
							//
						});
					});
				}

			});

			console.log('I just received %s (%d bytes)', queueItem.url, responseBuffer.length);
			console.log('It was a resource of type %s', response.headers['content-type']);

		})
		.on('complete', () => {
			/*myCrawler = new Crawler(domain, paths + '2', port);
			 setListeners();
			 setConfig();
			 myCrawler.start();*/
			console.log('Completed');
		});
};

setListeners();
setConfig();
myCrawler.start();
