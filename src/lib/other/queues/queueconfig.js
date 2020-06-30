import { defaultRedisConnOpts } from "../redis/redis";

const Redis = require("ioredis");


const ioRedisInst = new Redis(defaultRedisConnOpts);

const client = new Redis(defaultRedisConnOpts);
const subscriber = new Redis(defaultRedisConnOpts);

export const queueOptions = {
  createClient: function(type) {
    switch (type) {
      case "client":
        return client;
      case "subscriber":
        return subscriber;
      default:
        return ioRedisInst;
    }
  }
};