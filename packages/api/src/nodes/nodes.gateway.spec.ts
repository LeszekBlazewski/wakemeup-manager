import { Test, TestingModule } from '@nestjs/testing';
import { NodesGateway } from './nodes.gateway';

describe('NodesGateway', () => {
  let gateway: NodesGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NodesGateway],
    }).compile();

    gateway = module.get<NodesGateway>(NodesGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
