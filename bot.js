const { HLTV } = require('hltv')

var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

var listofteams = {}
var listofplayers = {}

HLTV.getTeamRanking().then(res => {
  for (var i = 0; i < res.length; i++) {
    listofteams[res[i]["team"]["name"].toLowerCase()] = res[i]["team"]["id"]
    HLTV.getTeam({id: res[i]["team"]["id"]}).then(res_1 => {
      for (var j = 0; j < res_1["players"].length; j++) {
        listofplayers[res_1["players"][j]["name"].toLowerCase()] = res_1["players"][j]["id"]
      }
    })
  }
})


logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
    bot.setPresence({ game: { name: "Type ``!!supported`` to get started", type: 0 } });
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 2) == '!!') {
        var args = message.substring(2).split(' ');

        var cmd = ""
        var val = ""
        if (args.length == 2) {
          cmd = args[0]
          val = args[1]
        } else if (args.length == 1) {
          cmd = args[0]
        } else if (args.length == 3) {
          cmd = args[0]
          val = `${args[1]} ${args[2]}`
        }

        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
                break;
            case 'supported':
              logger.info(Object.keys(listofteams).length)
              bot.sendMessage({
                  to: channelID,
                  message: 'Supported commands: ranking + #val, team + #teamName'
              });
              break;
            case 'ranking':
                HLTV.getTeamRanking().then(res => {
                  var message_rank = ''

                  if (val == "") {
                    bot.sendMessage({
                      to: channelID,
                      message: "enter a number yo"
                    })
                  } else {
                    var integer = parseInt(val, 10);

                    for (var i = 0; i < val; i++) {
                      // message_rank += "Rank " + res[i]["place"] + ": " + res[i]["team"]["name"] + ", " + res[i]["points"] + ", team ID: " + res[i]["team"]["id"]
                      message_rank += `Rank ${res[i]["place"]}: ${res[i]["team"]["name"]}, ${res[i]["points"]}, team ID: ${res[i]["team"]["id"]} \n`
                    }

                    bot.sendMessage({
                      to: channelID,
                      message: message_rank
                    })
                  }

                })
                break;
            case 'team':
              if (val == "") {
                bot.sendMessage({
                  to: channelID,
                  message: "enter a name yo"
                })
              } else {
                if (val.toLowerCase() in listofteams) {
                  HLTV.getTeam({id: listofteams[val.toLowerCase()]}).then(res => {
                    var message_return = `Name: ${res["name"]} \nCountry: ${res["location"]} \nPlayers: `
                    for (var i = 0; i < res["players"].length; i++) {
                      if (i == res["players"].length - 1) {
                        message_return += `${res["players"][i]["name"]} \n`
                      } else {
                        message_return += `${res["players"][i]["name"]}, `
                      }
                    }

                    if (res["recentResults"].length > 0) {
                      message_return += `Recent Match: ${res["recentResults"][0]["result"]} vs ${res["recentResults"][0]["enemyTeam"]["name"]} at ${res["recentResults"][0]["event"]["name"]} \n`
                    }

                    if (res["bigAchievements"].length > 0) {
                      message_return += "Recent achievements: "
                      var to_go = 0
                      if (res["bigAchievements"].length > 5) {
                        to_go = 5
                      } else {
                        to_go = res["bigAchievements"].length
                      }

                      logger.info(to_go)

                      for (var j = 0; j < to_go; j++) {
                        if (j == to_go - 1) {
                          message_return += `${res["bigAchievements"][j]["place"]} at ${res["bigAchievements"][j]["event"]["name"]} \n`
                        } else {
                          message_return += `${res["bigAchievements"][j]["place"]} at ${res["bigAchievements"][j]["event"]["name"]}, `
                        }
                      }
                    }

                    bot.sendMessage({
                      to: channelID,
                      message: message_return
                    })
                  })
                } else {
                }
              }
            // Just add any case commands if you want to..
         }
     }
});
