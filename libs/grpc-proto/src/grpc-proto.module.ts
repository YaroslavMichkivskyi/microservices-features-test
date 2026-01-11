import { Module } from '@nestjs/common';
import { GrpcProtoService } from './grpc-proto.service';

@Module({
  providers: [GrpcProtoService],
  exports: [GrpcProtoService],
})
export class GrpcProtoModule {}
