import {createAudio} from './audio.js';
import {initActivities,updateActivities} from './activities.js';
import {punch} from './entities.js';
import {WIDTH,HEIGHT,STEP} from './config.js';
import {buildWorld,districtAt} from './world.js';
import {createInput} from './input.js';
import {createPlayer,populateCars,populatePeds,updatePeds,updatePlayer,updateCars,interact} from './entities.js';
import {renderScene} from './render.js';
import {drawHUD,drawTitle,drawPause,drawSystems} from './hud.js';
import {stageShot} from './shots.js';
import {initPolice,updatePolice} from './police.js';
import {initMissions,updateMissions} from './missions.js';
import {shopNear,purchase} from './economy.js';
import {loadSave,saveGame} from './save.js';
const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),input=createInput(canvas),params=new URLSearchParams(location.search);
const rawSeed=Number(params.get('seed')??6),world=buildWorld(Number.isFinite(rawSeed)?rawSeed:6),player=createPlayer(world),cars=populateCars(world);
const state={mode:'title',timeOfDay:.42,elapsed:0,district:'MARINA DISTRICT',banner:4,objective:'',message:'',pauseChoice:0,shot:null,playtimeSec:0,hasSave:!!loadSave()};
const camera={x:player.x,y:player.y,zoom:1};
const g=window.__game={state,player,cars,camera,world,peds:populatePeds(world,player)};state.peds=g.peds;initPolice(g);initMissions(g,loadSave());
g.audio=createAudio();initActivities(g,loadSave());
state.onTheft=c=>g.reportCrime('carTheft',c.x,c.y);
g.endLife=kind=>{if(state.mode!=='play')return;g.audio.play(kind==='busted'?'busted':'failed');g.failMission(kind==='busted'?'Busted by police':'Wasted');const fee=Math.ceil(Math.max(kind==='busted'?50:100,player.cash*(kind==='busted'?.15:.1)));player.cash=Math.max(0,player.cash-fee);state.lifeFee=fee;state.mode=kind;g.clearWanted();saveGame(g);};
function begin(fresh=false){for(let i=cars.length-1;i>=0;i--)if(cars[i].missionCar||cars[i].target)cars.splice(i,1);Object.assign(player,createPlayer(world));const saved=fresh?null:loadSave();if(saved){player.cash=saved.cash;player.armor=saved.armor||0;state.playtimeSec=saved.playtimeSec||0;}initMissions(g,saved);initActivities(g,saved);state.timeOfDay=.42;g.clearWanted();state.mode='play';state.shot=null;camera.rotation=0;state.splash=null;camera.x=player.x;camera.y=player.y;}
function actions(){const p=input.pressed;if(p.has('m'))g.audio.toggle();if(p.size){g.audio.start();if(p.has('enter')||p.has('arrowdown')||p.has('arrowup'))g.audio.play('ui');}if(state.mode==='play'&&(p.has('f')||p.has('mouse1')))punch(g);
 if(state.mode==='title'){if(p.has('enter')||p.has('n'))begin(p.has('n'));}
 else if(['busted','wasted','story'].includes(state.mode)){if(p.has('enter')){if(state.mode!=='story'){player.car=null;player.health=100;player.armor=0;player.x=state.mode==='busted'?3150:750;player.y=state.mode==='busted'?1530:650;state.timeOfDay=(state.timeOfDay+.1)%1;}state.mode='play';saveGame(g);}}
 else if(state.mode==='shop'){if(p.has('escape')||p.has('e'))state.mode='play';else for(const key of ['1','2'])if(p.has(key))purchase(g,key);}
 else if(state.mode==='pause'){const choices=g.missions.current?['Resume','Restart mission','Quit to title']:['Resume','Quit to title'];state.pauseItems=choices;if(p.has('arrowdown')||p.has('s'))state.pauseChoice=(state.pauseChoice+1)%choices.length;if(p.has('arrowup')||p.has('w'))state.pauseChoice=(state.pauseChoice+choices.length-1)%choices.length;if(p.has('escape')||p.has('p'))state.mode='play';if(p.has('enter')){const c=choices[state.pauseChoice];if(c==='Quit to title'){saveGame(g);state.hasSave=true;state.mode='title';}else{state.mode='play';if(c==='Restart mission'){g.failMission('Restarted');g.startMission();}}}}
 else if(state.mode==='play'){if(p.has('escape')||p.has('p')){state.mode='pause';state.pauseChoice=0;state.pauseItems=g.missions.current?['Resume','Restart mission','Quit to title']:['Resume','Quit to title'];}else if(p.has('e')||p.has('enter')){state.shot=null;camera.rotation=0;const line=g.missions.dialogue[0];if(state.prompt?.startsWith('E — Start'))g.startMission();else if(shopNear(g)){state.shop=shopNear(g);state.shopMessage='';state.mode='shop';}else if(player.car||cars.some(c=>Math.hypot(c.x-player.x,c.y-player.y)<76)){interact(player,cars,world,state);g.audio.play('door');}if(line&&g.missions.dialogue[0]===line){g.missions.dialogue.shift();g.missions.lineTime=0;}}}
 input.clear();}
