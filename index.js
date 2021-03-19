const axios = require('axios').default;
const crypto = require('crypto');
const { API_KEY, ACCESS_TOKEN } = require('./getCredentials');
const generateSignature = require('./generateSig');

const sleep = (durationInSec) => {
    console.log(`sleeping for ${durationInSec}s...`);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, durationInSec * 1000);
    });
}

const getBaseParams = ({ nonce, timestamp }) => {
    return {
        oauth_consumer_key: API_KEY,
        oauth_nonce: nonce,
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: timestamp,
        oauth_token: ACCESS_TOKEN,
        oauth_version: '1.0'
    }
}

const getTweetsId = async (user) => {
    console.log('Fetching set of tweets to delete...\n');

    const nonce = crypto.randomBytes(32).toString('hex');
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    const getTweetsParams = {
        ...getBaseParams({ nonce, timestamp }),
        screen_name: user,
        count: 190
    };

    const baseGetTweetsUrl = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
    const getTweetsUrl = `${baseGetTweetsUrl}?screen_name=${user}&count=190`;

    const getTweetsSig = generateSignature(getTweetsParams, 'GET', baseGetTweetsUrl);

    const getTweetsHeaders = {
        'Authorization': `OAuth oauth_consumer_key=${API_KEY},oauth_token=${ACCESS_TOKEN},oauth_signature_method=HMAC-SHA1,oauth_timestamp=${timestamp},oauth_nonce=${nonce},oauth_version=1.0,oauth_signature=${encodeURIComponent(getTweetsSig)}`
    };

    const getTweetsConf = {
        method: 'get',
        url: getTweetsUrl,
        headers: getTweetsHeaders
    };

    try {
        const response = await axios(getTweetsConf);
        const tweetIds = response.data.map(tweet => tweet.id_str);

        console.log(`Number of tweets to delete: ${tweetIds.length}\n`);
        
        return tweetIds;
    } catch (e) {
        console.log('error fetching tweets', e);
        console.log('data', e.response.data);
        return [];
    }
};

const deleteTweet = async (tweetId, timeBetweenDelInSec) => {
    console.log(`Deleting tweetId: ${tweetId}`);

    await sleep(timeBetweenDelInSec);
    
    const nonce = crypto.randomBytes(32).toString('hex');
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    const deleteTweetParams = {
        ...getBaseParams({ nonce, timestamp }),
    };

    const deleteTweetUrl = `https://api.twitter.com/1.1/statuses/destroy/${tweetId}.json`;
    
    const deleteTweetSig = generateSignature(deleteTweetParams, 'POST', deleteTweetUrl);

    const deleteTweetHeaders = {
        'Authorization': `OAuth oauth_consumer_key=${API_KEY},oauth_token=${ACCESS_TOKEN},oauth_signature_method=HMAC-SHA1,oauth_timestamp=${timestamp},oauth_nonce=${nonce},oauth_version=1.0,oauth_signature=${encodeURIComponent(deleteTweetSig)}`
    };

    const deleteTweetConf = {
        method: 'post',
        url: deleteTweetUrl,
        headers: deleteTweetHeaders
    };

    try {
        const response = await axios(deleteTweetConf);
        console.log(`Successfully deleted ${tweetId}`);
    } catch (e) {
        console.log('Error deleting tweet', e);
        console.log('data', e.response.data);
        throw e;
    }
}

const getArgs = () => {
    const args = process.argv.slice(2, process.argv.length);

    // default time between calls in seconds
    const requiredArgs = {
        // time between deletion call in seconds
        tbd: 4,
    };

    const validKeys = ['tbd', 'user'];

    args.forEach(arg => {
        const [key, val] = arg.split('=');

        if (validKeys.includes(key)) {
            requiredArgs[key] = val;
        }
    });

    if (!requiredArgs['user']) {
        throw new Error('Please provide twitter handle e.g user=foo')
    }

    return requiredArgs;
}

const deleteTweets = async () => {
    let tweetIds = [];
    let deletedTweetCount = 0;

    const { tbd, user } = getArgs();
    
    console.log(`Time between deletion calls: ${tbd}s`);

    tweetIds = await getTweetsId(user);
    
    while(tweetIds.length > 0) {
        const tweetId = tweetIds.shift();
        await deleteTweet(tweetId, tbd);
        deletedTweetCount++;

        console.log(`deleted count: ${deletedTweetCount} \n`);

        if (tweetIds.length === 0) {
            console.log('Deleted current batch of tweets. fetching more...\n');
            tweetIds = await getTweetsId(user);
        }
    }

    console.log('No more tweets to delete.Exiting...');
}

deleteTweets();