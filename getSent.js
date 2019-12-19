var Sentiment = require('sentiment');

var sentiment = new Sentiment();
var options = {
    extras: {
        'buy': 5,
        'long': 5,
        'sell': -5,
        'short': -5,
        'hold': 0,
        'up': 1,
        'down': -1,
        'collapse': -10,
        'beating': 3
    }
}

module.exports = function(txt) {
    const sentObj = sentiment.analyze(txt, options);
    sentObj.origText = txt;
    return sentObj
}


