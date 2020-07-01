import { ControllerMenu } from "../../ussd/main";
import { getAsync, ioRedisClient } from "../../other/redis/redis";
import { getUserLevelOneSelection, paramsParser, servoCommand, getUserResponsePreference } from "../../other/input/parser";
import { dataMessageResponse, upperCaseFirstLetter } from "../../other/output/response";
import { devicesQueue, smsQueue, callQueue } from "../../other/queues/main";
import { USSDMenu } from "../../ussd/menu";

export class USSDService {
    displayInitialMenu(data)
    {
        let response = {};
        let reqType  = "input";
        let menu     = new ControllerMenu(0, reqType);
        response.menu = menu.applicationMessage;
        response.sessionId   = data.sessionId;
        response.phoneNumber = data.phoneNumber;
        response.lookupKey   = data.lookupKey;
        response.requestType = reqType;
        response.nextCommand = "displaySecondMenu";
        response.prevCommand = "displayInitialMenu";
        ioRedisClient.hmset(data.lookupKey, response);
        return response.menu;
    }
    displaySecondMenu(data)
    {
        let response = {};
        let command = getUserLevelOneSelection(data.currentResponse);
        let menu;
        let nextCommand;
        switch (command) {
            case "getData":
                menu = new ControllerMenu(1, data.requestType);
                nextCommand = "displayParameters";
                break;
            case  "sendCommand":
                menu = new ControllerMenu(3, data.requestType);
                nextCommand = "displayServoOptions"; 
                break;
            default:
                break; // Can't get here
        }
        response.menu = menu.applicationMessage;
        response.nextCommand = nextCommand;
        response.prevCommand = "displaySecondMenu";
        ioRedisClient.hmset(data.lookupKey, response);
        return response.menu;
    }
    displayParameters(data)
    {
        let response  = {};
        let menu;
        menu = new ControllerMenu(2, data.requestType);
        response.menu = menu.applicationMessage;
        response.prevCommand = "displayParameters";
        response.nextCommand = "getParams";
        response.preference = getUserResponsePreference(data.currentResponse);
        ioRedisClient.hmset(data.lookupKey, response);
        return response.menu;
    }
    displayServoOptions(data)
    {
        let response  = {};
        let menu;
        menu = new ControllerMenu(4, data.requestType);
        response.menu = menu.applicationMessage;
        response.prevCommand = "displayServoOptions";
        response.nextCommand = "sendCommand";
        ioRedisClient.hmset(data.lookupKey, response);
        return response.menu;
    }
    async getParams(data)
    {
        let response = {};
        let dbData = await getAsync(paramsParser(data.currentResponse));
        let menu;
        if (data.preference == "ussd") {
          menu  = dataMessageResponse(upperCaseFirstLetter(paramsParser(data.currentResponse)), dbData, 0);// Continnue
        } else if(data.preference == "sms")
        {
            smsQueue.add({phoneNumber: data.phoneNumber, payload : data.currentResponse}, {removeOnComplete: true});
            menu = "END " + USSDMenu.responses[2].message;
            
        } else if(data.preference == "voice")
        {
            menu =  USSDMenu.responses[3].message;
            callQueue.add({phoneNumber: data.phoneNumber, payload : data.currentResponse}, {removeOnComplete: true});
            menu = "END " + USSDMenu.responses[3].message;
        }
        response.menu = menu;
        response.prevCommand = "getParams";
        response.nextCommand = "NOP";
        ioRedisClient.hmset(data.lookupKey, response);
        return response.menu;
    }
    sendCommand(data)
    {
        let response = {};
        let menu = dataMessageResponse(upperCaseFirstLetter(servoCommand(data.currentResponse)), "", 1);
        response.menu = menu;
        response.prevCommand = "sendCommand";
        response.nextCommand = "NOP";
        ioRedisClient.hmset(data.lookupKey, response);
        devicesQueue.add({command: servoCommand(data.currentResponse)}, {removeOnComplete: true});
        return response.menu;
    }
}