let saveClock=0;
function update(dt){if(state.shot||!['play','title'].includes(state.mode))return;state.elapsed+=dt;if(state.mode==='title'){camera.x=2400+Math.sin(state.elapsed*.035)*650;camera.y=1500;camera.zoom=.88;return;}
 state.timeOfDay=(state.timeOfDay+dt/360)%1;player.punchTime=Math.max(0,(player.punchTime||0)-dt);state.playtimeSec+=dt;state.cashTime=Math.max(0,(state.cashTime||0)-dt);if(state.splash){state.splash.time-=dt;if(state.splash.time<=0)state.splash=null;}
 updateCars(cars,player,input,world,dt);updatePlayer(player,input,world,dt);updatePeds(g.peds,player,cars,world,dt,g.reportCrime);updatePolice(g,dt);if(state.mode!=='play')return;updateMissions(g,dt);updateActivities(g,dt);state.missionActive=!!g.missions.current;state.passengers=player.passengers;const shop=shopNear(g);if(shop)state.prompt='E — '+shop.name;
 const district=districtAt(player.x,player.y).name;if(district!==state.district){state.district=district;state.banner=4;}state.banner=Math.max(0,state.banner-dt);
 const speed=player.car?Math.abs(player.car.speed):0;camera.zoom+=(1-speed/2100-camera.zoom)*(1-Math.exp(-dt*3));camera.x+=(player.x+player.vx*.25-camera.x)*(1-Math.exp(-dt*5));camera.y+=(player.y+player.vy*.25-camera.y)*(1-Math.exp(-dt*5));camera.x=Math.max(WIDTH/2/camera.zoom,Math.min(4800-WIDTH/2/camera.zoom,camera.x));camera.y=Math.max(HEIGHT/2/camera.zoom,Math.min(3600-HEIGHT/2/camera.zoom,camera.y));saveClock+=dt;if(saveClock>15){saveClock=0;saveGame(g);}}
updatePeds(g.peds,player,cars,world,0,g.reportCrime);updateMissions(g,0);
stageShot(params.get('shot'),state,player,cars,camera,g);
let last=0,accumulator=0,shotFrames=0;
function frame(now){const dt=Math.min((now-last)/1000,.1);last=now;actions();accumulator+=dt;while(accumulator>=STEP){update(STEP);accumulator-=STEP;}g.audio.update(g,dt);const subtitle=g.missions.dialogue[0];if(subtitle!==state.lastSubtitle){if(subtitle)g.audio.play('subtitle');state.lastSubtitle=subtitle;}renderScene(ctx,world,cars,player,camera,state);if(state.mode==='title')drawTitle(ctx,state);else{drawHUD(ctx,world,player,cars,state);drawSystems(ctx,g);if(state.mode==='pause')drawPause(ctx,state);}if(state.shot&&++shotFrames>=30)document.title='SHOT-READY';else if(!state.shot)document.title='PALMERA BAY — READY';requestAnimationFrame(frame);}requestAnimationFrame(frame);
