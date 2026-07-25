import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  getHealth() {
    return {
      data: {
        status: "ok",
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}
