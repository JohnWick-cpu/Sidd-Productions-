/* Home page live layer.
   - Gold sparks rising over the hero (canvas), paused when off-screen or tab hidden
   - "Next up" chip with a live countdown to the next night
   - "This week" strip of upcoming posters, each linking straight to its RSVP form
   Event data comes from events.html (#gl-data), the single source of truth. */
(function(){
  'use strict';
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  /* Bengaluru "today", counted until 4 AM so a night stays current while it is on */
  var TODAY=new Date(Date.now()+5.5*3600e3-4*3600e3).toISOString().slice(0,10);
  function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function d(s){return new Date(s+'T00:00:00Z')}
  function nice(s){var x=d(s);return DOW[x.getUTCDay()]+' '+x.getUTCDate()+' '+MON[x.getUTCMonth()]}
  function startMs(x){var hm=(x.start||'20:00').split(':');return Date.parse(x.date+'T'+('0'+hm[0]).slice(-2)+':'+('0'+(hm[1]||'00')).slice(-2)+':00+05:30')}
  function rsvp(x,src){return 'events.html?book='+encodeURIComponent(x.id)+'&utm_source=site&utm_medium='+src+'&utm_campaign='+encodeURIComponent(x.id)}

  /* ---------- sparks ---------- */
  function sparks(){
    var cv=document.getElementById('heroFx');if(!cv||reduce)return;
    var ctx=cv.getContext('2d'),W=0,H=0,dpr=Math.min(window.devicePixelRatio||1,2),P=[],run=false,raf=0,vis=true;
    function size(){var r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
    function spawn(){return {x:Math.random()*W,y:H+10,r:Math.random()*1.8+.6,vy:-(Math.random()*.9+.35),vx:(Math.random()-.5)*.35,a:Math.random()*.6+.35,t:Math.random()*6.28,life:0}}
    function frame(){
      ctx.clearRect(0,0,W,H);
      var n=Math.round(Math.min(90,W/14));while(P.length<n)P.push(spawn());
      for(var i=0;i<P.length;i++){var p=P[i];p.t+=.03;p.life++;p.x+=p.vx+Math.sin(p.t)*.25;p.y+=p.vy;
        var fade=Math.min(1,p.life/40)*Math.max(0,Math.min(1,p.y/(H*.35)));
        var g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);
        g.addColorStop(0,'rgba(255,226,140,'+(p.a*fade)+')');g.addColorStop(1,'rgba(212,175,55,0)');
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*4,0,6.283);ctx.fill();
        if(p.y<-10||fade<=0&&p.life>60)P[i]=spawn();}
      raf=requestAnimationFrame(frame);
    }
    function set(){var on=vis&&!document.hidden;if(on&&!run){run=true;raf=requestAnimationFrame(frame)}else if(!on&&run){run=false;cancelAnimationFrame(raf)}}
    size();window.addEventListener('resize',size,{passive:true});
    if('IntersectionObserver' in window){new IntersectionObserver(function(e){vis=e[0].isIntersecting;set()}).observe(cv)}
    document.addEventListener('visibilitychange',set);set();
  }

  /* ---------- next-up chip ---------- */
  function nextUp(list){
    var a=document.getElementById('heroNext');if(!a||!list.length)return;
    var x=list[0],t=startMs(x);
    a.href=rsvp(x,'hero');
    a.querySelector('.hn-t').textContent=x.title;
    var c=a.querySelector('.hn-c'),k=a.querySelector('.hn-k');
    function tick(){
      var ms=t-Date.now();
      if(x.date===TODAY&&ms<=0){k.textContent='Happening tonight';c.textContent=nice(x.date)+' · '+(x.time||'8 PM onwards');return}
      k.textContent=x.date===TODAY?'Tonight':'Next up';
      if(ms<=0){c.textContent=nice(x.date);return}
      var s=Math.floor(ms/1000),dd=Math.floor(s/86400),hh=Math.floor(s%86400/3600),mm=Math.floor(s%3600/60),ss=s%60;
      c.textContent=nice(x.date)+' · starts in '+(dd?dd+'d ':'')+('0'+hh).slice(-2)+'h '+('0'+mm).slice(-2)+'m'+(dd?'':' '+('0'+ss).slice(-2)+'s');
    }
    tick();setInterval(tick,1000);a.hidden=false;
  }

  /* ---------- this-week strip ---------- */
  function strip(list){
    var sec=document.getElementById('thisweek'),row=document.getElementById('wkRow');if(!sec||!row||!list.length)return;
    row.innerHTML=list.slice(0,8).map(function(x,i){
      var dt=d(x.date);
      return '<a class="wk-card" href="'+rsvp(x,'thisweek')+'">'+
        '<div class="wk-art"><img src="assets/img/events/'+esc(x.id)+'-sm.webp" alt="'+esc(x.alt||('Poster for '+x.title))+'" loading="'+(i<4?'eager':'lazy')+'" decoding="async" width="540" height="675">'+
        '<span class="wk-date"><b>'+dt.getUTCDate()+'</b><small>'+DOW[dt.getUTCDay()]+'</small></span>'+
        (x.date===TODAY?'<span class="wk-tag">Tonight</span>':(i===0?'<span class="wk-tag">Next up</span>':''))+'</div>'+
        '<div class="wk-body"><h3>'+esc(x.title)+'</h3><p>'+esc(nice(x.date))+' · '+esc(x.time||'8 PM onwards')+(x.who?'<br>'+esc(x.who):'')+'</p>'+
        '<span class="wk-go">Get on the list →</span></div></a>';
    }).join('');
    sec.hidden=false;
    /* subtle tilt + shine on hover (mouse only) */
    if(!reduce&&matchMedia('(hover:hover) and (pointer:fine)').matches){
      Array.prototype.forEach.call(row.querySelectorAll('.wk-art'),function(el){
        el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
          el.style.transform='rotateY('+((px-.5)*10)+'deg) rotateX('+((.5-py)*10)+'deg) translateY(-4px)';el.style.setProperty('--mx',px*100+'%');el.style.setProperty('--my',py*100+'%')});
        el.addEventListener('pointerleave',function(){el.style.transform=''});
      });
    }
  }

  function data(){
    return fetch('events.html',{credentials:'same-origin'}).then(function(r){return r.text()}).then(function(t){
      var m=t.match(/id="gl-data">([\s\S]*?)<\/script>/);return JSON.parse(m[1]);
    });
  }

  sparks();
  data().then(function(D){
    var up=(D.events||[]).filter(function(x){return x.date>=TODAY}).sort(function(a,b){return a.date<b.date?-1:a.date>b.date?1:(a.start||'')<(b.start||'')?-1:1});
    nextUp(up);strip(up);
  }).catch(function(){});
})();
