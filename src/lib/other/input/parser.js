export const getUserLevelOneSelection = input => {
  let option;
  switch (input) {
    case "1":
      option = "getData";
      break;
    case "2":
      option = "sendCommand";
      break;
    default:
      option = "getData";
      break;
  }
  return option;
};

export const getUserResponsePreference = input => {
  let preference;
  switch (input) {
    case "1":
      preference = "ussd";
      break;
    case "2":
      preference = "sms";
      break;
    case "3":
      preference = "voice";
      break;
    default:
      preference = "ussd";
      break;
  }
  return preference;
};

export const paramsParser = input => {
  let params;
  switch (input) {
    case "1":
      params = "temperature";
      break;
    case "2":
      params = "humidity";
      break;
    case "3":
      params = "moisture";
      break;
    case "4":
      params = "distance";
      break;
    case "5":
      params = "light";
        break;
    default:
      params = "temperature";
      break;
  }
  return params;
};

export const servoCommand = input => {
  let command;
  switch (input) {
    case "1":
      command = "open";
      break;
    case "2":
      command = "close";
      break;
    default:
      command = "open";
      break;
  }
  return command;
};

export const ledCommand = input => {
  let command;
  switch (input) {
    case "1":
      command = "on";
      break;
    case "2":
      command = "off";
      break;
    default:
      command = "on";
      break;
  }
  return command;
};
