import { Test, TestingModule } from '@nestjs/testing';
import { GrpcProtoService } from './grpc-proto.service';

describe('GrpcProtoService', () => {
  let service: GrpcProtoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GrpcProtoService],
    }).compile();

    service = module.get<GrpcProtoService>(GrpcProtoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
