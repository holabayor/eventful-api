import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisService } from 'src/common/redis/redis.service';
import { EventsModule } from 'src/events/events.module';
import { UserController } from './user.controller';
import { User, UserSchema } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    // forwardRef(() => EventsModule),
    EventsModule,
  ],
  providers: [RedisService, UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
