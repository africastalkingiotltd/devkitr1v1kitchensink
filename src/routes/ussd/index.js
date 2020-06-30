import { redisClient } from "../../lib/other/redis/redis";
import { sessionClean } from "../../lib/other/queues/main";
import { USSDServiceActor } from "../../lib/actors/ussd/main";


export async function post(req, res, next)
{
    let sessionId  = req.fields.sessionId;
    let phoneNumber = req.fields.phoneNumber;
    let networkCode = req.fields.networkCode;
    let serviceCode = req.fields.serviceCode;
    let userInput   = req.fields.text;
    let userInputSplit      = userInput.split("*");
    let currentUserResponse = userInputSplit.pop();
    let sessionLookupKey = "demo:"+sessionId.toString();

    redisClient.hgetall(sessionLookupKey, async (error, result) => {

        if (result == null || result == undefined || result['sessionId'] != sessionId.toString() /** New session and this rare occurrence **/) {
            sessionClean.add({
                sessionKey : sessionLookupKey
            }, {
                delay : 4*60*1000,
                removeOnComplete : true
            });
            let initialSessionInfo = {};
            initialSessionInfo.sessionId   = sessionId;
            initialSessionInfo.networkCode = networkCode;
            initialSessionInfo.serviceCode = serviceCode;
            initialSessionInfo.phoneNumber = phoneNumber;
            initialSessionInfo.lookupKey  = sessionLookupKey;
            initialSessionInfo.currentUserResponse = currentUserResponse;
            USSDServiceActor.then(ussdServiceActor => {
                ussdServiceActor.sendAndReceive('displayInitialMenu', initialSessionInfo)
                .then(reply => {
                    res.status(200).send(`${reply}`);
                });
            });
        } else if (result['sessionId'] == sessionId.toString()){
            let redisObjString = JSON.stringify(result);
            let sessionBody = JSON.parse(redisObjString);
            sessionBody.lookupKey       = sessionLookupKey;
            sessionBody.sessionId       = sessionId.toString();
            sessionBody.phoneNumber     = phoneNumber.toString();
            sessionBody.networkCode     = networkCode.toString();
            sessionBody.serviceCode     = serviceCode.toString();
            sessionBody.currentResponse = currentUserResponse.toString();
            let machineCommand           = result["nextCommand"];
            machineCommand               = machineCommand.toString();
            USSDServiceActor.then(ussdServiceActor => {
                ussdServiceActor.sendAndReceive(`${machineCommand}`, sessionBody)
                .then(reply => {
                    res.status(200).send(`${reply}`);
                });
            });
        }
    });
}