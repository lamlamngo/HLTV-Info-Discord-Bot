'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _config = require('./config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Scraping matches
 * 
 * @export
 * @class Matches
 */
var Matches =

/**
 * Creates an instance of Matches.
 * 
 * @param {string} matchId
 * @param {any} callback 
 * 
 * @memberOf Matches
 */
function Matches(matchId, callback) {
  _classCallCheck(this, Matches);

  var uri = _config.CONFIG.BASE + '/' + matchId;

  (0, _request2.default)({ uri: uri }, function (error, response, body) {

    var $ = _cheerio2.default.load(body, {
      normalizeWhitespace: true
    });

    var stats = [];

    var allContent = $('.matchstats').find('#all-content');

    var team1Stats = allContent.children('table.table').first().children('tbody');
    var list1 = team1Stats.children('tr').not('.header-row');

    list1.each(function (i, element) {
      var el = $(element);
      var playerName = el.find('.players .gtSmartphone-only').text().replace(/'/g, '');
      var playerId = el.find('.players').children('a').attr('href');
      var kills = parseInt(el.find('td.kd').text().split('-')[0]);
      var deaths = parseInt(el.find('td.kd').text().split('-')[1]);
      var plusMinus = parseInt(el.find('td.plus-minus').text());
      var adr = parseFloat(el.find('td.adr').text(), 10);
      var kast = parseFloat(el.find('td.kast').text(), 10);
      var rating = parseFloat(el.find('td.rating').text(), 10);

      var objData = {
        playerName: playerName,
        playerId: playerId,
        kills: kills,
        deaths: deaths,
        plusMinus: plusMinus,
        adr: adr,
        kast: kast,
        rating: rating
      };

      stats.push(objData);
    });

    var team2Stats = allContent.children('table.table').last().children('tbody');
    var list2 = team2Stats.children('tr').not('.header-row');

    list2.each(function (i, element) {
      var el = $(element);
      var playerName = el.find('.players .gtSmartphone-only').text().replace(/'/g, '');
      var playerId = el.find('.players').children('a').attr('href');
      var kills = parseInt(el.find('td.kd').text().split('-')[0]);
      var deaths = parseInt(el.find('td.kd').text().split('-')[1]);
      var plusMinus = parseInt(el.find('td.plus-minus').text());
      var adr = parseFloat(el.find('td.adr').text(), 10);
      var kast = parseFloat(el.find('td.kast').text(), 10);
      var rating = parseFloat(el.find('td.rating').text(), 10);

      var objData = {
        playerName: playerName,
        playerId: playerId,
        kills: kills,
        deaths: deaths,
        plusMinus: plusMinus,
        adr: adr,
        kast: kast,
        rating: rating
      };

      stats.push(objData);
    });

    callback(stats, error);
  });
};

exports.default = Matches;