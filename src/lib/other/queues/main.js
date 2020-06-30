const Queue = require("bull");
import { queueOptions } from "./queueconfig";

export const devicesQueue = Queue('devices', queueOptions); // Writes  device messages to Redis
export const callQueue    = Queue("calls", queueOptions); // Queues a call upon request
export const smsQueue     = Queue("sms", queueOptions); // Sends an SMS
export const commandQueue = Queue("command", queueOptions); // Commands
export const sessionClean = Queue("session", queueOptions);