import { NestFactory } from '@nestjs/core';
import { ValidationPipe, HttpStatus } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as passport from 'passport';

import { AppModule } from './app.module';
import { ExcludeInterceptor } from './exclude.interceptor';
import { config } from './config';
import * as fs from 'fs';

async function bootstrap() {
  let ss = {};
  if(process.env.SSL_CERT && process.env.SSL_KEY) {
    ss = {
      key: fs.readFileSync(process.env.SSL_KEY),
      cert: fs.readFileSync(process.env.SSL_CERT),
    };
  }
  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      ...ss,
    }
  });

  app.use(cookieParser(config.appSecret));
  app.enableCors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  );
  app.useGlobalInterceptors(new ExcludeInterceptor());
  app.use(passport.initialize());

  await app.listen(config.port);
  console.log(`Server is running on: ${await app.getUrl()}`);
}
bootstrap();
