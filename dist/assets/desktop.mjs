import { constrainPosition, dockScale } from './desktop-math.mjs';

const board = document.querySelector('.desk');
const objects = [...board.querySelectorAll('[data-object]')];
const positions = new Map(objects.map(el=>[el,{x:0,y:0}]));
const desktop = matchMedia('(min-width: 981px)');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const announcement = board.querySelector('#desktop-announcement');
let active = null;
let front = 3;
let suppressClick = null;

function place(el, x, y) {
  const next = constrainPosition({x,y,width:el.offsetWidth,height:el.offsetHeight},{width:board.clientWidth,height:board.clientHeight});
  const offset = {x:next.x-el.offsetLeft,y:next.y-el.offsetTop};
  positions.set(el,offset);
  el.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
}

function restore(el) {
  positions.set(el,{x:0,y:0});
  el.style.removeProperty('transform');
  el.style.removeProperty('z-index');
}

function resetAll() {
  if(active) {
    active.el.classList.remove('is-dragging');
    if(active.el.hasPointerCapture(active.id)) active.el.releasePointerCapture(active.id);
    active=null;
  }
  objects.forEach(restore);
  announcement.textContent = 'Desktop layout restored.';
}

board.addEventListener('pointerdown', event=>{
  if(!desktop.matches || event.button!==0 || !event.isPrimary) return;
  const el = event.target.closest('[data-object]');
  if(!el) return;
  // Interaction finishes the entrance once, so dropping cannot replay its delay.
  el.querySelector('.widget-entrance').style.animation = 'none';
  const pos = positions.get(el);
  active = {el,id:event.pointerId,startX:event.clientX,startY:event.clientY,x:pos.x,y:pos.y,moved:false};
  el.style.zIndex = ++front;
});

board.addEventListener('pointermove',event=>{
  if(!active || event.pointerId!==active.id) return;
  const dx=event.clientX-active.startX, dy=event.clientY-active.startY;
  if(!active.moved && Math.hypot(dx,dy)<5) return;
  if(!active.moved) {
    active.moved=true;
    active.el.setPointerCapture(event.pointerId);
    active.el.classList.add('is-dragging');
  }
  event.preventDefault();
  place(active.el,active.el.offsetLeft+active.x+dx,active.el.offsetTop+active.y+dy);
});

function finishDrag(event) {
  if(!active || event.pointerId!==active.id) return;
  const {el,moved,id}=active;
  if(event.type==='pointercancel') {
    place(el,el.offsetLeft+active.x,el.offsetTop+active.y);
  }
  if(el.hasPointerCapture(id)) el.releasePointerCapture(id);
  el.classList.remove('is-dragging');
  if(moved) {
    suppressClick=el;
    setTimeout(()=>{suppressClick=null;},0);
    announcement.textContent = `${el.dataset.object} moved.`;
  }
  active=null;
}
addEventListener('pointerup',finishDrag);
addEventListener('pointercancel',finishDrag);
board.addEventListener('click',event=>{
  if(suppressClick && suppressClick.contains(event.target)) {
    event.preventDefault();
    event.stopPropagation();
  }
},true);

board.addEventListener('keydown',event=>{
  const handle=event.target.closest('[data-drag-handle]');
  if(!handle || !desktop.matches) return;
  const el=handle.closest('[data-object]');
  el.querySelector('.widget-entrance').style.animation = 'none';
  if(event.key==='Home') {
    event.preventDefault();restore(el);
    announcement.textContent=`${el.dataset.object} restored.`;
    return;
  }
  const movement={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
  if(!movement) return;
  event.preventDefault();
  const p=positions.get(el),step=event.shiftKey?40:10;
  el.style.zIndex=++front;
  place(el,el.offsetLeft+p.x+movement[0]*step,el.offsetTop+p.y+movement[1]*step);
  announcement.textContent=`${el.dataset.object} moved.`;
});

function handleResize() {
  if(!desktop.matches) { resetAll();return; }
  for(const el of objects) {
    const p=positions.get(el);
    if(p.x||p.y) place(el,el.offsetLeft+p.x,el.offsetTop+p.y);
  }
}
addEventListener('resize',handleResize);
desktop.addEventListener('change',handleResize);

// Follow the actual Jakarta time; CSS rotation avoids an animated tick/reset.
const timeFormat=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
function updateAnalogClock() {
  const now=new Date();
  const parts=Object.fromEntries(timeFormat.formatToParts(now).map(p=>[p.type,p.value]));
  const hour=Number(parts.hour)%12,minute=Number(parts.minute),second=Number(parts.second);
  document.querySelector('#clock-hour').style.transform=`rotate(${hour*30+minute*.5}deg)`;
  document.querySelector('#clock-minute').style.transform=`rotate(${minute*6+second*.1}deg)`;
  document.querySelector('#clock-second').style.transform=`rotate(${second*6}deg)`;
}
updateAnalogClock();
setInterval(updateAnalogClock,1000);

const dock=document.querySelector('.desktop-dock');
const items=[...dock.querySelectorAll('.dock-item')];
const tiles=items.map(el=>el.querySelector('.dock-tile'));
const surface=dock.querySelector('.dock-surface');
let pointerX=null, frame=0;
function positionDockLabels() {
  dock.classList.toggle('labels-below',dock.getBoundingClientRect().top<90);
}
function paintDock() {
  frame=0;
  const scales=items.map(el=>pointerX===null||reduceMotion.matches?1:dockScale(pointerX-(dock.getBoundingClientRect().left+el.offsetLeft+el.offsetWidth/2)));
  const base=items.map(el=>el.offsetWidth);
  const gap=parseFloat(getComputedStyle(dock).columnGap);
  const original=base.reduce((a,b)=>a+b,0)+gap*(items.length-1);
  const expanded=base.reduce((sum,w,i)=>sum+w*scales[i],0)+gap*(items.length-1);
  let before=0;
  items.forEach((el,i)=>{
    const center=before+base[i]*scales[i]/2-expanded/2;
    const originalCenter=el.offsetLeft+base[i]/2-dock.clientWidth/2;
    el.style.transform=`translateX(${center-originalCenter}px)`;
    tiles[i].style.transform=`scale(${scales[i]})`;
    before+=base[i]*scales[i]+gap;
  });
  surface.style.transform=`scaleX(${(expanded+26)/(original+26)})`;
  positionDockLabels();
}
function scheduleDock() { if(!frame) frame=requestAnimationFrame(paintDock); }
dock.addEventListener('pointermove',event=>{
  if(event.pointerType!=='mouse') return;
  pointerX=event.clientX;scheduleDock();
});
dock.addEventListener('pointerleave',()=>{pointerX=null;scheduleDock();});
dock.addEventListener('focusin',()=>{pointerX=null;positionDockLabels();scheduleDock();});
dock.addEventListener('pointerenter',positionDockLabels);
let labelFrame=0;
addEventListener('scroll',()=>{
  if(!labelFrame) labelFrame=requestAnimationFrame(()=>{labelFrame=0;positionDockLabels();});
},{passive:true});
positionDockLabels();
reduceMotion.addEventListener('change',()=>{pointerX=null;scheduleDock();});
addEventListener('resize',()=>{pointerX=null;scheduleDock();});
