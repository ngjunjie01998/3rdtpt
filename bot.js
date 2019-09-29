// Credits
// Created by Evgenii Mironichev, Copyright 2016,
// based on this awesome tutorial: https://mvalipour.github.io/node.js/2015/11/10/build-telegram-bot-nodejs-heroku/
// Edited by Ng Jun Jie
// Saftey Texts by Melvin

var config = require('./config'); // rename config.js.example into config.js and set keys and tokens inside it

var Bot = require('node-telegram-bot-api');
var bot;

if(process.env.NODE_ENV === 'production') {
  bot = new Bot(config.TelegramToken);
  bot.setWebHook(config.TelegramProductionURL + bot.token);
}
else {
  bot = new Bot(config.TelegramToken, { polling: true });
}


console.log('3rdTptbot started...');


var url = "https://spreadsheets.google.com/feeds/list/" + config.googleSheetKey + "/od6/public/values?alt=json";


bot.onText(/(.+)$/, function (msg, match) {
    // keywords are anything typed in
  var keywords = match[1];
  var request = require("request");

    // send request to retrieve the spreadsheet as the JSON
    request(url, function (error, response, body) {
        if (error || response.statusCode != 200) {
            console.log('Error: '+error); // Show the error
            console.log('Status code: ' + response.statusCode); // Show the error
            return;
        }

        var parsed = JSON.parse(body);
        var list = NaN;
        if (!isNaN(keywords))   // isNaN returns false if the value is number
        {
            try{
                list = parseInt(keywords, 10);
            }
            catch(e){
                list = NaN;
            }
        }

        if (isNaN(list))
            list = -1;

        var formattedAnswer = "";

        var itemsFound = 0;
        // sending answers
        parsed.feed.entry.forEach(function(item){
                var msge = NaN;
                var itemTitle = item.title.$t
                try{
                    msge = parseInt(itemTitle, 10);
                }
                catch(e)
                {
                    msge = NaN;
                }

                if (
                    (!isNaN(msge) && msge == list) ||
                    (isNaN(msge) && itemTitle.toLowerCase().trim() == keywords.toLowerCase().trim())
                    )
                {
                    // add the line break if not the first answer
                    if (itemsFound==0)
                        formattedAnswer += "";
                    else
                        formattedAnswer += "\n\n";

                    itemsFound++;
                    formattedAnswer +=  item.content.$t; // add item content, '\u27a1' is the arrow emoji
                }

        });

        // if no items were found for the given time
        if (itemsFound == 0)
        {
            if (list<0 || list>24)
                formattedAnswer = "Input /help for guidance";
            else
                formattedAnswer = "Input /help for guidance";

        }

        // send message telegram finally
        var newanswer = formattedAnswer.replace("_cokwr: ","")
:
        bot.sendMessage(msg.chat.id, formattedAnswer).then(function () {
            // reply sent!
        });

    });

});

module.exports = bot;
