/* Home page motion: the reel interlude (lazy play, parallax), drifting gold dust and the ornament draw-in. */
(function(){
  var film=document.getElementById('film');if(!film)return;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reels=[].slice.call(film.querySelectorAll('.film-reel')),vids=reels.map(function(r){return r.querySelector('video')});
  var orn=film.querySelector('.film-orn');

  /* scatter the dust */
  [].forEach.call(film.querySelectorAll('.film-dust i'),function(d){
    d.style.setProperty('--x',(Math.random()*100).toFixed(1));
    d.style.setProperty('--s',(1.5+Math.random()*3).toFixed(1)+'px');
    d.style.setProperty('--t',(10+Math.random()*12).toFixed(1)+'s');
    d.style.setProperty('--w',(-Math.random()*20).toFixed(1)+'s');
  });

  function play(on){vids.forEach(function(v){
    if(on){if(!v.src)v.src=v.getAttribute('data-src');var q=v.play();if(q&&q.catch)q.catch(function(){})}
    else if(!v.paused)v.pause();
  })}

  if('IntersectionObserver' in window){
    new IntersectionObserver(function(en){en.forEach(function(x){
      if(x.isIntersecting&&orn)orn.classList.add('in');
      if(!reduce)play(x.isIntersecting);
    })},{threshold:.25,rootMargin:'200px 0px'}).observe(film);
  }else if(orn)orn.classList.add('in');

  if(reduce)return;
  /* outer reels drift against the scroll */
  var ticking=false;
  function frame(){
    ticking=false;
    var r=film.getBoundingClientRect(),vh=innerHeight;
    if(r.bottom<0||r.top>vh)return;
    var p=(r.top+r.height/2-vh/2)/vh;
    reels.forEach(function(el){el.style.transform='translate3d(0,'+(p*parseFloat(el.getAttribute('data-speed'))*600).toFixed(1)+'px,0)'});
  }
  addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(frame)}},{passive:true});
  frame();
})();

/* Second round: scroll progress, gold curtains on photos, stat rings, drawn section lines,
   magnetic buttons, orbiting rings behind the closing call and a cursor tilt on the reels. */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia&&matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
  function mk(tag,cls){var e=document.createElement(tag);e.className=cls;e.setAttribute('aria-hidden','true');return e}

  /* gold gradient shared by the stat rings */
  var defs=document.createElementNS('http://www.w3.org/2000/svg','svg');
  defs.setAttribute('width','0');defs.setAttribute('height','0');defs.setAttribute('aria-hidden','true');defs.style.position='absolute';
  defs.innerHTML='<defs><linearGradient id="mGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8c6b22"/><stop offset=".5" stop-color="#f1d98a"/><stop offset="1" stop-color="#d4af37"/></linearGradient></defs>';
  document.body.appendChild(defs);

  var watch=[];
  /* curtains on the service photos and gallery tiles */
  $$('.panel .photo').forEach(function(p){p.appendChild(mk('span','m-cur'));watch.push(p)});
  $$('.g-item').forEach(function(g,i){var c=mk('span','m-cur');c.style.setProperty('--cd',(i%4*.12)+'s');g.appendChild(c);watch.push(g)});
  /* rings around the numbers */
  $$('.stat .num').forEach(function(n){
    var w=mk('div','m-numwrap');w.removeAttribute('aria-hidden');n.parentNode.insertBefore(w,n);w.appendChild(n);
    var s=document.createElementNS('http://www.w3.org/2000/svg','svg');
    s.setAttribute('class','m-ring');s.setAttribute('viewBox','0 0 200 200');s.setAttribute('aria-hidden','true');
    s.innerHTML='<circle cx="100" cy="100" r="96"/><circle cx="100" cy="100" r="88"/>';
    w.insertBefore(s,n);watch.push(w);
  });
  /* drawn top borders */
  $$('.sec').forEach(function(s){s.appendChild(mk('span','m-line'));watch.push(s)});
  /* orbiting rings behind the closing call */
  var closing=document.querySelector('.closing');
  if(closing){var o=mk('div','m-orbit');o.innerHTML='<i style="--k:0"></i><i style="--k:1"></i><i style="--k:2"></i>';closing.insertBefore(o,closing.firstChild)}

  if(reduce){watch.forEach(function(e){e.classList.add('m-in')});return}

  /* reveal on scroll (a plain position check, so nothing can stay covered) + scroll progress */
  var bar=mk('div','m-progress');document.body.appendChild(bar);
  var t=false;
  function tick(){
    t=false;
    var vh=innerHeight,d=document.documentElement,m=d.scrollHeight-vh;
    bar.style.setProperty('--p',m>0?(scrollY/m).toFixed(4):0);
    watch=watch.filter(function(e){var r=e.getBoundingClientRect();if(r.top<vh*.9&&r.bottom>0){e.classList.add('m-in');return false}return true});
  }
  function req(){if(!t){t=true;requestAnimationFrame(tick)}}
  addEventListener('scroll',req,{passive:true});addEventListener('resize',req);addEventListener('load',req);tick();

  if(!fine)return;
  /* magnetic buttons */
  $$('.btn,.tlink').forEach(function(b){
    if(b.closest('.mbar,.nav,.menu'))return;
    b.classList.add('m-mag');
    b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.22).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.3).toFixed(1)+'px)'});
    b.addEventListener('mouseleave',function(){b.style.transform=''});
  });
  /* reels tilt with the cursor */
  var film=document.getElementById('film');
  if(film){
    var row=film.querySelector('.film-row');
    film.addEventListener('mousemove',function(e){var r=film.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;row.style.transform='rotateY('+(x*10).toFixed(2)+'deg) rotateX('+(-y*6).toFixed(2)+'deg)'});
    film.addEventListener('mouseleave',function(){row.style.transform=''});
    row.style.transition='transform .8s cubic-bezier(.16,1,.3,1)';row.style.transformStyle='preserve-3d';
  }
})();
