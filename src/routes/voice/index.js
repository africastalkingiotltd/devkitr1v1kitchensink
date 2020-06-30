import * as xmlbuilder from 'xmlbuilder';
import { voiceCallResponse, voiceRejectInboundCall } from '../../lib/other/output/response';



export async function post(req, res, next) {
    let direction =  req.fields.direction;
    let xmlResponse;
    (direction == "Inbound") ? xmlResponse = voiceRejectInboundCall() : xmlResponse = await voiceCallResponse(req.fields.clientRequestId);
    console.info("Voice response ", xmlResponse);

    res.status(200).send(xmlResponse);
}