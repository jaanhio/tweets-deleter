# Tweets Deleter

This tool was built to automate the deletion of all tweets from an account without deleting the account. 

Yes there are existing tools available but I prefer knowing exactly what goes on under the hood. 

# How to use?

### 1. Get Twitter keys & tokens

You will need the following keys & tokens from [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard) in order to authenticate user and application to fetch tweets and perform deletion.

`API_KEY`: application API key (under Consumer Keys)
`API_KEY_SECRET`: application API secret (under Consumer Keys)
`ACCESS_TOKEN`: user access token (under Authentication Tokens)
`ACCESS_TOKEN_SECRET`: user secret token (under Authentication Tokens)

### 2. Export keys & tokens to env
```
export API_KEY=<key>
export API_KEY_SECRET=<secret>
export ACCESS_TOKEN=<key>
export ACCESS_TOKEN_SECRET=<secret>
```

### 3. Install dependencies
This script uses `axios` and `hmacsha1`.
```
npm ci
```

### 4. Run script

The script expects 2 args:
* `tbd`: Time between deletion calls (this is to avoid rate limiting). Defaults to 4s.
* `user`: Twitter handle. Required arg.

e.g
```
node index.js tbd=4 user=foobar
```
