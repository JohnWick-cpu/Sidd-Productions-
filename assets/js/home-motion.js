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
