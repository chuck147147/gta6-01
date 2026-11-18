export function createInput(canvas){const keys=new Set(),pressed=new Set(),mouse={x:0,y:0};
 const normalize=e=>e.key.toLowerCase();
 addEventListener('keydown',e=>{const k=normalize(e);if(['arrowup','arrowdown','arrowleft','arrowright',' ','enter'].includes(k))e.preventDefault();if(!keys.has(k))pressed.add(k);keys.add(k);});
 addEventListener('keyup',e=>keys.delete(normalize(e)));addEventListener('blur',()=>{keys.clear();pressed.clear();});
 canvas.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect();mouse.x=(e.clientX-r.left)*1280/r.width;mouse.y=(e.clientY-r.top)*720/r.height;});
 canvas.addEventListener('mousedown',e=>{if(e.button===0)pressed.add('mouse1');});
 return {keys,pressed,mouse,down(...names){return names.some(k=>keys.has(k));},clear(){pressed.clear();}};
}
