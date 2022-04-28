import "./lib/env";
import { Configuration, Inject, PlatformApplication } from "@tsed/common";
import express from "express";
import "@tsed/platform-express";
import "@tsed/typeorm";
import cors from "cors";
import "./api/httpExceptions/HttpExceptionFilter";
import '@tsed/typeorm';

const rootDir = __dirname;

@Configuration({
  rootDir,
  acceptMimes: ["application/json"],
  port: 3000,
  debug: false,
  mount: {
    "/api/v1": [
      `${rootDir}/api/controllers/*.{ts,js}`
    ]
  },
  componentsScan: [
    `${rootDir}/database/repositories/*.{ts,js}`,
    `${rootDir}/api/middlewares/*.{ts,js}`
  ],
  typeorm: [
    {
      name: 'default',
      type: 'postgres',
      host: process.env.TYPEORM_HOST,
      port: parseInt(process.env.TYPEORM_PORT),
      username: process.env.TYPEORM_USERNAME,
      password: process.env.TYPEORM_PASSWORD,
      database: process.env.TYPEORM_DATABASE,
      logging: process.env.TYPEORM_LOGGING === 'true',
      synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
      entities: [
        `${rootDir}/database/entities/*.{ts,js}`
      ],
      migrations: [
        `${rootDir}/database/migrations/*.{ts,js}`
      ]
    }
  ],
  socketIO: {}
})
export class Server {
  @Inject()
  app: PlatformApplication;

  @Configuration()
  settings: Configuration;

  /**
   * @returns {Server}
   */
  public $beforeRoutesInit(): void | Promise<any> {
    this.app
      .use(express.json())
      .use(express.urlencoded({
        extended: true
      }))
      .use(cors())
      .use((req, res, next) => {
        res.setHeader("X-Powered-By", "Tecprime Soluções");
        next();
      })
  }
}