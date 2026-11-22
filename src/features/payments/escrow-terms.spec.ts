import { escrowTermsHash, escrowTermsXdr } from './escrow-terms.js';

const fixture = {
  chainLotId: '01'.repeat(32),
  authority: 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM',
  operator: 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFCT4',
  asset: 'CACMVW2KK4H5FZDFF2AUCAKQTEJMZZWJUIZF23XMRVYQBSXYLHZ6BKWN',
  unitsPerBlock: 100,
  totalBlocks: 10,
  blockPriceMinor: '10000000',
  fundingDeadline: 2000n,
};

describe('escrow-v2 canonical terms', () => {
  it('matches the Rust contract fixture and binds the amount', () => {
    expect(escrowTermsHash(fixture)).toBe('3cc69c25ee29572d6280a2564149862f50af4bbe6c1a32cf85065638c3f68515');
    expect(escrowTermsHash({ ...fixture, blockPriceMinor: '10000001' })).not.toBe(escrowTermsHash(fixture));
    expect(() => escrowTermsXdr({ ...fixture, chainLotId: '01' })).toThrow();
  });
});
