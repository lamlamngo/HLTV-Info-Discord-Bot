const { HLTV } = require('hltv')

var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

var listofteams = {}
var listofplayers = {}
var update = false

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
                  message: 'Supported commands: ranking + #val, team + #teamName, player + #playerName'
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
                  bot.sendMessage({
                    to: channelID,
                    message: "i only work with teams in top 30 lel"
                  })
                }
              }
              break;
          case "player":
            if (val.toLowerCase() in listofplayers) {
              HLTV.getPlayer({id: listofplayers[val.toLowerCase()]}).then(res => {
                var messageReturn = `Name: ${res["name"]} \nAge: ${res["age"]}
                \nCountry: ${res["country"]["name"]} \nTeam: ${res["team"]["name"]}
                \nRating: ${res["statistics"]["rating"]} Over ${res["statistics"]["mapsPlayed"]} maps played last 3 months.
                \nAchievements: `

                var to_go = 0
                if (res["achievements"].length > 5) {
                  to_go = 5
                } else {
                  to_go = res["achievements"].length
                }

                for (var i = 0; i < to_go; i++) {
                  if (i == to_go - 1) {
                    messageReturn += `${res["achievements"][i]["place"]} at ${res["achievements"][i]["event"]["name"]} \n`
                  } else {
                    messageReturn += `${res["achievements"][i]["place"]} at ${res["achievements"][i]["event"]["name"]}, `
                  }
                }

                bot.sendMessage({
                  to: channelID,
                  message: messageReturn
                })
              })
            } else {
              bot.sendMessage({
                to: channelID,
                message: "no ur mom is not in a top 30 team"
              })
            }
            break;
        case "watch":
         try {
           HLTV.connectToScorebot({id: "2326808", onScoreboardUpdate: (data) => {
           }, onLogUpdate: (data) => {
             if (update) {
               var messageToSend = ""

               if ("RoundStart" in data) {
                 messageToSend += "Round just started. \n"
               }

               if ("Kill" in data) {
                 messageToSend += `${messageToSend["Kill"]["killerName"]} (${messageToSend["Kill"]["killerSide"]})
                 just killed ${messageToSend["Kill"]["victimName"]} with ${messageToSend["Kill"]["weapon"]} \n`
               }

               if ("BombPlanted" in data) {
                 messageToSend += `${messageToSend["BombPlanted"]["playerName"]} just planted the bomb
                 in a ${messageToSend["BombPlanted"]["tPlayers"]} (T) vs ${messageToSend["BombPlanted"]["ctPlayers"]} (CT) situation, \n`
               }

               if ("BombDefused" in data) {
                 messageToSend += `${messageToSend["BombDefused"]["playerName"]} just defused the bomb. \n`
               }

               if ("RoundEnd" in data) {
                 messageToSend += `Round just ended. \nWinner: ${messageToSend["RoundEnd"]["winner"]} \nWin By: ${messageToSend["RoundEnd"]["winType"]}
                 \nScore: CT ${messageToSend["RoundEnd"]["counterTerroristScore"]} vs T ${messageToSend["RoundEnd"][terroristScore]} \n`
               }

               bot.sendMessage({
                 to: channelID,
                 message: messageToSend
               })
             }
           }, onConnect: (data) => {
             bot.sendMessage({
               to: channelID,
               message: "Connected"
             })
             update = true
           }})
         } catch(e) {
           logger.info("CAUGHT")
  // expected output: "Parameter is not a number!"
        }
          break;
        case "stop":
          update = false
          break;
        case "matchByTeam":
        HLTV.getMatches().then((res) => {
          var messageToSend = ""
          for (var i = 0; i < res.length; i++){
            if (res[i]["team1"]) {
              if (res[i]["team1"]["name"].toLowerCase() == val) {
                if (res[i]["live"]) {
                    messageToSend += `${val} has a live game vs ${res[i]["team2"]["name"]}.\nType !!watch ${res[i]["id"]} to listen to live tickers.`
                } else {
                  messageToSend += `${val} has an upcoming game vs ${res[i]["team2"]["name"]}.\nType !!watch ${res[i]["id"]} to listen to live tickers.`
                }

                i = res.length
              }
            }

          if (res[i]["team2"]) {
            if (res[i]["team2"]["name"].toLowerCase() == val) {
              if (res[i]["live"]) {
                  messageToSend += `${val} has a live game vs ${res[i]["team1"]["name"]} at ${res[i]["event"]["name"]}.\nType !!watch ${res[i]["id"]} to listen to live tickers.`
              } else {
                messageToSend += `${val} has an upcoming game vs ${res[i]["team1"]["name"]} at ${res[i]["event"]["name"]}.\nType !!watch ${res[i]["id"]} to listen to live tickers when it goes live.`
              }

              i = res.length
            }
        }
          }

          if (val != "") {
            bot.sendMessage({
              to: channelID,
              message: messageToSend
            })
          } else {
            bot.sendMessage({
              to: channelID,
              message: `There is no live or upcoming games for ${val}`
            })
          }
        })
        break;
         }
     }
});
