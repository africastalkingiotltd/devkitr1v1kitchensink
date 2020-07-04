import { hgetallAsync } from "../../lib/other/redis/redis";
import { sessionClean } from "../../lib/other/queues/main";
import { USSDServiceActor } from "../../lib/actors/ussd/main";
import  { isEmpty } from "rambda";

export async function post(req, res, next) {
  let sessionId = req.fields.sessionId;
  let phoneNumber = req.fields.phoneNumber;
  let networkCode = req.fields.networkCode;
  let serviceCode = req.fields.serviceCode;
  let userInput = req.fields.text;
  let userInputSplit = userInput.split("*");
  let currentUserResponse = userInputSplit.pop();
  let sessionLookupKey = "demo:" + sessionId.toString();

  let sessionInfo = await hgetallAsync(sessionLookupKey);
  if (!isEmpty(sessionInfo)) {
    let redisObjString = JSON.stringify(sessionInfo);
    let sessionBody = JSON.parse(redisObjString);
    sessionBody.currentResponse = currentUserResponse.toString();
    USSDServiceActor.then((ussdServiceActor) => {
      ussdServiceActor
        .sendAndReceive(`${sessionBody.nextCommand}`, sessionBody)
        .then((reply) => {
          res.status(200).send(`${reply}`);
        });
    });
  } else {
    sessionClean.add(
      {
        sessionKey: sessionLookupKey,
      },
      {
        delay: 4 * 60 * 1000,
        removeOnComplete: true,
      }
    );
    let initialSessionInfo = {};
    initialSessionInfo.sessionId = sessionId;
    initialSessionInfo.networkCode = networkCode;
    initialSessionInfo.serviceCode = serviceCode;
    initialSessionInfo.phoneNumber = phoneNumber;
    initialSessionInfo.lookupKey = sessionLookupKey;
    initialSessionInfo.currentUserResponse = currentUserResponse;
    USSDServiceActor.then((ussdServiceActor) => {
      ussdServiceActor
        .sendAndReceive("displayInitialMenu", initialSessionInfo)
        .then((reply) => {
          res.status(200).send(`${reply}`);
        });
    });
  }
}
