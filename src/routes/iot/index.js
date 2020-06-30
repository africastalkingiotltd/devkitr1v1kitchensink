import { DeviceServiceActor } from "../../lib/actors/devices/main";

export async function post(req, res, next)
{
    let payload = req.fields.payload;
    let topic   = req.fields.topic;

    let deviceData = {};
    deviceData.topic   = topic;
    deviceData.payload = payload;
    
    DeviceServiceActor.then(deviceServiceActor => {
        deviceServiceActor.sendAndReceive('saveMessage', deviceData)
        .then(reply => {
            if (reply == true) {
                res.status(200).send('OK');
            } else {
                res.status(400).send('Error');
            }
        });
    });
}