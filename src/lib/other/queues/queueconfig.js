const Redis = require("ioredis");
import { getIORedisOptions, getConOpts } from "../redis/redis";

let subscriber = new Redis(getIORedisOptions(), getConOpts());
let client = new Redis(getIORedisOptions(), getConOpts());;

export const opts = {
  createClient: (type) => {
    switch (type) {
      case "client":
        return client;
      case "subscriber":
        return subscriber;
      case "bclient":
        return new Redis(getIORedisOptions(), getConOpts());
      default:
        throw new Error("Unexpected connection type: ", type);
    }
  },
};

