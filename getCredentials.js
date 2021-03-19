const credentialKeys = ['API_KEY', 'API_KEY_SECRET', 'ACCESS_TOKEN', 'ACCESS_TOKEN_SECRET'];

const getCredentials = () => {
    const creds = {};
    const envVars = process.env;
    
    credentialKeys.forEach(key => {
        const val = envVars[key];
        if (!val) {
            throw new Error(`Unable to retrieve ${key} from env. Please check that it is available`);
        }

        creds[key] = val;
    });

    return creds;
}

module.exports = getCredentials();