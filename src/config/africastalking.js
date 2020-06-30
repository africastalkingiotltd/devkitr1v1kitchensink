const africastalkingCreds = {
    username :  process.env.AT_USERNAME ,
    apiKey: process.env.AT_APIKEY
};

export const IoTConfigs = {
    username: process.env.NODE_ENV === 'production' ? process.env.DEVICE_GROUP : 'KennedyOtieno',
    group: process.env.NODE_ENV === 'production' ? process.env.DEVICE_GROUP : 'demogroup',
    password: process.env.NODE_ENV === 'production' ? process.env.DEVICE_PASS : 'demogroupassword',
    topic: process.env.NODE_ENV === 'production' ? process.env.DEVICE_TOPIC : 'servo'
};

const  AfricasTalking = require('africastalking')(africastalkingCreds);
export const sms   = AfricasTalking.SMS;
export const voice = AfricasTalking.VOICE; 

export const ATAPICreds = africastalkingCreds;