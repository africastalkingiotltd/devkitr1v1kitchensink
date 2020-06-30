import { USSDMenu }  from "./menu";

export class ControllerMenu {
        constructor(level = 0, type = "input") {
          this.l = level;
          this.t = type;
        }
      
        get applicationMessage() {
          return this.getApplicationMessage();
        }
      
        respondWithMessageType() {
          let messageType = this.t;
          let responsePrefix = "";
          switch (messageType) {
            case "input":
              responsePrefix = "CON ";
              break;
            case "end":
              responsePrefix = "END ";
              break;
            default:
              break;
          }
          return responsePrefix;
        }
      
      
        getApplicationMessage() {
          let menuLevel = parseInt(this.l);
          let menuPrefix = this.respondWithMessageType();
          let ussdapplicationMessage = "";
          ussdapplicationMessage = USSDMenu.options[menuLevel].message;
          let applicationResponse = menuPrefix + "" + ussdapplicationMessage;
          return applicationResponse;
        }
}