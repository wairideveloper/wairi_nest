import { Module } from '@nestjs/common';
import { ApiplexCallbackService } from './apiplex_callback.service';
import { ApiplexCallbackController } from './apiplex_callback.controller';

@Module({
  controllers: [ApiplexCallbackController],
  providers: [ApiplexCallbackService]
})
export class ApiplexCallbackModule {}
