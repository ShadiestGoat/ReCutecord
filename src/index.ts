import { Injector, Logger } from "replugged";
import type { message } from "./types";

const injector = new Injector();
const logger = Logger.plugin("Cutecord");

export function start(): void  {
  logger.log("Started!! <3")
}

export function stop(): void {
  injector.uninjectAll();
}

export function shouldNotNotify(e: {message: message}): boolean {
  const msg = e.message
  
  // 1. check if user status is dnd, if its not, always return false
  // 2. fitlers:
  /*
    - cuties
    - phrases
    - channels
    - guilds

    + negative lists for each
  */

  return true
}

export { Settings } from "./components/settings"
