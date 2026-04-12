/* JP's Travel World — app.js */
const K='myTravelPlaces';
let P=JSON.parse(localStorage.getItem(K)||'[]'),M={},editId=null,pending=null,pathLine=null;

const stColors={visited:'#ff6b6b',lived:'#feca57',birthplace:'#ff9ff3',transit:'#95a5a6',wishlist:'rgba(255,255,255,0.4)'};
const stEmoji={visited:'✅',lived:'🏠',birthplace:'🎒',transit:'🚏',wishlist:'🔮'};
const trEmoji={flight:'✈️','own-car':'🚗',rental:'🚙',train:'🚆',bus:'🚌',cycle:'🚲',walk:'🚶',boat:'⛴️',other:'🧭'};
const catEmoji={city:'🏙️',nature:'🌿',beach:'🏖️',mountain:'⛰️',food:'🍽️',work:'💼',other:'📍'};
const badgeCls={visited:'b-visited',lived:'b-lived',birthplace:'b-birth',transit:'b-transit',wishlist:'b-wish'};

// === NAV ===
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));
  document.querySelectorAll('.v').forEach(x=>x.classList.remove('on'));
  t.classList.add('on');document.getElementById(t.dataset.v).classList.add('on');
  if(t.dataset.v==='vInsights')renderInsights();
  if(t.dataset.v==='vList')renderList();
  if(t.dataset.v==='vMap')map.invalidateSize();
});

// === MAP ===
const map=L.map('map',{zoomControl:false}).setView([25,10],3);
const layers={
  'Standard':L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}),
  'Satellite':L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19}),
  'Dark':L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:19})
};
layers['Standard'].addTo(map);
L.control.layers(layers,null,{position:'topright',collapsed:true}).addTo(map);
L.control.zoom({position:'bottomright'}).addTo(map);

function icon(st){
  const c=stColors[st]||stColors.visited;
  const w=st==='lived'||st==='birthplace';
  const sz=w?18:12;
  const wish=st==='wishlist';
  const glow=w?`box-shadow:0 0 12px ${c},0 0 24px ${c}40;`:'box-shadow:0 2px 8px rgba(0,0,0,0.4);';
  const bg=wish?'transparent':c;
  const bdr=wish?`2px dashed rgba(255,255,255,0.5)`:`2px solid ${c}`;
  return L.divIcon({className:'',html:`<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:${bg};border:${bdr};${glow}transition:all 0.3s"></div>`,iconSize:[sz,sz],iconAnchor:[sz/2,sz/2]});
}

function save(){localStorage.setItem(K,JSON.stringify(P))}

function render(){
  Object.values(M).forEach(m=>map.removeLayer(m));M={};
  if(pathLine)map.removeLayer(pathLine);
  P.forEach(p=>{
    const m=L.marker([p.lat,p.lng],{icon:icon(p.status)}).addTo(map);
    const tag=`${stEmoji[p.status]||''} ${p.status||'visited'}`;
    const vis=p.visits>1?` · ${p.visits}x`:'';
    const tr=p.travel?` · ${trEmoji[p.travel]||''}`:'';
    const img=p.photo?`<img class="pp-img" src="${p.photo}">`:'';
    const mem=p.memory?`<div class="pp-mem">✨ ${p.memory}</div>`:'';
    m.bindPopup(`<div class="pp-name">${p.name}</div><div class="pp-meta">${tag}${vis}${tr} · ${p.date||''}</div><div class="pp-meta">${p.country||''} · ${'⭐'.repeat(p.rating||3)}</div>${mem}${p.notes?'<div class="pp-note">'+p.notes+'</div>':''}${img}`,{maxWidth:250});
    m.on('click',()=>openEdit(p.id));M[p.id]=m;
  });
  // Path for visited (chronological)
  const vis=[...P].filter(p=>p.date&&p.status!=='wishlist').sort((a,b)=>a.date.localeCompare(b.date));
  if(vis.length>1)pathLine=L.polyline(vis.map(p=>[p.lat,p.lng]),{color:'#ff6b6b',weight:1.5,opacity:0.2,dashArray:'6,12'}).addTo(map);
}

