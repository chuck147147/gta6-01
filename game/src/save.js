const KEY='palmera-bay-save-v1';
export function loadSave(){try{const s=JSON.parse(localStorage.getItem(KEY));return s&&Number.isFinite(s.cash)?s:null;}catch{return null;}}
export function saveGame(g){try{localStorage.setItem(KEY,JSON.stringify({vinyl:[...(g.activities?.foundIds||[])],taxiFares:g.activities?.taxiFares||0,cash:g.player.cash,armor:g.player.armor,nextMission:g.missions.nextMission,storyComplete:g.missions.storyComplete,playtimeSec:g.state.playtimeSec||0}));}catch{}}
