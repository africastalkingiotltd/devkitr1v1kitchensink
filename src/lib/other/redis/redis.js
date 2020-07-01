const redis = require("redis");

const getRedisConnOpts = () => {
    let connectionString;
  if (process.env.NODE_ENV == 'production') {
      connectionString = process.env.REDISCLOUD_URL
  } 
  if (process.env.NODE_ENV == 'development') {
      
      let redisOptions = {};
      redisOptions.port = 6379;
      redisOptions.host = "127.0.0.1";
      redisOptions.db = 0;
      connectionString = redisOptions;
  }
  return connectionString;
};

export const redisClient     = redis.createClient(getRedisConnOpts());
export const defaultRedisConnOpts = getRedisConnOpts();

const {promisify} = require('util');
let localRedisClient = redis.createClient(getRedisConnOpts());
export const hgetallAsync = promisify(localRedisClient.hgetall).bind(localRedisClient);
export const getAsync     = promisify(localRedisClient.get).bind(localRedisClient);
