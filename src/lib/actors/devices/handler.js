import { devicesQueue } from "../../other/queues/main";
import { getAsync } from "../../other/redis/redis";

export class DeviceMessagingService {
    saveMessage(data) {
        let topicPayloadArray = data.topic.split("/"); /** 0 - Username(ignore) 1 - Devicegroup(demo) 2 - Device param */
        let deviceState       = data.payload;
        let deviceKey         = topicPayloadArray[2];
        devicesQueue.add({ dataKey: deviceKey, dataValue: deviceState }, {removeOnComplete: true});
        return true; // This can not fail
    }

    async getData(data) {
        let deviceKey  = data.deviceKey;
        let deviceData = await getAsync(deviceKey);
        if (deviceData == undefined || deviceData == null ) {
            return "Nothing recorded yet";
        } else {
            return deviceData;
        }
    }
}