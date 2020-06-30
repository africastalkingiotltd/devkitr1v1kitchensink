import compression from "compression";
import * as sapper from "@sapper/server";
import { colors } from "./lib/console";
import {
  devicesQueue,
  callQueue,
  smsQueue,
  sessionClean,
  commandQueue
} from "./lib/other/queues/main";
import { redisClient, hgetallAsync } from "./lib/other/redis/redis";
import { sendServoCommand, sendSMSResponse, voiceOutboundCall } from "./lib/other/output/response";
const cluster = require("cluster");
const cpuCount = require("os").cpus().length;
const cors = require("cors");
const formidable = require("express-formidable");
const pino = require("express-pino-logger")({
  prettyPrint: true
});

// if (cluster.isMaster) {
  // console.info(`Master is running as process ID : ${process.pid}`);
  // for (let index = 0; index < cpuCount; index++) {
  //   cluster.fork();
  // }

  // cluster.on("exit", (worker, code, signal) => {
  //   console.info(`Worker ${worker.id} died`);
  //   console.info(`Creating new worker`);
  //   cluster.fork();
  // });
  // cluster.on("listening", (worker, address) => {
  //   console.info(`Worker ${worker.id} is gossiping on ${address.address}`);
  // });
  // cluster.on("fork", worker => {
  //   console.info(`Started a new Worker with ID: ${worker.id}`);
  // });
  // cluster.on("online", worker => {
  //   console.info(`Worker ${worker.id} is online and ready to process requests`);
  // });
  // cluster.on("message", (worker, message, handle) => {
  //   console.info(
  //     `Message from worker ${worker.id}. Message data ${JSON.stringify(
  //       message
  //     )}`
  //   );
  // });

  //   //devicesQueue
  devicesQueue.on("global:completed", function(jobId, result) {
    console.info(`Job ${jobId} completed!`);
  });
  devicesQueue.on("global:failed", function(jobId, error) {
    console.error(`Job ${jobId} Failed! Result: ${error}`);
    devicesQueue.getJob(jobId).then(function(job) {
      job.remove();
    });
  });
  devicesQueue.on("global:stalled", function(jobId) {
    console.info(`Job ${jobId} Crashed`);
    devicesQueue.getJob(jobId).then(function(job) {
      job.remove();
    });
  });
  devicesQueue.on("global:removed", function(job) {
    console.info(`Job ${jobId} Removed`);
  });

  //   //callQueue
  callQueue.on("global:completed", function(jobId, result) {
    console.info(`Call Queue Job ${jobId} completed!`);
  });
  callQueue.on("global:failed", function(jobId, error) {
    console.error(`Call Queue Job ${jobId} Failed! Result: ${error}`);
    callQueue.getJob(jobId).then(function(job) {
      job.remove();
    });
  });
  callQueue.on("global:stalled", function(jobId) {
    console.info(`Call Queue Job ${jobId} Crashed`);
    callQueue.getJob(jobId).then(function(job) {
      job.remove();
    });
  });
  callQueue.on("global:removed", function(job) {
    console.info(`Call Queue Job ${jobId} Removed`);
  });

  //   // smsQueue
  smsQueue.on("global:completed", function(jobId, result) {
    console.info(`SMS Queue Job ${jobId} completed!`);
  });
  smsQueue.on("global:failed", function(jobId, error) {
    console.error(`SMS Queue Job ${jobId} Failed! Result: ${error}`);
    smsQueue.getJob(jobId).then(function(job) {
      job.remove();
    });
  });
  smsQueue.on("global:stalled", function(jobId) {
    console.info(`SMS Queue Job ${jobId} Crashed`);
    smsQueue.getJob(jobId).then(function(job) {
      job.remove();
    });
  });
  smsQueue.on("global:removed", function(job) {
    console.info(`SMS Queue Job ${jobId} Removed`);
  });

  //   //sessionClean
  sessionClean.on("global:completed", function(jobId, result) {
    console.info(`Session Job ${jobId} completed!`);
  });
  sessionClean.on("global:failed", function(jobId, error) {
    console.error(`Session Job ${jobId} Failed! Result: ${error}`);
    sessionClean.getJob(jobId).then(function(job) {
      job.remove();
    });
  });
  sessionClean.on("global:stalled", function(jobId) {
    console.info(`Session Job ${jobId} Crashed`);
    sessionClean.getJob(jobId).then(function(job) {
      job.remove();
    });
  });
  sessionClean.on("global:removed", function(job) {
    console.info(`Session Job ${jobId} Removed`);
  });
// } else {
  const express = require("express");
  const app = express();
  app.use(pino);
  app.use(cors());
  app.use(
    express.static(__dirname + "/static"),
    compression({ threshold: 0 }),
    formidable(),
    sapper.middleware()
  );

  const appPort = 23000;

  app.listen(process.env.PORT || appPort, () => {
    console.info("We are up!");
  });

  sessionClean.process(async (job, done) => {
    console.info(`Session Cleaner worker ${job.id} is running`);
    let redisKey = job.data.sessionKey;
    let sessionInfo = await hgetallAsync(redisKey);
    if (sessionInfo == null || sessionInfo == undefined) {
      console.info("No session was found. Nothing to do");
    } else {
      console.info("Found a session. Removing...");
      let redisObjString = JSON.stringify(sessionInfo);
      console.info(`Session Info : ${redisObjString} `);
      redisClient.del(redisKey.toString());
    }
    console.info(`Session Cleaner worker ${job.id} is done`);
    done();
  });

  devicesQueue.process(async (job, done) => {
    console.info(`Device Queue worker ${job.id} is running`);
    let key = job.data.dataKey;
    let value = job.data.dataValue;
    redisClient.set(key, value);
    console.info(`Device Queue worker ${job.id} is done`);
    done();
  });

  commandQueue.process(async (job, done) => {
    console.info(`Command Queue worker ${job.id} is running`);
    let res = await sendServoCommand(job.data.command);
    if(res.status == 201 || res.status == 200 ){
      console.info(`Request sent successfuly`);
    }
    else {
      console.error(`Request failed due to ${res.statusText}`);
    }
    console.info(`Command Queue worker ${job.id} is done`);
    done();
  });

  smsQueue.process( async (job, done) => {
    console.info(`SMS Command Queue worker ${job.id} is running`);
    let response = await sendSMSResponse(job.data.phoneNumber, job.data.payload);
    console.log(response);
    console.info(`SMS Command Queue worker ${job.id} is done`);
    done();
  });

  callQueue.process( async (job, done) => {
    console.info(`Voice Command Queue worker ${job.id} is running`);
    console.info(`Phone number : ${job.data.phoneNumber} \nPayload to send ${job.data.payload}\n`);
    let response = await voiceOutboundCall(job.data.phoneNumber, job.data.payload);
    console.log(response.data);
    console.info(`Voice Command Queue worker ${job.id} is done`);
    done();
  });
// }
