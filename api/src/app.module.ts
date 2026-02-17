import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuoterModule } from './quoter/quoter.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    QuoterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
