const hmacsha1 = require('hmacsha1');
const { API_KEY_SECRET, ACCESS_TOKEN_SECRET } = require('./getCredentials');

const sortParamKeysAsc = (p) => {
    return Object.keys(p).sort().reduce((obj, key) => {
        obj[key] = p[key];
        return obj;
    }, {});
}

const getParamsString = (p) => {
    let str = '';
    const sortedParams = sortParamKeysAsc(p);
    const params = Object.keys(sortedParams);
    const paramLength = params.length;

    params.forEach((param, index) => {
        const val = p[param];
        str += `${encodeURIComponent(param)}=${encodeURIComponent(val)}`.replace('!', '%21');
        if (index !== paramLength - 1) {
            str += '&'
        }
    });

    return str;
}

const generateSignature = (params, requestType, url) => {
    const paramString = getParamsString(params);
    const encodedBaseURL = encodeURIComponent(url);
    const sigBaseString = `${requestType}&${encodedBaseURL}&${encodeURIComponent(paramString)}`;
    const signingKey = `${encodeURIComponent(API_KEY_SECRET)}&${encodeURIComponent(ACCESS_TOKEN_SECRET)}`;
    const sig = hmacsha1(signingKey, sigBaseString);
    return sig;
};

module.exports = generateSignature;