// === GEOCODING ===
let gT=null;const iNm=document.getElementById('iNm'),gR=document.getElementById('gR');
iNm.oninput=()=>{clearTimeout(gT);const q=iNm.value.trim();if(q.length<2){gR.innerHTML='';return}
  gT=setTimeout(()=>fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`).then(r=>r.json()).then(res=>{
    gR.innerHTML=res.map(r=>`<div class="geo-r" data-lat="${r.lat}" data-lng="${r.lon}" data-n="${r.display_name.split(',')[0]}" data-c="${r.address?.country||''}">${r.display_name}</div>`).join('');
    gR.querySelectorAll('.geo-r').forEach(el=>el.onclick=()=>{
      iNm.value=el.dataset.n;document.getElementById('iCo').value=el.dataset.c;
      pending={lat:+el.dataset.lat,lng:+el.dataset.lng};gR.innerHTML='';
    });
  }).catch(()=>{}),400);
};

// === MODAL ===
map.on('click',e=>openModal(e.latlng.lat,e.latlng.lng));
document.getElementById('btnAdd').onclick=()=>openModal(map.getCenter().lat,map.getCenter().lng);

function openModal(lat,lng,p){
  editId=p?p.id:null;pending=p?null:{lat,lng};
  document.getElementById('mTitle').textContent=p?'Edit Memory':'Add Memory';
  document.getElementById('iSt').value=p?(p.status||'visited'):'visited';
  iNm.value=p?p.name:'';
  document.getElementById('iCo').value=p?p.country:'';
  document.getElementById('iDt').value=p?p.date:new Date().toISOString().slice(0,10);
  document.getElementById('iCat').value=p?p.cat:'city';
  document.getElementById('iTr').value=p?(p.travel||'flight'):'flight';
  document.getElementById('iVis').value=p?(p.visits||1):1;
  document.getElementById('iRat').value=p?(p.rating||3):5;
  document.getElementById('iMem').value=p?p.memory||'':'';
  document.getElementById('iNo').value=p?p.notes:'';
  document.getElementById('iPh').value='';
  document.getElementById('phPrev').innerHTML=p?.photo?`<img src="${p.photo}" style="width:100%;max-height:80px;object-fit:cover;border-radius:10px">`:'';
  document.getElementById('btnD').style.display=p?'block':'none';
  gR.innerHTML='';document.getElementById('ov').classList.add('on');
}
function closeModal(){document.getElementById('ov').classList.remove('on');gR.innerHTML='';editId=null;pending=null}
function openEdit(id){const p=P.find(x=>x.id===id);if(p)openModal(p.lat,p.lng,p)}

document.getElementById('btnX').onclick=closeModal;
document.getElementById('btnD').onclick=()=>{if(editId&&confirm('Remove this place?')){P=P.filter(p=>p.id!==editId);save();render();closeModal()}};

document.getElementById('btnS').onclick=()=>{
  const name=iNm.value.trim();if(!name)return alert('Enter a place name');
  const d={name,country:document.getElementById('iCo').value.trim(),date:document.getElementById('iDt').value,
    cat:document.getElementById('iCat').value,status:document.getElementById('iSt').value,
    travel:document.getElementById('iTr').value,visits:+document.getElementById('iVis').value||1,
    rating:+document.getElementById('iRat').value,memory:document.getElementById('iMem').value.trim(),
    notes:document.getElementById('iNo').value.trim()};
  function done(ph){
    if(ph)d.photo=ph;else if(editId){const o=P.find(x=>x.id===editId);if(o?.photo)d.photo=o.photo}
    if(editId)Object.assign(P.find(x=>x.id===editId),d);
    else{const c=pending||map.getCenter();P.push({id:Date.now().toString(),lat:c.lat,lng:c.lng,...d})}
    save();render();closeModal();
  }
  const f=document.getElementById('iPh').files[0];
  if(f){const r=new FileReader();r.onload=e=>{const img=new Image();img.onload=()=>{
    const c=document.createElement('canvas'),s=Math.min(400/img.width,400/img.height,1);
    c.width=img.width*s;c.height=img.height*s;c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    done(c.toDataURL('image/jpeg',0.7))};img.src=e.target.result};r.readAsDataURL(f)}
  else done(null);
};

// === INSIGHTS ===
function renderInsights(){
  const v=P.filter(p=>p.status!=='wishlist'),w=P.filter(p=>p.status==='wishlist');
  const countries=[...new Set(v.map(p=>p.country).filter(Boolean))];
  const totalVis=v.reduce((s,p)=>s+(p.visits||1),0);

  // Cards
  document.getElementById('iCards').innerHTML=`
    <div class="card"><div class="n">${v.length}</div><div class="l">Places</div></div>
    <div class="card"><div class="n">${countries.length}</div><div class="l">Countries</div></div>
    <div class="card"><div class="n">${totalVis}</div><div class="l">Visits</div></div>
    <div class="card"><div class="n">${w.length}</div><div class="l">Dreams</div></div>`;

  // Life Chapters (lived places)
  const lived=P.filter(p=>p.status==='lived'||p.status==='birthplace').sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  document.getElementById('iChapters').innerHTML=lived.length?lived.map(p=>
    `<div class="chapter"><h4>${stEmoji[p.status]} ${p.name}, ${p.country||''}</h4><p>${p.memory||p.notes||'A chapter of my life'} ${p.date?'· '+p.date:''}</p></div>`
  ).join(''):'<div style="color:var(--text2);font-size:13px;padding:8px">Add places where you\'ve lived to see your life chapters here</div>';

  // Countries
  const cc={};v.forEach(p=>{if(p.country)cc[p.country]=(cc[p.country]||0)+1});
  const cs=Object.entries(cc).sort((a,b)=>b[1]-a[1]);
  document.getElementById('iCountries').innerHTML=cs.length?cs.map(([c,n])=>`<div class="citem"><span>${c}</span><span class="cnt">${n} place${n>1?'s':''}</span></div>`).join(''):'<div class="empty">Start adding places!</div>';

  // Travel modes
  const tr={};v.forEach(p=>{const t=p.travel||'other';tr[t]=(tr[t]||0)+1});
  const mt=Math.max(...Object.values(tr),1);
  const trS=Object.entries(tr).sort((a,b)=>b[1]-a[1]);
  const trCol={flight:'#48dbfb','own-car':'#ff6b6b',rental:'#feca57',train:'#2ecc71',bus:'#f39c12',cycle:'#a29bfe',walk:'#fd79a8',boat:'#00cec9',other:'#95a5a6'};
  document.getElementById('iTravel').innerHTML=trS.map(([t,n])=>`<div class="bar-r"><div class="bar-l">${trEmoji[t]||''} ${t}</div><div class="bar-t"><div class="bar-f" style="width:${n/mt*100}%;background:${trCol[t]||'#666'}">${n}</div></div></div>`).join('');

  // Timeline (year-grouped)
  const dated=[...v].filter(p=>p.date).sort((a,b)=>b.date.localeCompare(a.date));
  const years={};dated.forEach(p=>{const y=p.date.slice(0,4);(years[y]=years[y]||[]).push(p)});
  let tlHtml='';
  Object.keys(years).sort((a,b)=>b-a).forEach(y=>{
    tlHtml+=`<div class="tl-year">${y}</div>`;
    years[y].forEach(p=>{
      tlHtml+=`<div class="tl-item"><div class="tl-dot"></div><div><div class="tl-name">${p.name}</div><div class="tl-meta">${p.date.slice(5)} · ${p.country||''} ${p.memory?'· ✨ '+p.memory:''}</div></div></div>`;
    });
  });
  document.getElementById('iTimeline').innerHTML=tlHtml||'<div style="color:var(--text2);font-size:13px;padding:8px">Add dates to your places to build your timeline</div>';
}

// === LIST ===
let filt='all';
function renderList(){
  const fs=['all','visited','lived','birthplace','transit','wishlist'];
  document.getElementById('fltrs').innerHTML=fs.map(f=>`<button class="fbtn ${filt===f?'on':''}" data-f="${f}">${f==='all'?'All':(stEmoji[f]||'')+' '+f}</button>`).join('');
  document.querySelectorAll('.fbtn').forEach(b=>b.onclick=()=>{filt=b.dataset.f;renderList()});

  let list=filt==='all'?P:P.filter(p=>(p.status||'visited')===filt);
  list=[...list].sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const el=document.getElementById('pCards');
  if(!list.length){el.innerHTML='<div class="empty"><span>🌍</span>No places yet.<br>Tap the map to start your journey!</div>';return}

  el.innerHTML=list.map(p=>`<div class="pc" data-id="${p.id}">
    <div class="pc-top"><div><div class="pc-name">${p.name}</div><div class="pc-sub">${p.country||''}</div></div>
    <span class="pc-badge ${badgeCls[p.status]||'b-visited'}">${(stEmoji[p.status]||'✅')+' '+(p.status||'visited')}</span></div>
    <div class="pc-tags"><span>${catEmoji[p.cat]||''} ${p.cat}</span><span>${p.date||''}</span>${p.travel?`<span>${trEmoji[p.travel]||''}</span>`:''}${p.visits>1?`<span>${p.visits}x</span>`:''}><span>${'⭐'.repeat(p.rating||3)}</span></div>
    ${p.memory?`<div class="pc-note">✨ ${p.memory}</div>`:''}
    ${p.notes?`<div class="pc-note">"${p.notes}"</div>`:''}
    ${p.photo?`<img src="${p.photo}">`:''}
    <div class="pc-acts"><button class="act-edit" data-id="${p.id}">✏️ Edit</button><button class="act-del" data-id="${p.id}">🗑️ Delete</button></div>
  </div>`).join('');

  el.querySelectorAll('.act-edit').forEach(b=>b.onclick=e=>{e.stopPropagation();openEdit(b.dataset.id)});
  el.querySelectorAll('.act-del').forEach(b=>b.onclick=e=>{e.stopPropagation();
    if(confirm('Remove '+P.find(x=>x.id===b.dataset.id)?.name+'?')){P=P.filter(p=>p.id!==b.dataset.id);save();render();renderList()}});
  el.querySelectorAll('.pc').forEach(c=>c.onclick=()=>{
    const p=P.find(x=>x.id===c.dataset.id);if(!p)return;
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));
    document.querySelectorAll('.v').forEach(x=>x.classList.remove('on'));
    document.querySelector('[data-v="vMap"]').classList.add('on');
    document.getElementById('vMap').classList.add('on');
    setTimeout(()=>{map.invalidateSize();map.flyTo([p.lat,p.lng],12,{duration:1});setTimeout(()=>M[p.id]?.openPopup(),1000)},100);
  });
}

// === EXPORT/IMPORT ===
document.getElementById('btnExp').onclick=()=>{
  const b=new Blob([JSON.stringify(P,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(b);
  a.download='jp-travel-'+new Date().toISOString().slice(0,10)+'.json';a.click();
};
document.getElementById('btnImp').onchange=e=>{
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();r.onload=ev=>{
    try{const imp=JSON.parse(ev.target.result);if(!Array.isArray(imp))return alert('Invalid file');
      const ids=new Set(P.map(p=>p.id));let n=0;
      imp.forEach(p=>{if(!ids.has(p.id)){P.push(p);n++}});
      save();render();alert(`✅ Imported ${n} new place(s)`);
    }catch(e){alert('Error reading file')}
  };r.readAsText(f);
};

// === INIT ===
render();
