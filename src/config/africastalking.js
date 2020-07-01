const africastalkingCreds = {
    username :  process.env.AT_USERNAME ,
    apiKey: process.env.AT_APIKEY
};

export const IoTConfigs = {
    username: process.env.DEVICE_GROUP_USERNAME ,
    group:  process.env.DEVICE_GROUP ,
    password:  process.env.DEVICE_PASS,
    servoTopic: process.env.SERVO_TOPIC,
    ledTopic: process.env.LED_TOPIC,
    iotAPIKey: process.env.IOT_APIKEY
};

const  AfricasTalking = require('africastalking')(africastalkingCreds);
export const sms   = AfricasTalking.SMS;
export const voice = AfricasTalking.VOICE; 

export const ATAPICreds = africastalkingCreds;