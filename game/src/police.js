import {createCar} from './entities.js';
import {moveWithSlide,circleHitsWorld,nearestTrafficRoadPoint} from './world.js';
export function initPolice(g){const wanted={level:0,heat:0,state:'clear',lastSeen:0,bust:0};g.wanted=wanted;g.police=[];
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 function pursuitPosition(c,minDistance,maxDistance){
  const {world,player}=g,radius=Math.max(c.w/2,22),bearingX=c.x-player.x,bearingY=c.y-player.y,bearingLength=Math.hypot(bearingX,bearingY)||1;
  let best=null,bestScore=Infinity;
  for(const road of world.roads){const vertical=road.axis==='v',along=vertical?player.y:player.x,start=vertical?road.y:road.x,end=start+(vertical?road.h:road.w);
   for(const lane of [road.center-30,road.center,road.center+30])for(let pos=Math.max(start+radius,along-maxDistance);pos<=Math.min(end-radius,along+maxDistance);pos+=10){
    const x=vertical?lane:pos,y=vertical?pos:lane,dx=x-player.x,dy=y-player.y,distance=Math.hypot(dx,dy);
    if(distance<minDistance||distance>maxDistance)continue;
    const alignment=(dx*bearingX+dy*bearingY)/(distance*bearingLength);
    let score=distance-minDistance+alignment*180+(alignment>0?300:0);
    if(score>=bestScore||circleHitsWorld(world,x,y,radius)||g.cars.some(other=>other!==c&&Math.hypot(other.x-x,other.y-y)<70))continue;
    for(let remaining=distance-6;remaining>=52;remaining-=6)if(circleHitsWorld(world,player.x+dx*remaining/distance,player.y+dy*remaining/distance,radius)){score+=1000+remaining;break;}
    for(const other of g.cars){if(other===c||other===player.car||other.traffic||other.ai)continue;
     const projection=((other.x-player.x)*dx+(other.y-player.y)*dy)/distance,lateral=Math.abs((other.x-player.x)*dy-(other.y-player.y)*dx)/distance;
     if(projection>=52&&projection<=distance&&lateral<(c.h+other.h)*.37)score+=450;
    }
    if(score<bestScore){bestScore=score;best={x,y,angle:Math.atan2(-dx,dy),speed:0,vx:0,vy:0};}
   }
  }
  return best;
 }
 function spawn(patrol=false){
  const c=createCar('sedan',1500,1575);Object.assign(c,{police:true,patrol,color:'#f2f1df',cruise:110});
  const a=Math.random()*Math.PI*2,d=500+Math.random()*300;c.x=g.player.x+Math.cos(a)*d;c.y=g.player.y+Math.sin(a)*d;
  const lane=300+clamp(Math.round((c.x-300)/600),0,7)*600,initialPoint=(!patrol&&pursuitPosition(c,420,520))||nearestTrafficRoadPoint(g.world,lane+21,clamp(c.y,100,2850));
  Object.assign(c,initialPoint,{pursuing:!patrol});
  c.recover=()=>{const point=pursuitPosition(c,c.pursuing?320:300,420);if(!point)return false;Object.assign(c,point);return true;};
  c.ai=dt=>{const dx=g.player.x-c.x,dy=g.player.y-c.y,distance=Math.hypot(dx,dy);c.pursuing=wanted.level>0&&(c.pursuing||distance<520);
   if(c.pursuing){const desired=Math.atan2(dx,-dy),diff=Math.atan2(Math.sin(desired-c.angle),Math.cos(desired-c.angle));c.angle+=clamp(diff,-3.4*dt,3.4*dt);const targetSpeed=Math.max(0,Math.min(285,(distance-38)*3))*Math.max(0,Math.cos(diff));c.speed+=(targetSpeed-c.speed)*dt*2.5;}
   else{c.speed+=(105-c.speed)*dt;if(c.y<80)c.angle=0;if(c.y>2890)c.angle=Math.PI;}
  };
  g.cars.push(c);g.police.push(c);return c;
 }
 g.spawnPolice=spawn;spawn(true);spawn(true);
 g.reportCrime=(kind,x=g.player.x,y=g.player.y)=>{if(kind==='punch')for(const p of g.peds)if(Math.hypot(p.x-x,p.y-y)<80){p.flee=3;p.away=Math.atan2(p.y-y,p.x-x);}if(kind==='carTheft'&&!g.peds.some(p=>Math.hypot(p.x-x,p.y-y)<260)&&!g.police.some(p=>Math.hypot(p.x-x,p.y-y)<260))return;const points={carTheft:35,theft:35,ped:40,police:35,traffic:12,punch:30,assault:35,vandalism:18};wanted.heat=Math.min(175,wanted.heat+(points[kind]||35));wanted.level=Math.min(5,Math.floor(wanted.heat/35));wanted.lastSeen=0;};
 g.clearWanted=()=>{Object.assign(wanted,{level:0,heat:0,state:'clear',bust:0,lastSeen:0});for(const c of [...g.police])if(!c.patrol){g.cars.splice(g.cars.indexOf(c),1);g.police.splice(g.police.indexOf(c),1);}};
 g.damage=(n)=>{const p=g.player,absorbed=Math.min(p.armor,n);p.armor-=absorbed;p.health-=n-absorbed;p.lastDamage=g.state.elapsed;};
 g.world.onCrash=(a,b,impact)=>{const soundDistance=Math.hypot(a.x-g.player.x,a.y-g.player.y);if(impact>35&&soundDistance<600)g.audio?.play('collision',impact/300*(1-soundDistance/600));if(g.activities?.taxi?.phase==='ride'&&(a===g.player.car||b===g.player.car))g.activities.taxi.clean=false;for(const p of g.peds)if(Math.hypot(p.x-a.x,p.y-a.y)<160){p.flee=3;p.away=Math.atan2(p.y-a.y,p.x-a.x);}if(!g.player.car||(a!==g.player.car&&b!==g.player.car))return;if(g.state.elapsed<(g.state.crashCooldown||0))return;g.state.crashCooldown=g.state.elapsed+1;if(b&&Math.abs(g.player.car.speed)>40)g.reportCrime(a.police||b.police?'police':'traffic');if(impact>160)g.damage((impact-150)*.055);};
}
export function reportCrime(kind,x,y){window.__game.reportCrime(kind,x,y);}
export function updatePolice(g,dt){const w=g.wanted,p=g.player;const seen=g.police.some(c=>Math.hypot(c.x-p.x,c.y-p.y)<460);w.state=w.level?(seen?'pursuit':'searching'):'clear';if(w.level){if(seen)w.lastSeen=0;else{w.lastSeen+=dt;w.heat=Math.max(w.level*35,w.heat-dt*.4);if(w.lastSeen>3.5+w.level*2.5){w.level--;w.heat=w.level*35;w.lastSeen=0;}}while(g.police.filter(c=>!c.patrol).length<w.level)g.spawnPolice();}
 const close=w.level&&g.police.some(c=>Math.hypot(c.x-p.x,c.y-p.y)<70);w.bust=Math.max(0,Math.min(3.5,w.bust+((close&&(!p.car||Math.abs(p.car.speed)<25))?dt:-dt*1.7)));if(close&&!p.car){const c=g.police.find(c=>Math.hypot(c.x-p.x,c.y-p.y)<70);const d=Math.hypot(p.x-c.x,p.y-c.y)||1;if(d<32)moveWithSlide(g.world,p,(p.x-c.x)/d*60*dt,(p.y-c.y)/d*60*dt,12);c.speed*=.92;}
 if(w.bust>=3.5)g.endLife('busted');if(p.health<=0)g.endLife('wasted');if(g.state.elapsed-p.lastDamage>10&&p.health<50)p.health=Math.min(50,p.health+dt*1.8);
 if(!w.level)for(const c of [...g.police])if(!c.patrol&&Math.hypot(c.x-p.x,c.y-p.y)>500){g.cars.splice(g.cars.indexOf(c),1);g.police.splice(g.police.indexOf(c),1);}
}
