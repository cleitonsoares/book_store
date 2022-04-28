import { $log } from "@tsed/logger";
import { PlatformExpress } from "@tsed/platform-express";
import { Server } from "./server";

async function bootstrap() {
  try {
    $log.info("Starting API...");
    const plataform = await PlatformExpress.bootstrap(Server, {});
    await plataform.listen();
    console.log("API started");
  } catch (err) {
    $log.error(err);
  }
}

bootstrap();