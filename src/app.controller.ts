import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('debug/routes')
  getRoutes(@Req() req: Request) {
    const server = req.app;
    const router = (server as any)._router;
    return router.stack
      .filter((r: any) => r.route)
      .map((r: any) => ({
        path: r.route.path,
        method: Object.keys(r.route.methods)[0].toUpperCase(),
      }));
  }
}
