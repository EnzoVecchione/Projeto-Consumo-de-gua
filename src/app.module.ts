import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConsumoAguaModule } from './consumo_agua/consumo_agua.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [ConsumoAguaModule, MongooseModule.forRoot('mongodb+srv://username:<password>@cluster0.4xh1c.mongodb.net/')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}