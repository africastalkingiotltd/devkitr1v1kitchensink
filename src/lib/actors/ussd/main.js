import { actorSystem } from "../../actor";
import { USSDService } from "./handler";

export const USSDServiceActor  = actorSystem
    .rootActor()
    .then(rootActor => rootActor.createChild(USSDService));