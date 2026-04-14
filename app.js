/* JP's Travel World — Premium Edition */
const K='myTravelPlaces';
let P=JSON.parse(localStorage.getItem(K)||'[]');
if(typeof SEED_DATA!=='undefined'&&P.length<SEED_DATA.length){P=[...SEED_DATA];localStorage.setItem(K,JSON.stringify(P))}
let M={},editId=null,pending=null,pathLine=null;
const save=()=>localStorage.setItem(K,JSON.stringify(P));

const stE={visited:'✅',lived:'🏠',birthplace:'🎒',transit:'🚏',wishlist:'🔮'};
const trE={flight:'✈️','own-car':'🚗',rental:'🚙',train:'🚆',bus:'🚌',cycle:'🚲',walk:'🚶',boat:'⛴️'};
const catE={city:'🏙️',nature:'🌿',beach:'🏖️',mountain:'⛰️',food:'🍽️',work:'💼',other:'📍'};
const bCls={visited:'b-v',lived:'b-l',birthplace:'b-b',transit:'b-t',wishlist:'b-w'};

// === THEME ===
const themeBtn=document.getElementById('themeBtn');
themeBtn.onclick=()=>{document.body.classList.toggle('light');themeBtn.textContent=document.body.classList.contains('light')?'🌙':'☀️'};

// === NAV ===
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));
  document.querySelectorAll('.v').forEach(x=>x.classList.remove('on'));
  t.classList.add('on');document.getElementById(t.dataset.v).classList.add('on');
  if(t.dataset.v==='vJourney')renderJourney();
  if(t.dataset.v==='vList')renderList();
  if(t.dataset.v==='vMap')map.invalidateSize();
});

// === MAP ===
const map=L.map('map',{zoomControl:false}).setView([25,10],3);
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(map);
L.control.zoom({position:'bottomright'}).addTo(map);

function mkIcon(st){
  const cls={visited:'marker-visited',lived:'marker-lived',birthplace:'marker-birth',transit:'marker-transit',wishlist:'marker-wish'}[st]||'marker-visited';
  const sz=st==='lived'||st==='birthplace'?18:12;
  return L.divIcon({className:'',html:`<div class="marker-pulse ${cls}" style="width:${sz}px;height:${sz}px"></div>`,iconSize:[sz,sz],iconAnchor:[sz/2,sz/2]});
}

function render(){
  Object.values(M).forEach(m=>map.removeLayer(m));M={};
  if(pathLine)map.removeLayer(pathLine);
  P.forEach(p=>{
    const m=L.marker([p.lat,p.lng],{icon:mkIcon(p.status)}).addTo(map);
    m.on('click',()=>showPM(p.id));M[p.id]=m;
  });
  const vis=[...P].filter(p=>p.date&&p.status!=='wishlist').sort((a,b)=>a.date.localeCompare(b.date));
  if(vis.length>1)pathLine=L.polyline(vis.map(p=>[p.lat,p.lng]),{color:'var(--accent)',weight:1.5,opacity:.2,dashArray:'6,12'}).addTo(map);
  save();
}

// === PLACE DETAIL MODAL ===
let pmId=null;
function showPM(id){
  const p=P.find(x=>x.id===id);if(!p)return;pmId=id;
  const img=document.getElementById('pmImg');
  const imgSrc=p.photo||p.img1||'';img.style.display=imgSrc?'block':'none';if(imgSrc)img.src=imgSrc;
  document.getElementById('pmName').textContent=p.name;
  document.getElementById('pmSub').textContent=`${p.country||''} · ${p.date||''}${p.dateTo?' → '+p.dateTo:''}`;
  document.getElementById('pmBadges').innerHTML=[stE[p.status],trE[p.travel],p.visits>1?p.visits+'x':'',p.company?'🏢 '+p.company:'',p.chapter?'📖 '+p.chapter:''].filter(Boolean).map(s=>`<span>${s}</span>`).join('');
  document.getElementById('pmStars').textContent='⭐'.repeat(p.rating||3);
  const mem=document.getElementById('pmMem');
  mem.style.display=p.memory?'block':'none';mem.textContent=p.memory?'✨ '+p.memory:'';
  document.getElementById('pmNotes').textContent=p.notes||'';
  document.getElementById('pmOv').classList.add('on');
}
document.getElementById('pmEdit').onclick=()=>{document.getElementById('pmOv').classList.remove('on');if(pmId)openEdit(pmId)};
document.getElementById('pmStory').onclick=()=>{document.getElementById('pmOv').classList.remove('on');if(pmId)openStory(P.findIndex(x=>x.id===pmId))};

