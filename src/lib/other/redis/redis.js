const redis = require("redis");
const getRedisHost = () => {
  return process.env.NODE_ENV == "production"
    ? process.env.REDIS_HOST
    : "127.0.0.1";
};

export const redisHost = getRedisHost();

const getRedisConnOpts = () => {
    let connectionString;
  if (process.env.NODE_ENV == 'production') {
      connectionString = process.env.REDIS_URL
  } 
  if (process.env.NODE_ENV == 'development') {
      
      let redisOptions = {};
      redisOptions.port = 6379;
      redisOptions.host = getRedisHost();
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

export const redisPublisher  = redis.createClient(getRedisConnOpts());
export const redisSubscriber = redis.createClient(getRedisConnOpts());
export const redisQueueSubscriber = redis.createClient(getRedisConnOpts()); // You can re-use the existing subscribers 🤷‍♂️  
export const redisQueuePublisher  = redis.createClient(getRedisConnOpts()); // You can re-use the existing publishers 🤷‍♂️