'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _xml2js = require('xml2js');

var _config = require('./config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Available RSS links
 * 
 * @export
 * @class RSS
 */
var RSS =

/**
 * Creates an instance of RSS.
 * 
 * @param {string} type 
 * @param {any} callback 
 * 
 * @memberOf RSS
 */
function RSS(type, callback) {
  _classCallCheck(this, RSS);

  var URL = '/' + type;
  var uri = '' + _config.CONFIG.BASE + _config.CONFIG.RSS + URL;

  (0, _request2.default)({ uri: uri }, function (error, response, body) {
    (0, _xml2js.parseString)(body, function (err, result) {
      var length = result.rss.channel[0].item.length;
      var rss = [];

      for (var i = 0; i < length; i++) {
        var obj = {
          title: result.rss.channel[0].item[i].title[0],
          description: result.rss.channel[0].item[i].description[0],
          link: result.rss.channel[0].item[i].link[0],
          date: result.rss.channel[0].item[i].pubDate[0]
        };

        rss.push(obj);
      }

      callback(rss, err);
    });
  });
};

exports.default = RSS;