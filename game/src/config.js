export const WIDTH=1280, HEIGHT=720, STEP=1/120;
export const WORLD={width:4800,height:3600,shore:3050,roadWidth:92,avenue:600,street:450};
export const DISTRICTS=[
 {name:'CORAL HEIGHTS',x:0,y:0,w:1800,h:1350,colors:['#edaf9e','#efce9c','#a7c9ba','#d4b6cb']},
 {name:'OLD PORT',x:3000,y:0,w:1800,h:1800,colors:['#81989e','#b6a38a','#9299a4','#c6bda3']},
 {name:'MARINA DISTRICT',x:0,y:1800,w:2400,h:1800,colors:['#e4e8db','#9fc9d2','#f0d9b4','#a6c2c4']},
 {name:'PALM HEIGHTS',x:3000,y:1800,w:1800,h:1800,colors:['#eacdbc','#eeddb5','#ccd6b0','#d4bbb4']},
 {name:'NEON MILE',x:0,y:0,w:4800,h:3600,colors:['#867e9e','#b990a6','#739eab','#acb0ba']}];
export const LANDMARKS=[
 {name:'The Gilded Palm',x:2460,y:1390,color:'#e9b24e',sign:'CASINO'},
 {name:'Torque & Sons Auto',x:3660,y:515,color:'#6caeb2',sign:'TORQUE & SONS'},
 {name:'Palmera General Hospital',x:660,y:515,color:'#dfdfce',sign:'HOSPITAL +'},
 {name:'Central Police HQ',x:3060,y:1390,color:'#8095aa',sign:'POLICE'},
 {name:'Bay Mart',x:1260,y:2290,color:'#e5c6a4',sign:'BAY MART'},
 {name:'The Lighthouse',x:4540,y:3150,color:'#f2e7c9',sign:'LIGHTHOUSE'}];
const colors=['#d87367','#e8d8bb','#528f9b','#869b79','#444e68','#b8a3bd'];
export const CAR_TYPES={
 compact:{name:'Pico',speed:290,accel:215,turn:2.9,w:29,h:52,colors},
 sedan:{name:'Regent',speed:360,accel:230,turn:2.35,w:32,h:65,colors},
 taxi:{name:'Taxi',speed:350,accel:230,turn:2.35,w:32,h:65,colors:['#efc54c']},
 sports:{name:'Veloce',speed:520,accel:340,turn:2.7,w:33,h:66,colors:['#f07757','#37c2bf','#dce5d8','#ba75c6']},
 pickup:{name:'Mesa',speed:310,accel:180,turn:1.65,w:35,h:72,colors},
 van:{name:'Parcel',speed:280,accel:165,turn:1.8,w:36,h:76,colors}};
