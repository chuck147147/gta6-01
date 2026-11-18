import {WORLD,DISTRICTS,LANDMARKS} from './config.js';
import {mulberry32,range,pick,chance} from './random.js';
export function districtAt(x,y){return DISTRICTS.find(d=>x>=d.x&&y>=d.y&&x<d.x+d.w&&y<d.y+d.h)||DISTRICTS[4];}
export function buildWorld(seed){
 const rng=mulberry32(seed),roads=[],buildings=[],props=[],plazas=[],yards=[];
 for(let x=300;x<4800;x+=600)roads.push({x:x-46,y:0,w:92,h:3050,axis:'v',center:x});
 for(let y=225;y<3000;y+=450)roads.push({x:0,y:y-46,w:4800,h:92,axis:'h',center:y});
 for(let x=0;x<4800;x+=600)for(let y=0;y<2900;y+=450){
  const d=districtAt(x+300,y+225);
  for(let i=0;i<4;i++){
   const bx=x+65+(i%2)*300,by=y+65+Math.floor(i/2)*225;
   const w=range(rng,115,175),h=range(rng,88,135);
   if(by+h>2965)continue;
   buildings.push({x:bx,y:by,w,h,district:d.name,color:pick(rng,d.colors),height:range(rng,9,24),roof:Math.floor(rng()*3),awning:chance(rng,.45)});
  }
 }
 const landmarks=LANDMARKS.map(l=>({...l}));
 for(const l of landmarks.slice(0,-1)){
  buildings.splice(0,buildings.length,...buildings.filter(b=>!(b.x<l.x+180&&b.x+b.w>l.x-10&&b.y<l.y+115&&b.y+b.h>l.y-10)));
  buildings.push({x:l.x,y:l.y,w:178,h:108,color:l.color,height:23,roof:2,landmark:l,awning:true});
 }
 for(const r of roads){const length=r.axis==='v'?r.h:r.w;for(let p=80;p<length;p+=145){
  const x=r.axis==='v'?r.center+68:p,y=r.axis==='v'?p:r.center+68;
  props.push({type:chance(rng,.65)?'palm':'lamp',x,y,phase:rng()*6});
  if(p%290<145)props.push({type:'bench',x:x+19,y:y+17});
  if(chance(rng,.18))props.push({type:'hydrant',x:x-12,y:y-25});
 }}
 for(let x=80;x<4700;x+=130)props.push({type:'palm',x,y:3000,phase:rng()*6});
 // Split larger lots into paired storefronts and homes with narrow alleys.
 for(const b of [...buildings])if(!b.landmark&&b.w>135&&chance(rng,.65)){const w=(b.w-12)/2;b.w=w;buildings.push({...b,x:b.x+w+12,color:pick(rng,districtAt(b.x,b.y).colors),roof:(b.roof+1)%3});}
 for(let i=buildings.length-1;i>=0;i--){const b=buildings[i];if(!b.landmark&&i%17===0){plazas.push({...b});buildings.splice(i,1);}else if(!b.landmark&&i%19===0){yards.push({...b});buildings.splice(i,1);}}
 for(const b of buildings){b.windows=[];for(let x=b.x+12;x<b.x+b.w-12;x+=18)for(let y=b.y+22;y<b.y+b.h-18;y+=23)b.windows.push({x,y,lit:chance(rng,.72)});if(b.landmark?.sign==='CASINO')b.neon='CASINO';else if(districtAt(b.x,b.y).name==='NEON MILE'&&chance(rng,.48))b.neon=pick(rng,['CASINO','HOTEL','CLUB 44','RAMEN','PALMS HOTEL']);}
 for(let x=100;x<4700;x+=170){props.push({type:'palm',x:x+30,y:2945,phase:0});props.push({type:'umbrella',x,y:3030,phase:x});}
 for(let x=100;x<1700;x+=140)for(let y=120;y<1200;y+=450)props.push({type:'tree',x,y,phase:0});
 const parkingLots=[{x:2645,y:1390,w:180,h:140},{x:845,y:515,w:180,h:140},{x:3845,y:515,w:180,h:140},{x:1540,y:2740,w:180,h:140},{x:3245,y:1390,w:180,h:140},{x:2045,y:950,w:180,h:140}];
 for(const lot of parkingLots)buildings.splice(0,buildings.length,...buildings.filter(b=>!(b.x<lot.x+lot.w&&b.x+b.w>lot.x&&b.y<lot.y+lot.h&&b.y+b.h>lot.y)));
 return {seed,roads,buildings,props,plazas,yards,landmarks,parkingLots,water:[{x:0,y:3050},{x:4800,y:3050},{x:4800,y:3600},{x:0,y:3600}],beach:[{x:0,y:2965},{x:4800,y:2965},{x:4800,y:3050},{x:0,y:3050}],spawn:{x:1500,y:2770},width:WORLD.width,height:WORLD.height};
}
export function isLand(x,y,r=0){return x>=r&&x<=4800-r&&y>=r&&(y<=3050-r||(x>4440+r&&x<4640-r&&y<3230-r)||([180,410,640,870,4050,4170,4290].some(px=>x>=px+r&&x<=px+40-r)&&y<3310-r));}
export function circleHitsWorld(world,x,y,r){return !isLand(x,y,r)||world.buildings.some(b=>circleRect(x,y,r,b));}
export function circleRect(x,y,r,b){const dx=x-Math.max(b.x,Math.min(x,b.x+b.w)),dy=y-Math.max(b.y,Math.min(y,b.y+b.h));return dx*dx+dy*dy<r*r;}
export function moveWithSlide(world,body,dx,dy,r){let hit=false;if(!circleHitsWorld(world,body.x+dx,body.y,r))body.x+=dx;else hit=true;if(!circleHitsWorld(world,body.x,body.y+dy,r))body.y+=dy;else hit=true;return hit;}
