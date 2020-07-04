export const USSDMenu = {
  options: [
    {
      message: "Select Options:\r\n1. Get Data\r\n2. Send Commands\r\n",
      level: 0,
    },
    {
      message: "1. Live Display\r\n2. Receive Message\r\n3. Get Call\r\n",
      level: 1,
    },
    {
      message:
        "1. Temperature\r\n2. Humidity\r\n3. Moisture\r\n4. Distance\r\n5. Light Intensity",
      level: 2,
    },
    { message: "1. Servo\r\n2. LED", level: 3 },
    { message: "1. Open\r\n2. Close\r\n", level: 4 },
    { message: "1. ON\r\n2. OFF\r\n", level: 5 },
  ],
  responses: [
    { message: "Current {0} reading is {1}.\n", level: 0 },
    { message: "The command {0} has been sent. \n", level: 1 },
    { message: "You will receive an SMS shortly. \n", level: 2 },
    { message: "You will receive a call shortly. \n", level: 3 },
  ],
};
