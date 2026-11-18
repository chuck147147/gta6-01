export function mulberry32(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
export const range=(rng,min,max)=>min+rng()*(max-min);
export const pick=(rng,list)=>list[Math.floor(rng()*list.length)];
export const chance=(rng,p)=>rng()<p;
