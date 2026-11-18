import {CAR_TYPES} from './config.js';
import {mulberry32,pick,range} from './random.js';
import {moveWithSlide,circleHitsWorld} from './world.js';
export function createPlayer(world){return {...world.spawn,angle:0,vx:0,vy:0,health:100,cash:200,armor:0,lastDamage:-100,lastCar:null,passengers:0,car:null,walk:0};}
export function createCar(type,x,y,angle=0,rng=mulberry32(1)){return {type,taxi:type==='taxi',...CAR_TYPES[type],x,y,angle,color:pick(rng,CAR_TYPES[type].colors),speed:0,vx:0,vy:0,steer:0,damage:0,locked:false,traffic:false,braking:false,stop:0,intersection:'',radius:20};}
export function populateCars(world){const rng=mulberry32(world.seed+91),cars=[],types=Object.keys(CAR_TYPES);
 for(const lot of world.parkingLots)for(let i=0;i<4;i++)cars.push(createCar(pick(rng,types),lot.x+25+i*42,lot.y+50,0,rng));
 for(let i=0;i<30;i++){const x=300+(i%8)*600+30,y=330+Math.floor(i/8)*450;const c=createCar(pick(rng,types),x,y,0,rng);cars.push(c);}
 const overlaps=c=>world.buildings.some(b=>c.x-c.w/2<b.x+b.w&&c.x+c.w/2>b.x&&c.y-c.h/2<b.y+b.h&&c.y+c.h/2>b.y);
 for(let i=cars.length-1;i>=0;i--)if(overlaps(cars[i]))cars.splice(i,1);
 console.assert(cars.every(c=>!overlaps(c)),'Parked car intersects a building');
 for(let i=0;i<14;i++){let c=createCar(pick(rng,types),300+Math.floor(rng()*8)*600+21,range(rng,100,2900),0,rng);c.traffic=true;c.cruise=range(rng,95,155);cars.push(c);}return cars;
}
export function interact(player,cars,world,state){
 if(player.car){const c=player.car;for(const side of [-1,1]){const x=c.x+Math.cos(c.angle)*side*46,y=c.y+Math.sin(c.angle)*side*46;if(!circleHitsWorld(world,x,y,12)&&!cars.some(o=>o!==c&&Math.hypot(o.x-x,o.y-y)<30)){player.car=null;player.x=x;player.y=y;c.speed*=.35;state.message='';return;}}state.message='Door blocked — find more space';return;}
 const near=cars.filter(c=>Math.hypot(c.x-player.x,c.y-player.y)<76).sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y))[0];
 if(near){if(near.locked){state.message='Locked vehicle';return;}player.car=near;player.lastCar=near;if(!near.owned&&!near.missionCar&&!state.requiresMissionCar)state.onTheft?.(near);near.owned=true;near.traffic=false;state.message='';}
}
export function updatePlayer(player,input,world,dt){if(player.car){player.x=player.car.x;player.y=player.car.y;player.vx=player.car.vx;player.vy=player.car.vy;return;}
 let x=Number(input.down('d','arrowright'))-Number(input.down('a','arrowleft')),y=Number(input.down('s','arrowdown'))-Number(input.down('w','arrowup'));const n=Math.hypot(x,y)||1,speed=input.down('shift')?265:170;x=x/n*speed;y=y/n*speed;player.vx=x;player.vy=y;if(x||y){player.angle=Math.atan2(y,x)+Math.PI/2;player.walk+=dt*speed*.06;}moveWithSlide(world,player,x*dt,y*dt,12);
}
function trafficControl(c,cars,dt){
 const vertical=Math.abs(Math.cos(c.angle))>.5,coord=vertical?c.y:c.x,spacing=vertical?450:600,origin=vertical?225:300;
 const intersection=Math.round((coord-origin)/spacing),distance=Math.abs(coord-(origin+intersection*spacing));
 if(distance<58&&c.intersection!==String(intersection)){c.stop=.55;c.intersection=String(intersection);}
 c.stop=Math.max(0,c.stop-dt);
 const fx=Math.sin(c.angle),fy=-Math.cos(c.angle);
 const blocked=cars.some(o=>o!==c&&((o.x-c.x)*fx+(o.y-c.y)*fy)>0&&((o.x-c.x)*fx+(o.y-c.y)*fy)<105&&Math.abs((o.x-c.x)*fy-(o.y-c.y)*fx)<32);
 const target=c.stop>0||blocked?0:c.cruise;c.braking=target<c.speed;c.speed+=(target-c.speed)*Math.min(1,dt*3);
 if(c.y<65){c.y=65;c.x-=42;c.angle=Math.PI;}if(c.y>2910){c.y=2910;c.x+=42;c.angle=0;}
}
export function updateCars(cars,player,input,world,dt){
 for(const c of cars){
  if(c===player.car){const throttle=Number(input.down('w','arrowup')),brake=Number(input.down('s','arrowdown'));c.throttle=throttle;c.braking=!!brake;c.steer=Number(input.down('d','arrowright'))-Number(input.down('a','arrowleft'));c.speed+=(throttle*c.accel-brake*c.accel*1.35)*dt;
   c.speed*=Math.exp(-dt*(input.down(' ')?2.0:throttle||brake?.18:.7));c.speed=Math.max(-CAR_TYPES[c.type].speed*.35,Math.min(CAR_TYPES[c.type].speed,c.speed));
   c.angle+=c.steer*c.turn*Math.min(1,Math.abs(c.speed)/140)*Math.sign(c.speed)*dt*(input.down(' ')?1.65:1);
  }else if(c.ai){c.ai(dt);
  }else if(c.traffic){trafficControl(c,cars,dt);
   if(Math.hypot(c.x-player.x,c.y-player.y)>1900){const lane=300+Math.max(0,Math.min(7,Math.round((player.x-300)/600)))*600;c.x=lane+21;c.y=Math.max(80,Math.min(2890,player.y+850));c.angle=0;}
  }else c.speed*=Math.exp(-dt*2);
  const targetX=Math.sin(c.angle)*c.speed,targetY=-Math.cos(c.angle)*c.speed,grip=c===player.car&&input.down(' ')?2.5:10;
  c.vx+=(targetX-c.vx)*Math.min(1,dt*grip);c.vy+=(targetY-c.vy)*Math.min(1,dt*grip);
  if(moveWithSlide(world,c,c.vx*dt,c.vy*dt,Math.max(c.w/2,22))){world.onCrash?.(c,null,Math.abs(c.speed));c.damage=Math.min(100,c.damage+Math.abs(c.speed)*.025);c.speed*=-.3;c.vx*=-.25;c.vy*=-.25;}
 }
 for(let i=0;i<cars.length;i++)for(let j=i+1;j<cars.length;j++){const a=cars[i],b=cars[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),r=(a.h+b.h)*.37;if(d>0&&d<r){const nx=dx/d,ny=dy/d,p=(r-d)/2;moveWithSlide(world,a,-nx*p,-ny*p,22);moveWithSlide(world,b,nx*p,ny*p,22);const impact=Math.hypot(a.vx-b.vx,a.vy-b.vy);if(impact>35)world.onCrash?.(a,b,impact);a.damage=Math.min(100,a.damage+impact*.012);b.damage=Math.min(100,b.damage+impact*.012);a.speed*=-.22;b.speed*=-.22;}}
}
export function populatePeds(world,player){return Array.from({length:26},(_,i)=>({x:0,y:0,angle:0,walk:i,shirt:['#f5c364','#80cbb6','#ae97d2','#e88077'][i%4],flee:0,down:0,respawn:true}));}
export function updatePeds(peds,player,cars,world,dt,reportCrime){
 for(const p of peds){if(p.respawn||Math.hypot(p.x-player.x,p.y-player.y)>900){const vertical=Math.random()<.5;const a=Math.random()*Math.PI*2,d=180+Math.random()*560;const x=Math.max(80,Math.min(4700,player.x+Math.cos(a)*d)),y=Math.max(80,Math.min(2900,player.y+Math.sin(a)*d));p.x=vertical?300+Math.round((x-300)/600)*600+57:x;p.y=vertical?y:225+Math.round((y-225)/450)*450+57;p.vertical=vertical;p.dir=Math.random()<.5?-1:1;p.respawn=false;}
 p.down=Math.max(0,p.down-dt);p.flee=Math.max(0,p.flee-dt);if(p.down)continue;
 for(const c of cars){const d=Math.hypot(c.x-p.x,c.y-p.y);if(Math.abs(c.speed)>100&&d<100){p.cower=Math.random()<.08;p.flee=2+Math.random()*2;p.away=Math.atan2(p.y-c.y,p.x-c.x);}if(d<28&&Math.abs(c.speed)>85){p.down=4;p.flee=8;p.away=Math.atan2(p.y-c.y,p.x-c.x);if(c===player.car)reportCrime('ped',p.x,p.y);c.speed*=.75;break;}}
 if(p.down)continue;if(p.flee&&p.cower){p.walk=0;continue;}let vx=0,vy=0;if(p.flee){vx=Math.cos(p.away||0)*260;vy=Math.sin(p.away||0)*260;}else{if(p.vertical)vy=p.dir*48;else vx=p.dir*48;const coord=p.vertical?p.y:p.x,spacing=p.vertical?450:600,origin=p.vertical?225:300;if(Math.abs(coord-(origin+Math.round((coord-origin)/spacing)*spacing+57))<2&&Math.random()<.025){p.vertical=!p.vertical;p.dir=Math.random()<.5?-1:1;}}
 p.angle=Math.atan2(vy,vx)+Math.PI/2;p.walk+=dt*(p.flee?18:6);if(moveWithSlide(world,p,vx*dt,vy*dt,8))p.dir*=-1;
 }
}

export function punch(g){const p=g.player;if(p.car||(p.punchTime||0)>0)return;p.punchTime=.32;g.audio.play('punch');const hit=o=>{const dx=o.x-p.x,dy=o.y-p.y,d=Math.hypot(dx,dy);return d<46&&(dx*Math.sin(p.angle)-dy*Math.cos(p.angle))/Math.max(d,1)>.25;};for(const ped of g.peds)if(!ped.down&&hit(ped)){ped.down=5;g.reportCrime('assault',ped.x,ped.y);return;}for(const c of g.cars)if(hit(c)){c.damage=Math.min(100,c.damage+4);if(Math.random()<.6){c.alarm=4;g.audio.play('alarm');}if([...g.peds,...g.police].some(o=>Math.hypot(o.x-c.x,o.y-c.y)<260))g.reportCrime('vandalism',c.x,c.y);return;}}
