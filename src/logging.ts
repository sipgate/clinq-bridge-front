import * as logging from "bunyan";
import { env } from "./env-parser";

export const log = logging.createLogger({
    level: env.LOGLEVEL,
    name: "clinq-bridge-front",
});
