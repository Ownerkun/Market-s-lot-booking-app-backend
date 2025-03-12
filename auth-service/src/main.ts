import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'; // Ensure this path is correct

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();