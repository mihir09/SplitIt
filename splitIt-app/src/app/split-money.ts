// Allocate integer cents by largest remainder; stable ties follow participant order.
export function allocateCents(amount: number, weights: number[]): number[] {
  const total = Math.round(amount * 100);
  const sum = weights.reduce((a,b)=>a+b,0);
  if (!Number.isSafeInteger(total) || total < 0 || !weights.length || !Number.isFinite(sum) || sum <= 0 || weights.some(w=>!Number.isFinite(w) || w<0)) return weights.map(()=>0);
  const raw = weights.map(w=>total*w/sum);
  const cents = raw.map(Math.floor);
  const order = raw.map((value,index)=>({index,remainder:value-cents[index]})).sort((a,b)=>b.remainder-a.remainder || a.index-b.index);
  for (let remaining = total-cents.reduce((a,b)=>a+b,0), i=0; i<remaining; i++) cents[order[i % order.length].index]++;
  return cents.map(value=>value/100);
}
