import { USSDMenu } from "../../ussd/menu";
import { paramsParser } from "../input/parser";
import { getAsync } from "../redis/redis";
import { sms, voice, ATAPICreds, IoTConfigs } from "../../../config/africastalking";
import xmlbuilder from "xmlbuilder";
const axios = require('axios');
const qs = require('qs');

String.prototype.format = function(args) {
  var str = this;
  return str.replace(String.prototype.format.regex, function(item) {
    var intVal = parseInt(item.substring(1, item.length - 1));
    var replace;
    if (intVal >= 0) {
      replace = args[intVal];
    } else if (intVal === -1) {
      replace = "{";
    } else if (intVal === -2) {
      replace = "}";
    } else {
      replace = "";
    }
    return replace;
  });
};
String.prototype.format.regex = new RegExp("{-?[0-9]+}", "g");

export const dataMessageResponse = (param, variable, option) => {
  let text = "END ";
  text += USSDMenu.responses[parseInt(option)].message; //optInService.optconfirm.prompts[0].message;
  let res = text.format([param, variable]);
  return res;
};

const SMSMessageResponse = (param, variable, option) => {
  let text = "";
  text += USSDMenu.responses[parseInt(option)].message; 
  let res = text.format([param, variable]);
  return res;
};

const pascalCaseLetter = input => {
  return input.charAt(0).toUpperCase() + input.slice(1);
};

export const upperCaseFirstLetter = input => {
  return pascalCaseLetter(input);
};

const constructVoiceActionOutbound = (param, data) => {
  const voiceResponse = {
    Response : {
      Say : {
        '#text' : 'The current ' + param + ' reading is ' + data
      }
    }
  };
  return xmlbuilder.create(voiceResponse, {encoding: 'utf-8'}).end({pretty:true});
};

export const voiceRejectInboundCall = () =>{
  const voiceResponse = {
    Response: {
      Reject: {}
    }
  };
  return xmlbuilder.create(voiceResponse, {encoding: 'utf-8'}).end({pretty:true});
};

export const sendServoCommand = async (command) => {
  const commandData = {
    username : IoTConfigs.username,
    deviceGroup: IoTConfigs.group,
    topic: `${IoTConfigs.username}/${IoTConfigs.group}/${IoTConfigs.topic}` ,
    payload: command
  };
  const IOTCommandConfig = {
    url: "https://iot.africastalking.com/data/publish",
    method: "post",
    headers: {
      'Content-Type' : 'application/json',
      'apiKey': '86050567ce4f75b3fce46ed5a722e50345ee00f6256803f5f44ef6528df6eb8d'
    },
    body: JSON.stringify(commandData)
  };
  let APIResponse = await axios(IOTCommandConfig);
  return await APIResponse;
};

export const sendSMSResponse = async (phoneNumber, payload) => {
  let targetPhoneNumber  = phoneNumber;
  let dbData = await getAsync(paramsParser(payload));
  let smsResponse = SMSMessageResponse(pascalCaseLetter(paramsParser(payload)), dbData, 0);
  const smsPayload = {
    to: targetPhoneNumber,
    message: smsResponse
  };
  return sms.send(smsPayload);
};

export const voiceCallResponse = async (payload) => {
  let dbData = await getAsync(paramsParser(payload));
  let callData = constructVoiceActionOutbound(pascalCaseLetter(paramsParser(payload)), dbData);
  return callData;
};

export const voiceOutboundCall = async (phoneNumber, payload) => {

  let postData = {
    username: `${ATAPICreds.username}`,
    from: '+254711082518',
    to: `${phoneNumber}`,
    clientRequestId: `${payload}`
};
let requestConfig = {
    url : 'https://voice.africastalking.com/call',
    method: 'post',
    headers: {'apiKey' : `${ATAPICreds.apiKey}`, 'Content-Type' : 'application/x-www-form-urlencoded'},
    data: qs.stringify(postData)
};
return await axios(requestConfig);
};