import {createCar} from './entities.js';
// Every staged vehicle uses the named east/west road and an explicit lane.
// Distances are checked on the same objects used by the renderer and HUD.
export function stageShot(name,state,player,cars,camera,g){
 if(!['chase','mission','foot','night','title','drive'].includes(name))return false;
 state.shot=name;state.mode=name==='title'?'title':'play';state.elapsed=12.12;state.timeOfDay=.5;state.banner=0;state.prompt='';state.message='';state.objective='Explore Palmera Bay';g.missions.dialogue=[];g.clearWanted();cars.length=0;g.police.length=0;g.peds.length=0;
 const pose=(type,x,y,road,options={})=>{const c=createCar(type,x,y,Math.PI/2);Object.assign(c,{road,owned:true,speed:180},options);cars.push(c);if(c.police)g.police.push(c);return c;};
 const drive=c=>{player.car=c;Object.assign(player,{x:c.x,y:c.y,vx:c.speed,vy:0});c.vx=c.speed;};
 if(name==='title'){Object.assign(camera,{x:2370,y:1430,zoom:.88});return true;}
 if(name==='chase'||name==='drive'){
 state.timeOfDay=.76;drive(pose('sports',2550,1597,'Neon Avenue (y=1575)',{color:'#ff863e',speed:380}));
 pose('sedan',2400,1553,'Neon Avenue (y=1575)',{police:true,pursuing:true,color:'#eee9dc',speed:370});
 pose('sedan',2320,1597,'Neon Avenue (y=1575)',{police:true,pursuing:true,color:'#eee9dc',speed:370});
 pose('sedan',2160,1553,'Neon Avenue (y=1575)',{police:true,pursuing:true,color:'#eee9dc',speed:365});
 pose('compact',2840,1553,'Neon Avenue (y=1575)',{color:'#69c9c1',speed:200});
 Object.assign(g.wanted,{level:3,heat:105,state:'pursuit'});state.target={x:3070,y:1597};state.objective='Lose the police — protect the cargo';state.missionActive=true;Object.assign(camera,{x:2545,y:1560,zoom:1.12,rotation:-.10});
 }else if(name==='mission'){
 drive(pose('sports',4020,2497,'Palm Heights Boulevard (y=2475)',{color:'#f48357',speed:240}));pose('sedan',4440,2453,'Palm Heights Boulevard (y=2475)',{speed:150});pose('taxi',3650,2453,'Palm Heights Boulevard (y=2475)',{speed:150});state.target={x:4270,y:2475};state.missionActive=true;state.objective='PACKAGE RUN — Deliver to the Palm Heights villa';Object.assign(g.missions,{current:'package-run',nextMission:1,objectiveIndex:1,timer:118,maxTimer:150,dialogue:[{who:'DELIA',text:"Keep moving, Jax. The villa is waiting. Don't bring company."}]});Object.assign(camera,{x:4100,y:2470,zoom:1.0});
 for(let i=0;i<4;i++)g.peds.push({x:[3900,4050,4350,4520][i],y:i%2?2535:2545,angle:i%2?-Math.PI/2:Math.PI/2,walk:i,shirt:['#f7bd65','#8ad5c1','#e98691','#b2a2de'][i%4],down:0});
 }else if(name==='foot'){
 player.car=null;Object.assign(player,{x:4380,y:2980,angle:Math.PI/2});pose('taxi',4240,2947,'Marina Drive (y=2925)',{speed:150});pose('compact',4600,2903,'Marina Drive (y=2925)',{speed:140});
 for(let i=0;i<8;i++)g.peds.push({x:4110+i*65,y:2982+i%2*22,angle:i%2?Math.PI/2:-Math.PI/2,walk:i,shirt:['#f7bd65','#8ad5c1','#e98691','#b2a2de'][i%4],down:0});state.objective='Marina boardwalk • A little paradise';Object.assign(camera,{x:4140,y:2980,zoom:1});
 }else{
 state.timeOfDay=.95;drive(pose('sports',2420,1597,'Neon Avenue (y=1575)',{color:'#33cbc7',speed:220}));pose('taxi',2760,1553,'Neon Avenue (y=1575)',{speed:140});pose('sedan',2950,1597,'Neon Avenue (y=1575)',{police:true,pursuing:true,color:'#eee9dc',speed:180});state.objective='NEON MILE • After hours';Object.assign(camera,{x:2550,y:1470,zoom:1});
 }
 state.peds=g.peds;state.district=name==='foot'?'MARINA DISTRICT':name==='mission'?'PALM HEIGHTS':'NEON MILE';
 const pairs=[];for(let i=0;i<cars.length;i++)for(let j=i+1;j<cars.length;j++){const d=Math.hypot(cars[i].x-cars[j].x,cars[i].y-cars[j].y);pairs.push({a:i,b:j,distance:+d.toFixed(2)});if(d<(cars[i].h+cars[j].h)/2)throw Error('Shot cars overlap');}
 g.shotCheck={pairs,minDistance:Math.min(...pairs.map(p=>p.distance)),roads:cars.map(c=>c.road)};console.info('POSE',name,JSON.stringify(g.shotCheck));return true;
}
