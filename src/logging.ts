import * as logging from "bunyan";
import { env } from "./env";

export const log = logging.createLogger({
    level: env.LOGLEVEL,
    name: "clinq-bridge-front",
});
