//
//  RTD2 - Twitter bot that tweets about the most popular github.com news
//  Also makes new friends and prunes its followings.
//
var Bot = require('./utils/bot');
var config1 = require('./config/auth');
var bot = new Bot(config1);

console.log('RTD2: Running.');

//get date string for today's date (e.g. '2011-01-01')
function datestring () {
  var d = new Date(Date.now() - 5*60*60*1000);  //est timezone
  return d.getUTCFullYear()   + '-'
     +  (d.getUTCMonth() + 1) + '-'
     +   d.getDate();
}

function log( msg ) {
  console.log('\n' + new Date() + ' ::: ' + msg );
}

setInterval(function() {
  bot.twit.get('followers/ids', function(err, reply) {
    if(err) return handleError(err, 'followers/ids');
    log('# followers: ' + reply.ids.length);
  });

  // Generate random number for frequency bot action check.
  var rand = Math.random();

  
  if(rand <= 0.01) {  // tweet popular github tweet.
    var params = {
        q: 'github.com/', 
        since: datestring(),
        result_type: 'mixed'
    };

    bot.twit.get('search/tweets', params, function (err, reply) {
      if(err) return handleError(err, 'search/tweets');

      var max = 0, popular;

      var tweets = reply.statuses
        , i = tweets.length;

      while(i--) {
        var tweet = tweets[i];
        var tweetLength = tweet.length;
        var popularity = tweet.retweet_count;

        if(tweetLength > 110) {
          log('Tweet is too long to RT: ' + tweetLength);
          continue;
        }

        if(popularity > max) {
          max = popularity;
          popular = tweet.text;
        }
      }

      bot.tweet(popular, function (err, reply) {
        if(err) return handleError(err);

        log('Tweet: ' + (reply ? reply.text : reply));
      });
    });
  } else if(rand <= 0.36) { // make a friend.
    bot.mingle(function(err, reply) {
      if(err) {
        handleError(err, 'mingle');
      } else {
        log('Mingle: followed @' + reply.screen_name);
      }
    });
  } else {                  //  prune a friend
    var params = {
      count: 1
    };

    // Check if AutoTweetie has at least one user. Disliked seeing 404.
    // So friend check first.
    bot.twit.get('friends/list',  params, function(err, result) {
      if(err) return handleError(err, 'friends/list');
      var hasUsers = result.users && result.users.length;

      if(!hasUsers) {
        log('No users pruned.');
        return;
      }

      bot.prune(function(err, reply) {
        if(err) return handleError(err, 'prune');

        log('Prune: unfollowed @'+ reply.screen_name);
      });
    });
  }
}, 180000);

function handleError(err, funcName) {
  console.error('\n:::     ERROR     :::');
  console.error(new Date());
  console.error('function called: ' + funcName);
  console.error('response status:', err.statusCode);
  console.error('data:', err.message);
}