// === STORY MODE ===
let storyIdx=0,storyTimer=null;
function openStory(startIdx){
  const sorted=[...P].filter(p=>p.status!=='wishlist'&&p.date).sort((a,b)=>a.date.localeCompare(b.date));
  if(!sorted.length)return;
  const el=document.getElementById('storySlides');
  const nav=document.getElementById('storyNav');
  el.innerHTML=sorted.map((p,i)=>`<div class="story-slide ${i===0?'active':''}" data-i="${i}"><div class="bg" style="${(p.photo||p.img1)?'background-image:url('+(p.photo||p.img1)+')':'background:linear-gradient(135deg,#1a1a3e,#06061a)'}"></div><div class="content"><div class="s-name">${p.name}</div><div class="s-meta">${stE[p.status]||''} ${p.country||''} · ${p.date||''} · ${trE[p.travel]||''}</div>${p.memory?'<div class="s-memory">✨ '+p.memory+'</div>':''}${p.notes?'<div class="s-memory" style="font-style:normal;opacity:.7">'+p.notes+'</div>':''}<div class="s-rating">${'⭐'.repeat(p.rating||3)}</div></div></div>`).join('');
  nav.innerHTML=sorted.map((_,i)=>`<div class="story-dot ${i===0?'on':''}" data-i="${i}"></div>`).join('');
  nav.querySelectorAll('.story-dot').forEach(d=>d.onclick=()=>goSlide(+d.dataset.i));
  storyIdx=Math.max(0,Math.min(startIdx||0,sorted.length-1));
  goSlide(storyIdx);
  document.getElementById('storyMode').classList.add('on');
  // Auto-advance
  clearInterval(storyTimer);
  storyTimer=setInterval(()=>goSlide((storyIdx+1)%sorted.length),5000);
}
function goSlide(i){
  storyIdx=i;
  document.querySelectorAll('.story-slide').forEach((s,j)=>s.classList.toggle('active',j===i));
  document.querySelectorAll('.story-dot').forEach((d,j)=>d.classList.toggle('on',j===i));
  const total=document.querySelectorAll('.story-slide').length;
  document.getElementById('storyProg').style.width=((i+1)/total*100)+'%';
}
document.getElementById('storyClose').onclick=()=>{document.getElementById('storyMode').classList.remove('on');clearInterval(storyTimer)};
// Swipe support
let touchX=0;
document.getElementById('storyMode').addEventListener('touchstart',e=>touchX=e.touches[0].clientX);
document.getElementById('storyMode').addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].clientX-touchX;
  const total=document.querySelectorAll('.story-slide').length;
  if(dx<-50)goSlide(Math.min(storyIdx+1,total-1));
  if(dx>50)goSlide(Math.max(storyIdx-1,0));
});

// === PLAY JOURNEY ===
document.getElementById('btnPlay').onclick=async()=>{
  const sorted=[...P].filter(p=>p.date&&p.status!=='wishlist').sort((a,b)=>a.date.localeCompare(b.date));
  if(!sorted.length)return;
  const jo=document.getElementById('jo');jo.style.display='block';
  for(const p of sorted){
    document.getElementById('joN').textContent=p.name+', '+(p.country||'');
    document.getElementById('joM').textContent=(p.date||'')+' · '+(p.memory||stE[p.status]||'');
    map.flyTo([p.lat,p.lng],8,{duration:1.5});
    await new Promise(r=>setTimeout(r,2500));
  }
  jo.style.display='none';map.flyTo([25,10],3,{duration:1});
};

// === RANDOM ===
document.getElementById('btnRand').onclick=()=>{
  const v=P.filter(p=>p.status!=='wishlist');if(!v.length)return;
  const p=v[Math.floor(Math.random()*v.length)];
  map.flyTo([p.lat,p.lng],10,{duration:1});
  setTimeout(()=>showPM(p.id),1200);
};

