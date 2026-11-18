import {saveGame} from './save.js';
export const SHOPS=[{x:3900,y:650,name:'Torque & Sons',type:'garage'},{x:1350,y:2430,name:'Bay Mart',type:'mart'}];
export function shopNear(g){return SHOPS.find(s=>Math.hypot(s.x-g.player.x,s.y-g.player.y)<85&&(s.type==='garage'?(!g.player.car||Math.abs(g.player.car.speed)<25):!g.player.car));}
export function purchase(g,key){const p=g.player,s=g.state.shop,c=p.car||(p.lastCar&&Math.hypot(p.lastCar.x-p.x,p.lastCar.y-p.y)<170?p.lastCar:null);let cost=0,apply;
 if(s.type==='garage'){if(key==='1'&&c){cost=Math.ceil(40+c.damage);apply=()=>c.damage=0;}if(key==='2'){cost=200;apply=g.clearWanted;}}
 else if(key==='1'){cost=10;apply=()=>p.health=Math.min(100,p.health+35);}else if(key==='2'){cost=150;apply=()=>p.armor=100;}
 if(!apply)return;if(p.cash<cost){g.state.shopMessage='Not enough cash';return;}p.cash-=cost;apply();g.state.cashDelta=-cost;g.state.cashTime=3;g.state.shopMessage='Purchase complete';saveGame(g);}
