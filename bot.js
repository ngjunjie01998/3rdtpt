// TelegramBot (ExcellenceSafetyBot)
// Credits
// Created by Evgenii Mironichev, Copyright 2016,
// Edited by Ng Jun Jie
// Saftey Texts by Melvin
// Route Card by Owen,Ernest,Jun Jie

var config = require('./config'); // rename config.js.example into config.js and set keys and tokens inside of it

var Bot = require('node-telegram-bot-api');
var bot;

if(process.env.NODE_ENV === 'production') {
  bot = new Bot(config.TelegramToken);
  bot.setWebHook(config.TelegramProductionURL + bot.token);
}
else {
  bot = new Bot(config.TelegramToken, { polling: true });
}


console.log('ExcellenceSafetyBot commence...');

// url link for google sheet with easy configuration ()./config)
var url = "https://spreadsheets.google.com/feeds/list/" + config.googleSheetKey + "/od6/public/values?alt=json";


bot.onText(/(.+)$/, function (msg, match) {
    // keywords are anything typed in by user
  var keywords = match[1];
  var request = require("request");

    // request to retrieve the spreadsheet as the JSON
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
        // getting data from google sheet and format them
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
                    (keywords.toLowerCase().match(itemTitle.toLowerCase()) 	) // if keyword match the specific keyword from google sheet(lower case)
                    )
                {

                    if (itemsFound==0)
                        formattedAnswer += "";
                    else
                        formattedAnswer += "";

                    itemsFound++;
                    formattedAnswer +=  item.content.$t; // add item content from googlesheet
                }

        });

        // if no content is found from googlesheet for keyword
        if (itemsFound == 0)
        {
            if (list<0 || list>24)
                formattedAnswer = "Sorry, I don't quite understand you.";
            else
                formattedAnswer = "Sorry, I don't quite understand you.";

        }

        // prompt telegrambot to send message
        var newanswer = formattedAnswer.replace(/_cokwr: /gi,""); // to remove header

        bot.sendMessage(msg.chat.id, newanswer).then(function () {
            // reply sent!
        });

    });

});

module.exports = bot;