// === GEOCODING ===
let gT=null;const iNm=document.getElementById('iNm'),gR=document.getElementById('gR');
iNm.oninput=()=>{clearTimeout(gT);const q=iNm.value.trim();if(q.length<2){gR.innerHTML='';return}
  gT=setTimeout(()=>fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`).then(r=>r.json()).then(res=>{
    gR.innerHTML=res.map(r=>`<div class="geo-r" data-lat="${r.lat}" data-lng="${r.lon}" data-n="${r.display_name.split(',')[0]}" data-c="${r.address?.country||''}">${r.display_name}</div>`).join('');
    gR.querySelectorAll('.geo-r').forEach(el=>el.onclick=()=>{iNm.value=el.dataset.n;document.getElementById('iCo').value=el.dataset.c;pending={lat:+el.dataset.lat,lng:+el.dataset.lng};gR.innerHTML=''});
  }).catch(()=>{}),400)};

// === ADD/EDIT MODAL ===
map.on('click',e=>openModal(e.latlng.lat,e.latlng.lng));
document.getElementById('btnAdd').onclick=()=>openModal(map.getCenter().lat,map.getCenter().lng);
document.getElementById('iSt').onchange=()=>{document.getElementById('dtToW').style.display=document.getElementById('iSt').value==='lived'?'':'none'};

function openModal(lat,lng,p){
  editId=p?p.id:null;pending=p?null:{lat,lng};
  document.getElementById('mTitle').textContent=p?'Edit Memory':'Add Memory';
  document.getElementById('iSt').value=p?(p.status||'visited'):'visited';
  document.getElementById('dtToW').style.display=p?.status==='lived'?'':'none';
  iNm.value=p?p.name:'';
  document.getElementById('iCo').value=p?p.country:'';
  document.getElementById('iDt').value=p?p.date:new Date().toISOString().slice(0,10);
  document.getElementById('iDtTo').value=p?.dateTo||'';
  document.getElementById('iCat').value=p?p.cat:'city';
  document.getElementById('iTr').value=p?(p.travel||'flight'):'flight';
  document.getElementById('iVis').value=p?(p.visits||1):1;
  document.getElementById('iRat').value=p?(p.rating||3):5;
  document.getElementById('iRsn').value=p?(p.reason||'personal'):'personal';
  document.getElementById('iPub').value=p?(p.public!==false?'true':'false'):'true';
  document.getElementById('iMem').value=p?.memory||'';
  document.getElementById('iComp').value=p?.company||'';
  document.getElementById('iNo').value=p?.notes||'';
  document.getElementById('iPh').value='';
  document.getElementById('phPrev').innerHTML=p?.photo?`<img src="${p.photo}" style="width:100%;max-height:60px;object-fit:cover;border-radius:8px">`:'';
  document.getElementById('btnD').style.display=p?'block':'none';
  gR.innerHTML='';document.getElementById('ov').classList.add('on');
}
function closeModal(){document.getElementById('ov').classList.remove('on');gR.innerHTML='';editId=null;pending=null}
function openEdit(id){const p=P.find(x=>x.id===id);if(p)openModal(p.lat,p.lng,p)}
document.getElementById('btnX').onclick=closeModal;
document.getElementById('btnD').onclick=()=>{if(editId&&confirm('Remove?')){P=P.filter(p=>p.id!==editId);render();closeModal()}};
document.getElementById('btnS').onclick=()=>{
  const name=iNm.value.trim();if(!name)return alert('Enter a place name');
  const d={name,country:document.getElementById('iCo').value.trim(),date:document.getElementById('iDt').value,dateTo:document.getElementById('iDtTo').value||'',cat:document.getElementById('iCat').value,status:document.getElementById('iSt').value,travel:document.getElementById('iTr').value,visits:+document.getElementById('iVis').value||1,rating:+document.getElementById('iRat').value,reason:document.getElementById('iRsn').value,public:document.getElementById('iPub').value==='true',memory:document.getElementById('iMem').value.trim(),company:document.getElementById('iComp').value.trim(),notes:document.getElementById('iNo').value.trim()};
  function done(ph){
    if(ph)d.photo=ph;else if(editId){const o=P.find(x=>x.id===editId);if(o?.photo)d.photo=o.photo}
    if(editId)Object.assign(P.find(x=>x.id===editId),d);
    else{const c=pending||map.getCenter();P.push({id:Date.now().toString(),lat:c.lat,lng:c.lng,...d})}
    render();closeModal();
  }
  const f=document.getElementById('iPh').files[0];
  if(f){const r=new FileReader();r.onload=e=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas'),s=Math.min(400/img.width,400/img.height,1);c.width=img.width*s;c.height=img.height*s;c.getContext('2d').drawImage(img,0,0,c.width,c.height);done(c.toDataURL('image/jpeg',.7))};img.src=e.target.result};r.readAsDataURL(f)}
  else done(null);
};

// === JOURNEY ===
function animN(el,n){let c=0;const s=Math.max(1,Math.ceil(n/25));const t=setInterval(()=>{c+=s;if(c>=n){c=n;clearInterval(t)}el.textContent=c},30)}

function renderJourney(){
  const v=P.filter(p=>p.status!=='wishlist'),w=P.filter(p=>p.status==='wishlist');
  const countries=[...new Set(v.map(p=>p.country).filter(Boolean))];
  const totalVis=v.reduce((s,p)=>s+(p.visits||1),0);
  // On this day
  const today=new Date().toISOString().slice(5,10);
  const otdP=v.filter(p=>p.date&&p.date.slice(5,10)===today);
  document.getElementById('otd').innerHTML=otdP.length?`<div class="otd"><div class="otd-title">📅 On This Day</div><div class="otd-place">${otdP[0].name}, ${otdP[0].country||''}</div><div class="otd-mem">${otdP[0].memory||otdP[0].date}</div></div>`:'';
  // Cards
  document.getElementById('iCards').innerHTML=`<div class="card"><div class="n" data-n="${v.length}">0</div><div class="l">Places</div></div><div class="card"><div class="n" data-n="${countries.length}">0</div><div class="l">Countries</div></div><div class="card"><div class="n" data-n="${totalVis}">0</div><div class="l">Visits</div></div><div class="card"><div class="n" data-n="${w.length}">0</div><div class="l">Dreams</div></div>`;
  document.querySelectorAll('.card .n').forEach(el=>animN(el,+el.dataset.n));
  // Chapters
  const ch={};P.filter(p=>p.chapter).forEach(p=>{(ch[p.chapter]=ch[p.chapter]||[]).push(p)});
  const chOrd=[...new Set(P.filter(p=>p.chapter&&p.date).sort((a,b)=>a.date.localeCompare(b.date)).map(p=>p.chapter))];
  document.getElementById('iChap').innerHTML=chOrd.map(c=>{const items=ch[c];const f=items[0];const dr=f.date?(f.date.slice(0,4)+(f.dateTo?' → '+f.dateTo.slice(0,4):'')):'';const co=items.find(p=>p.company)?.company||'';return`<div class="chapter"><h4>${stE[f.status]||'📍'} ${c} ${dr?'('+dr+')':''}</h4><p>${co?'🏢 '+co+' · ':''}${items.map(p=>p.name).join(', ')}${f.memory?' · ✨ '+f.memory:''}</p></div>`}).join('')||'<div style="color:var(--text2);font-size:13px;padding:8px">Add chapters to see your life story</div>';
  // Countries
  const cc={};v.forEach(p=>{if(p.country)cc[p.country]=(cc[p.country]||0)+1});
  document.getElementById('iCountries').innerHTML=Object.entries(cc).sort((a,b)=>b[1]-a[1]).map(([c,n])=>`<div class="citem"><span>${c}</span><span style="color:var(--text2)">${n}</span></div>`).join('');
  // Travel
  const tr={};v.forEach(p=>{const t=p.travel||'other';tr[t]=(tr[t]||0)+1});
  const mt=Math.max(...Object.values(tr),1);
  const trC={flight:'#48dbfb','own-car':'#ff6b6b',rental:'#feca57',train:'#2ecc71',bus:'#f39c12',cycle:'#a29bfe',walk:'#fd79a8',boat:'#00cec9'};
  document.getElementById('iTravel').innerHTML=Object.entries(tr).sort((a,b)=>b[1]-a[1]).map(([t,n])=>`<div class="bar-r"><div class="bar-l">${trE[t]||''} ${t}</div><div class="bar-t"><div class="bar-f" style="width:${n/mt*100}%;background:${trC[t]||'#666'}">${n}</div></div></div>`).join('');
  // Timeline
  const dated=[...v].filter(p=>p.date).sort((a,b)=>b.date.localeCompare(a.date));
  const years={};dated.forEach(p=>{const y=p.date.slice(0,4);(years[y]=years[y]||[]).push(p)});
  let tl='';Object.keys(years).sort((a,b)=>b-a).forEach(y=>{tl+=`<div class="tl-year">${y}</div>`;years[y].forEach(p=>{tl+=`<div class="tl-item"><div class="tl-dot"></div><div><div class="tl-name">${p.name}</div><div class="tl-meta">${p.date.slice(5)} · ${p.country||''} ${p.memory?'· ✨ '+p.memory:''}</div></div></div>`})});
  document.getElementById('iTL').innerHTML=tl||'<div style="color:var(--text2);font-size:13px;padding:8px">Add dates to build your timeline</div>';
}

// === LIST ===
let filt='all';
function renderList(){
  const fs=['all','visited','lived','birthplace','transit','wishlist'];
  document.getElementById('fltrs').innerHTML=fs.map(f=>`<button class="fbtn ${filt===f?'on':''}" data-f="${f}">${f==='all'?'All':(stE[f]||'')+' '+f}</button>`).join('');
  document.querySelectorAll('.fbtn').forEach(b=>b.onclick=()=>{filt=b.dataset.f;renderList()});
  let list=filt==='all'?P:P.filter(p=>(p.status||'visited')===filt);
  list=[...list].sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const el=document.getElementById('pCards');
  if(!list.length){el.innerHTML='<div class="empty"><span style="font-size:40px;display:block;margin-bottom:10px">🌍</span>No places yet.<br>Tap the map to start!</div>';return}
  el.innerHTML=list.map(p=>`<div class="pc" data-id="${p.id}"><div class="pc-top"><div><div class="pc-name">${p.name}</div><div class="pc-sub">${p.country||''}</div></div><span class="pc-badge" style="background:var(--glass)">${(stE[p.status]||'✅')+' '+(p.status||'visited')}</span></div><div class="pc-tags"><span>${catE[p.cat]||''}</span><span>${p.date||''}</span>${p.travel?`<span>${trE[p.travel]}</span>`:''}${p.visits>1?`<span>${p.visits}x</span>`:''}<span>${'⭐'.repeat(p.rating||3)}</span></div>${p.memory?`<div class="pc-note">✨ ${p.memory}</div>`:''}${(p.photo||p.img1)?`<img src="${p.photo||p.img1}" loading="lazy">`:''}
  <div class="pc-acts"><button onclick="event.stopPropagation();openEdit('${p.id}')" style="background:var(--card);color:var(--text)">✏️</button><button onclick="event.stopPropagation();if(confirm('Remove ${p.name}?')){P=P.filter(x=>x.id!=='${p.id}');render();renderList()}" style="background:rgba(255,50,50,.1);color:#f44">🗑️</button><button onclick="event.stopPropagation();openStory(${P.findIndex(x=>x.id===p.id)})" style="background:var(--accent4);color:#fff">📖</button></div></div>`).join('');
  el.querySelectorAll('.pc').forEach(c=>c.onclick=()=>{const p=P.find(x=>x.id===c.dataset.id);if(!p)return;document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));document.querySelectorAll('.v').forEach(x=>x.classList.remove('on'));document.querySelector('[data-v="vMap"]').classList.add('on');document.getElementById('vMap').classList.add('on');setTimeout(()=>{map.invalidateSize();map.flyTo([p.lat,p.lng],12,{duration:1});setTimeout(()=>showPM(p.id),1e3)},100)});
}

// === EXPORT/IMPORT ===
document.getElementById('btnExp').onclick=()=>{const b=new Blob([JSON.stringify(P,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='jp-travel-'+new Date().toISOString().slice(0,10)+'.json';a.click()};
document.getElementById('btnImp').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{try{const imp=JSON.parse(ev.target.result);if(!Array.isArray(imp))return alert('Invalid');const ids=new Set(P.map(p=>p.id));let n=0;imp.forEach(p=>{if(!ids.has(p.id)){P.push(p);n++}});render();alert(`✅ ${n} new place(s)`)}catch(e){alert('Error')}};r.readAsText(f)};

// === INIT ===
render();
