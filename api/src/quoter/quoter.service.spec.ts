import { Test, TestingModule } from '@nestjs/testing';
import { QuoterService } from './quoter.service';

describe('QuoterService', () => {
  let service: QuoterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuoterService],
    }).compile();

    service = module.get<QuoterService>(QuoterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests when contracts are deployed
  describe('batchQuoteAllPairs', () => {
    it('should return quotes and opportunities', async () => {
      // Mock test - requires actual deployed contracts
      // const result = await service.batchQuoteAllPairs();
      // expect(result.quotes).toBeDefined();
      // expect(result.opportunities).toBeDefined();
    });
  });
});
