const Queue = require("bull");
import { opts } from "./queueconfig";

export const devicesQueue = Queue('devices', opts); // Writes  device messages to Redis
export const callQueue    = Queue("calls", opts); // Queues a call upon request
export const smsQueue     = Queue("sms", opts); // Sends an SMS
export const commandQueue = Queue("command", opts); // Commands
export const sessionClean = Queue("session", opts);