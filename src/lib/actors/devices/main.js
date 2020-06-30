import { DeviceMessagingService } from "./handler";
import { actorSystem } from "../../actor";

export const DeviceServiceActor = actorSystem
    .rootActor()
    .then(rootActor => rootActor.createChild(DeviceMessagingService));
