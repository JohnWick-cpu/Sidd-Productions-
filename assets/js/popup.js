/* Next-event pop-up, shown on every page.
   Reads the event list from events.html (the single source of truth) and
   always promotes the next upcoming night. Shows once per visit per event. */
(function(){
  var K='sidd-sdp-seen',ON_EVENTS=!!document.getElementById('gl-data');
  var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  /* "today" in Bengaluru, counted until 4 AM so a night stays promoted while it is still on */
  var TODAY=new Date(Date.now()+5.5*3600e3-4*3600e3).toISOString().slice(0,10);
  function nice(s){var d=new Date(s+'T00:00:00Z');return DOW[d.getUTCDay()]+' '+d.getUTCDate()+' '+MON[d.getUTCMonth()]}
  function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

  function getData(){
    var el=document.getElementById('gl-data');
    if(el)return Promise.resolve(JSON.parse(el.textContent));
    return fetch('events.html',{credentials:'same-origin'}).then(function(r){return r.text()}).then(function(t){
      var m=t.match(/id="gl-data">([\s\S]*?)<\/script>/);return JSON.parse(m[1]);
    });
  }

  var css='.sdp{position:fixed;z-index:90;right:clamp(12px,3vw,32px);bottom:clamp(12px,3vw,32px);width:min(360px,calc(100vw - 24px));display:grid;grid-template-columns:118px 1fr;gap:16px;align-items:center;padding:14px 16px 14px 14px;background:rgba(10,8,6,.96);border:1px solid rgba(212,175,55,.45);box-shadow:0 24px 60px rgba(0,0,0,.6);color:#fff;font-family:inherit;opacity:0;transform:translateY(16px);transition:opacity .45s ease,transform .45s ease}'+
  '.sdp.on{opacity:1;transform:none}.sdp[hidden]{display:none}'+
  '.sdp-art{display:block;aspect-ratio:3/4;overflow:hidden;border:1px solid rgba(255,255,255,.12);padding:0;background:none;cursor:pointer}'+
  '.sdp-art img{width:100%;height:100%;object-fit:cover;display:block}'+
  '.sdp-b{display:grid;gap:6px;min-width:0}'+
  '.sdp-l{margin:0;font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;color:#d4af37}'+
  '.sdp-t{margin:0;font-family:var(--serif,Georgia,serif);font-size:1.45rem;line-height:1.1}'+
  '.sdp-m{margin:0;font-size:.78rem;color:rgba(255,255,255,.75)}'+
  '.sdp-cta{margin-top:6px;justify-self:start;padding:.65rem .9rem;background:#d4af37;color:#0a0806;border:0;font-family:inherit;font-size:.66rem;letter-spacing:.18em;text-transform:uppercase;font-weight:600;text-decoration:none;cursor:pointer}'+
  '.sdp-cta:hover{background:#e6c458}'+
  '.sdp-x{position:absolute;top:2px;right:6px;width:32px;height:32px;border:0;background:none;color:rgba(255,255,255,.7);font-size:1.4rem;line-height:1;cursor:pointer}'+
  '.sdp-x:hover{color:#fff}'+
  '@media (max-width:520px){.sdp{bottom:84px;grid-template-columns:96px 1fr}}'+
  '@media (prefers-reduced-motion:reduce){.sdp{transition:none}}';

  function show(x){
    var seen;try{seen=sessionStorage.getItem(K)}catch(e){}
    if(seen===x.id)return;
    var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
    var href='events.html?book='+encodeURIComponent(x.id)+'&utm_source=site&utm_medium=popup&utm_campaign='+encodeURIComponent(x.id);
    /* on the Events page the buttons open the RSVP form directly; elsewhere they link to it */
    var art=ON_EVENTS?'<button class="sdp-art" type="button" data-book="'+esc(x.id)+'" aria-label="Get on the list for '+esc(x.title)+'">':'<a class="sdp-art" href="'+href+'">';
    var cta=ON_EVENTS?'<button class="sdp-cta" type="button" data-book="'+esc(x.id)+'">Get on the list</button>':'<a class="sdp-cta" href="'+href+'">Get on the list</a>';
    var p=document.createElement('div');p.className='sdp';p.id='sdp';p.setAttribute('role','dialog');p.setAttribute('aria-modal','false');p.setAttribute('aria-labelledby','sdp-t');p.hidden=true;
    p.innerHTML='<button class="sdp-x" type="button" aria-label="Close">&times;</button>'+
      art+'<img src="assets/img/events/'+esc(x.id)+'-sm.webp" alt="'+esc(x.alt||('Poster for '+x.title))+'" width="540" height="720" decoding="async">'+(ON_EVENTS?'</button>':'</a>')+
      '<div class="sdp-b"><p class="sdp-l">'+(x.date===TODAY?'Tonight':'Next up')+' &middot; Sidd Productions</p>'+
      '<p class="sdp-t" id="sdp-t">'+esc(x.title)+'</p>'+
      '<p class="sdp-m">'+nice(x.date)+' &middot; '+esc(x.time)+(x.who?'<br>'+esc(x.who):'')+'</p>'+cta+'</div>';
    document.body.appendChild(p);
    function mark(){try{sessionStorage.setItem(K,x.id)}catch(e){}}
    function close(){p.classList.remove('on');setTimeout(function(){p.hidden=true},450);mark()}
    p.querySelector('.sdp-x').addEventListener('click',close);
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!p.hidden&&!document.querySelector('dialog[open]'))close()});
    Array.prototype.forEach.call(p.querySelectorAll('.sdp-art,.sdp-cta'),function(a){a.addEventListener('click',function(){mark();if(ON_EVENTS)close()})});
    p.hidden=false;requestAnimationFrame(function(){requestAnimationFrame(function(){p.classList.add('on')})});
  }

  setTimeout(function(){
    getData().then(function(D){
      var next=(D.events||[]).filter(function(x){return x.date>=TODAY}).sort(function(a,b){return a.date<b.date?-1:a.date>b.date?1:0})[0];
      if(next)show(next);
    }).catch(function(){});
  },2500);
})();
