import { allocateCents } from './split-money';
describe('exact-cent splitting', () => {
  it('assigns the leftover cent when dividing ten dollars three ways', () => {
    expect(allocateCents(10,[1,1,1])).toEqual([3.34,3.33,3.33]);
  });
  it('handles tiny expenses without inventing cents', () => {
    expect(allocateCents(0.01,[1,1,1])).toEqual([0.01,0,0]);
  });
  it('conserves money for equal, percentage, and weighted splits', () => {
    for (const weights of [[1,1,1],[33.33,33.33,33.34],[1,2,7]]) {
      for (const cents of [1,2,10,100,999,1000,10001]) {
        const shares=allocateCents(cents/100,weights);
        expect(shares.reduce((sum,share)=>sum+Math.round(share*100),0)).toBe(cents);
        expect(shares.every(share=>share>=0)).toBeTrue();
      }
    }
  });
});
