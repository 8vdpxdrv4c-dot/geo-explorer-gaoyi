/* 地理之间 — buildless, local-first learning space. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const books = window.BOOKS || [];
  const flat = [], chapters = [];
  const icons = {
    globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3.5 8.5h17m-17 7h17"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z"/>',
    book:'<path d="M12 5v15M3 4c3-1 6 0 9 2 3-2 6-3 9-2v15c-3-1-6 0-9 2-3-2-6-3-9-2V4Z"/>',
    bookmark:'<path d="M6 3h12v18l-6-4-6 4V3Z"/>',
    spark:'<path d="m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6L12 3Z"/>',
    arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    chevron:'<path d="m9 5 7 7-7 7"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    leaf:'<path d="M20 3c-1 8 2 14-8 17C1 21 2 8 10 7c5 0 8-2 10-4ZM4 21 16 10"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.3"/>',
    mountain:'<path d="m2 20 7-13 5 9 3-6 5 10H2ZM6.5 12l2.5 2 2.5-2"/>',
    city:'<path d="M3 21V9h7v12M10 21V3h10v18M1 21h22M6 12v2m0 3v1m8-11h2m-2 4h2m-2 4h2"/>',
    people:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 4c2 1 3 3 3 6"/>',
    train:'<rect x="5" y="3" width="14" height="15" rx="4"/><path d="M5 10h14M9 3v7m6-7v7M8 18l-3 4m11-4 3 4M8 21h8M8 14h1m6 0h1"/>',
    shield:'<path d="m12 2 9 4v6c0 5-6 8-9 10-3-2-9-5-9-10V6l9-4Z"/><path d="m8 12 3 3 5-6"/>',
    factory:'<path d="M3 21V9l6 4V9l6 4V3h4l2 18H3Zm3-4h2m3 0h2m3 0h2"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.book}</svg>`;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = text => String(text).replace(/\s+/g, '').toLowerCase();
  const title = item => item.sec.kind === 'intro' ? '本章导引' : item.sec.title.replace(/^问题研究[:：]\s*/, '');
  const kind = sec => ({intro:'章节导引',section:'课程',research:'问题研究',appendix:'附录'}[sec.kind] || '课程');
  const chapterMeta = [
    ['Earth in the universe','从星空到脚下，寻找地球在宇宙中的位置。','assets/earth.jpg','','globe','#aec3bf'],
    ['The atmosphere','理解大气的组成，追寻风与天气的来处。','assets/pages/book1/p032.jpg','page-crop','leaf','#b1c5c5'],
    ['Water on earth','跟随一滴水，读懂循环往复的蓝色星球。','assets/pages/book1/p050.jpg','ocean-crop','globe','#b7cdd0'],
    ['Landforms & landscapes','从山地到海岸，观察大地被塑造的痕迹。','assets/hero.png','','mountain','#c0c8ad'],
    ['Vegetation & soil','认识生命的绿色底色，探索土壤中的秘密。','assets/pages/book1/p086.jpg','page-crop','leaf','#b6c4a6'],
    ['Natural hazards','认识自然的力量，学习与风险相处。',null,'','shield','#c8c2ae'],
    ['Population & migration','观察人口分布与迁移，理解人的空间选择。',null,'','people','#bccbbd'],
    ['Rural & urban spaces','走进乡村和城镇，看见空间中的生活。',null,'','city','#c8c1aa'],
    ['Location of industries','从农田到工厂，思考产业为什么选择这里。',null,'','factory','#b4c8bd'],
    ['Transport & regions','沿着交通网络，发现区域发展的联系。',null,'','train','#b5c5cc'],
    ['Environment & development','理解环境与发展的关系，探寻人地协调。',null,'','leaf','#b5c5a9']
  ];
  books.forEach((bk, bi) => bk.chapters.forEach((ch, ci) => {
    const chapter = {bk,ch,bi,ci,id:`${bk.id}-c${ci+1}`};
    if(ch.title !== '附录') { chapter.meta=chapterMeta[chapters.length]; chapters.push(chapter); }
    ch.sections.forEach((sec,si) => flat.push({...chapter,sec,si,search:normalize(sec.text+' '+sec.title+' '+ch.title)}));
  }));
  const lessons = flat.filter(x=>x.sec.kind === 'section');
  const byId = new Map(flat.map(x=>[x.sec.id,x]));
  const storageKey = 'geo-explorer-v1';
  let state = {saved:[],done:[],last:null,positions:{},font:17};
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if(stored && typeof stored === 'object') {
      state.saved=Array.isArray(stored.saved) ? [...new Set(stored.saved.filter(id=>byId.has(id)))] : [];
      state.done=Array.isArray(stored.done) ? [...new Set(stored.done.filter(id=>byId.has(id)))] : [];
      state.last=byId.has(stored.last) ? stored.last : null;
      if(stored.positions && typeof stored.positions==='object') Object.entries(stored.positions).forEach(([id,pos])=>{if(byId.has(id)&&Number.isFinite(pos)&&pos>=0)state.positions[id]=pos;});
      if(Number.isFinite(stored.font)) state.font=Math.max(15,Math.min(23,stored.font));
    }
  } catch { /* Storage may be unavailable or have invalid data. */ }
  let storageWarning=false, activeItem=null, readerMode='text', homeBook='book1', savingScroll=false;
  function saveState(){try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{if(!storageWarning){storageWarning=true;toast('当前浏览器无法保存进度，本次仍可继续阅读。');}}}
  function hydrate(root=document){root.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});}
  let toastTimer;
  function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2300);}
  function updateProgress(){
    const done=lessons.filter(x=>state.done.includes(x.sec.id)).length;
    const percent=Math.round(done/lessons.length*100);
    $('sideProgress').innerHTML=`<div class="progress-top"><span>${icon('leaf')} 我的学习足迹</span><strong>${percent}%</strong></div><div class="progress-track" role="progressbar" aria-label="课程学习进度" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"><span style="width:${percent}%"></span></div><p>已学 ${done} / ${lessons.length} 节课程，慢慢来，也很远。</p>`;
    $('savedCount').textContent=state.saved.length;
  }
  function filterTabs(selected,place){return `<div class="segmented" aria-label="按教材筛选">${[['book1','自然地理'],['book2','人文地理'],['all','全部']].map(([id,label])=>`<button data-filter="${id}" data-place="${place}" aria-pressed="${selected===id}">${label}</button>`).join('')}</div>`;}
  function chapterCard(c){
    const [en,description,img,cls,symbol,color]=c.meta;
    const count=c.ch.sections.filter(s=>s.kind==='section').length;
    const complete=c.ch.sections.filter(s=>s.kind==='section'&&state.done.includes(s.id)).length;
    return `<a class="chapter-card" href="#chapter/${c.id}" aria-label="${esc(c.ch.title)}，${count}节课程"><div class="chapter-visual ${img?'':'visual-symbol'}" style="--visual:${color}">${img?`<img src="${img}" class="${cls}" alt="" loading="lazy">`:icon(symbol)}<span class="chapter-badge">${esc(c.ch.num)}</span><span class="chapter-number">${String(c.ci+1).padStart(2,'0')}</span></div><div class="chapter-info"><span class="chapter-en">${en}</span><h3>${esc(c.ch.title)}</h3><p>${description}</p><div class="chapter-bottom"><span>${icon('book')} ${count} 节课程${complete?` · 已学 ${complete}`:''}</span><span class="card-arrow">${icon('arrow')}</span></div></div></a>`;
  }
  function cards(book){return chapters.filter(c=>book==='all'||c.bk.id===book).map(chapterCard).join('');}
  function home(){
    const last=byId.get(state.last),first=byId.get('book1-c1-s1');
    const item=last||first;
    $('main').innerHTML=`<section class="hero" aria-labelledby="heroTitle"><div class="hero-top"><span class="hero-kicker">世界很大，从好奇开始</span><span class="hero-edition">高中地理 · 必修课程</span></div><h1 id="heroTitle">从一粒土壤，<br>到浩瀚宇宙。</h1><p>山川、海洋、城市与我们。<br>翻开地理，重新认识这个相互联系的世界。</p><div class="hero-actions"><a class="button cream" href="#courses/book1">开启探索 ${icon('arrow')}</a><a class="hero-link" href="#research">带着问题看世界 ${icon('chevron')}</a></div><span class="hero-note">${icon('pin')} 山川之间，皆是课堂 · AI 景观示意</span></section>
    <div class="stats-strip"><div class="stat"><strong>2</strong><span>册精选教材</span></div><div class="stat"><strong>${chapters.length}</strong><span>个探索主题</span></div><div class="stat"><strong>${lessons.length}</strong><span>节地理课程</span></div><span class="stats-message">${icon('leaf')} 在万物之间，建立联系</span></div>
    <section aria-labelledby="themesTitle"><div class="section-heading"><div><h2 id="themesTitle">你的世界探索地图</h2><p>循着兴趣出发，也可以跟随教材的脚步。</p></div>${filterTabs(homeBook,'home')}</div><div class="chapter-grid" id="homeChapters">${cards(homeBook)}</div></section>
    <div class="continue-panel"><span class="continue-icon">${icon(last?'clock':'compass')}</span><div><small>${last?'接着上次的脚步':'从这里，迈出第一步'} · ${esc(item.bk.short)}</small><strong>${esc(title(item))}</strong></div><a class="button outline small" href="#${item.sec.id}">${last?'继续阅读':'开始第一课'} ${icon('arrow')}</a></div>
    <section class="discovery"><div class="research-feature"><span class="eyebrow">LEARN TO ASK WHY</span><h3>如果去火星生活，<br>我们的家会是什么样？</h3><p>把课本知识，带进一个真实的思考。</p><a class="text-link" href="#book1-c1-s5">进入问题研究 ${icon('arrow')}</a><div class="research-orbit" aria-hidden="true"></div></div><div class="study-guide"><h3>让每一次探索，都有收获</h3><div class="guide-step"><span>01</span><div><strong>从问题出发</strong> · 阅读导引，找到想知道的事</div></div><div class="guide-step"><span>02</span><div><strong>在图文中理解</strong> · 对照原书，建立地理联系</div></div><div class="guide-step"><span>03</span><div><strong>留下学习足迹</strong> · 收藏知识，标记已经学会的课</div></div></div></section>`;
  }
  function appendices(book){const items=flat.filter(x=>x.sec.kind==='appendix'&&(book==='all'||x.bk.id===book));return `<details class="appendices"><summary>教材附录 · 地理词汇与地图图例</summary><div class="appendix-links">${items.map(x=>`<a href="#${x.sec.id}">${esc(x.bk.short)} · ${esc(x.sec.title)}</a>`).join('')}</div></details>`;}
  function courses(book='all'){
    if(!['all','book1','book2'].includes(book))book='all';
    $('main').innerHTML=`<div class="catalog-top"><div class="page-intro"><span class="eyebrow">THE WORLD, CHAPTER BY CHAPTER</span><h1>全部课程</h1><p>从自然规律到人地关系，沿着 11 个主题，连起你的地理知识。</p></div>${filterTabs(book,'courses')}</div><div class="chapter-grid">${cards(book)}</div>${appendices(book)}`;
  }
  function lessonRow(item,index){return `<a class="lesson-row" href="#${item.sec.id}"><span class="lesson-num">${String(index+1).padStart(2,'0')}</span><div class="lesson-main"><span class="kind-pill ${item.sec.kind}">${kind(item.sec)}</span><h3>${esc(title(item))}</h3><p>${esc(item.bk.short)} · 教材第 ${item.sec.page} 页 · ${item.sec.pages.length} 张原书图片${state.done.includes(item.sec.id)?' · 已完成':''}</p></div>${icon(state.done.includes(item.sec.id)?'check':'arrow')}</a>`;}
  function chapterPage(id){
    const c=chapters.find(x=>x.id===id);if(!c)return notFound();
    const items=flat.filter(x=>x.id===id);
    $('main').innerHTML=`<div class="bread"><a href="#courses">全部课程</a>${icon('chevron')}<a href="#courses/${c.bk.id}">${esc(c.bk.short)}</a>${icon('chevron')}<span>${esc(c.ch.num)}</span></div><div class="chapter-banner"><span class="eyebrow">${c.meta[0].toUpperCase()}</span><h1>${esc(c.ch.title)}</h1><p>${c.meta[1]} ${items.filter(x=>x.sec.kind==='section').length} 节课程，循序探索。</p></div><div class="section-heading"><div><h2>本章学习路线</h2><p>先读导引，再进入课程，最后带着知识解决问题。</p></div></div><div class="lesson-list">${items.map(lessonRow).join('')}</div>`;
  }
  function research(){const items=flat.filter(x=>x.sec.kind==='research');$('main').innerHTML=`<div class="page-intro"><span class="eyebrow">A GOOD QUESTION OPENS A NEW WORLD</span><h1>带着问题，看世界</h1><p>${items.length} 个教材问题研究，把学到的地理，放回生活中。</p></div><div class="research-list">${items.map((x,i)=>`<a class="research-item" href="#${x.sec.id}"><span class="eyebrow">${String(i+1).padStart(2,'0')} / ${esc(x.bk.short)} · ${esc(x.ch.title)}</span><h3>${esc(title(x))}</h3><span class="text-link">展开研究 ${icon('arrow')}</span></a>`).join('')}</div>`;}
  function saved(){const items=state.saved.map(id=>byId.get(id)).filter(Boolean);$('main').innerHTML=`<div class="page-intro"><span class="eyebrow">YOUR COLLECTION OF DISCOVERIES</span><h1>值得再看一次的知识</h1><p>${items.length?`收藏了 ${items.length} 篇内容，随时回来继续探索。`:'阅读时点击“收藏”，把感兴趣的知识留在这里。'}收藏保存在当前浏览器。</p></div>${items.length?`<div class="lesson-list">${items.map(lessonRow).join('')}</div>`:`<div class="empty-state">${icon('bookmark')}<h2>好奇的地方，值得停留。</h2><p>现在出发，去发现第一篇想收藏的内容。</p><a class="button" href="#courses">探索课程 ${icon('arrow')}</a></div>`}`;}
  function readingBody(sec){
    const lines=sec.text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').split('\n').map(x=>x.trim()).filter(Boolean);
    if(/^第.+[章节]$/.test(lines[0]||''))lines.shift();
    if(normalize(lines[0]||'')===normalize(sec.title))lines.shift();
    let blocks=[],buffer='';
    const flush=()=>{if(buffer){blocks.push(`<p>${esc(buffer)}</p>`);buffer='';}};
    lines.forEach((line,i)=>{
      if(/^(图|表)\s*\d+[.．]/.test(line)){flush();blocks.push(`<p class="source-caption">${esc(line)}</p>`);return;}
      const heading=line.length<=22&&!/[，。；！？、,;.!?：:）)①②③]/.test(line)&&!/^[-\d\s%°a-zA-Z]+$/.test(line)&&!/[，（(]$/.test(buffer)&&!buffer;
      if(heading&&((lines[i+1]||'').length>24||['活动','思考','自学窗','本章要点'].includes(line))){flush();blocks.push(`<h2>${esc(line)}</h2>`);return;}
      if(line.length<=12&&!buffer){blocks.push(`<p class="text-fragment">${esc(line)}</p>`);return;}
      if(buffer && /[a-zA-Z0-9]$/.test(buffer) && /^[a-zA-Z0-9]/.test(line)) buffer+=' ';
      buffer+=line;
      if(/[。！？；]$/.test(line)||buffer.length>280)flush();
    });flush();return blocks.join('');
  }
  function pageLabel(item,index){const p=item.sec.pages[index];const scan=Number((p.match(/p(\d+)/)||[])[1]);return `${item.bk.short} · 原书图片 ${index+1}/${item.sec.pages.length} · 扫描序号 ${scan}`;}
  function gallery(item){return `<div class="source-note">点击原书图片可放大查看。扫描序号可能与印刷页码不同，本节教材起始页为 ${item.sec.page}。</div><div class="page-gallery">${item.sec.pages.map((p,i)=>`<figure><button data-image="${esc(p)}" data-caption="${esc(pageLabel(item,i))}" aria-label="放大${esc(pageLabel(item,i))}"><img src="assets/pages/${esc(p)}" loading="lazy" width="1000" height="1415" alt="${esc(title(item))}，原书图片 ${i+1}"></button><figcaption>${esc(pageLabel(item,i))}</figcaption></figure>`).join('')}</div>`;}
  function saveButton(item){const on=state.saved.includes(item.sec.id);return `<button class="button outline small ${on?'save-active':''}" data-save="${item.sec.id}" aria-pressed="${on}">${icon('bookmark')} ${on?'已收藏':'收藏'}</button>`;}
  function doneButton(item){const on=state.done.includes(item.sec.id);return `<button class="button small ${on?'save-active':''}" data-done="${item.sec.id}" aria-pressed="${on}">${icon('check')} ${on?'已完成 · 取消':'标记已学'}</button>`;}
  function reader(id,restore=true){
    const item=byId.get(id);if(!item)return notFound();
    activeItem=item;state.last=id;saveState();
    const pos=flat.indexOf(item),prev=flat[pos-1],next=flat[pos+1];
    const chapter=chapters.find(x=>x.id===item.id);
    const members=flat.filter(x=>x.id===item.id);
    $('main').innerHTML=`<div class="read-progress" aria-hidden="true"><span id="readingProgress"></span></div><div class="bread"><a href="#courses">全部课程</a>${icon('chevron')}<a href="#courses/${item.bk.id}">${esc(item.bk.short)}</a>${icon('chevron')}${chapter?`<a href="#chapter/${item.id}">${esc(item.ch.title)}</a>`:'<span>附录</span>'}</div><div class="reader-head"><span class="eyebrow">${esc(item.ch.num)} · ${kind(item.sec)}</span><h1>${esc(title(item))}</h1><div class="reader-meta"><span>教材第 ${item.sec.page} 页</span><span>${item.sec.pages.length} 张原书图片</span><span>预计阅读 ${Math.max(1,Math.round(item.sec.text.length/350))} 分钟</span></div></div>
    <div class="reader-toolbar"><div class="segmented" aria-label="阅读模式"><button data-mode="text" aria-pressed="${readerMode==='text'}">正文阅读</button><button data-mode="pages" aria-pressed="${readerMode==='pages'}">原书对照</button></div><div class="reader-actions"><button class="icon-button" data-font="-1" aria-label="缩小正文字号" ${state.font<=15?'disabled':''}>A−</button><button class="icon-button" data-font="1" aria-label="放大正文字号" ${state.font>=23?'disabled':''}>A+</button>${saveButton(item)}${doneButton(item)}</div></div>
    <div class="reader-layout"><div><article class="reader-paper">${readerMode==='pages'?gallery(item):`<div class="source-note">正文由教材提取。图表、公式与复杂版式，请结合“原书对照”阅读。</div><div class="article-body">${readingBody(item.sec)}</div>`}<div class="reader-end"><p>每读懂一点，世界就多一分清晰。</p>${doneButton(item)}</div></article><nav class="pager" aria-label="相邻阅读内容">${prev?`<a href="#${prev.sec.id}"><small>← 上一篇</small>${esc(title(prev))}</a>`:'<span></span>'}${next?`<a href="#${next.sec.id}"><small>下一篇 →</small>${esc(title(next))}</a>`:'<span></span>'}</nav></div><aside class="reader-aside" aria-label="本章目录"><h3>${esc(item.ch.title)}</h3>${members.map(x=>`<a href="#${x.sec.id}" class="${x.sec.id===id?'current':''}" ${x.sec.id===id?'aria-current="page"':''}>${icon(state.done.includes(x.sec.id)?'check':'chevron')}<span>${esc(title(x))}</span></a>`).join('')}<div class="mini-source"><p>在原书中，看见完整的知识</p><button class="source-thumb" data-image="${esc(item.sec.pages[0])}" data-caption="${esc(pageLabel(item,0))}" aria-label="放大本节第一张原书图片"><img src="assets/pages/${esc(item.sec.pages[0])}" alt="本节原书页面预览" loading="lazy"></button></div></aside></div>`;
    document.documentElement.style.setProperty('--article-size',state.font+'px');
    if(restore && readerMode==='text' && state.positions[id]) {savingScroll=true;requestAnimationFrame(()=>{window.scrollTo({top:state.positions[id],behavior:'instant'});savingScroll=false;updateReadingProgress();});}
  }
  function notFound(){activeItem=null;$('main').innerHTML='<div class="empty-state"><h1>这个探索入口暂时不存在</h1><p>回到课程目录，继续发现感兴趣的内容。</p><a class="button" href="#courses">查看全部课程</a></div>';}
  function persistPosition(){if(activeItem&&readerMode==='text'&&!savingScroll){state.positions[activeItem.sec.id]=window.scrollY;saveState();}}
  function route(){
    let hash=location.hash.slice(1)||'home';if(hash==='main'){ $('main').focus();return; }
    persistPosition();activeItem=null;
    closeMenu(false);
    if($('searchDialog').open)$('searchDialog').close();
    window.scrollTo({top:0,behavior:'instant'});
    const [page,arg]=hash.split('/');
    let context='探索首页',nav='home';
    if(page==='home'){home();}
    else if(page==='courses'){context='全部课程';nav='courses';courses(arg);}
    else if(page==='chapter'){context='章节总览';nav='courses';chapterPage(arg);}
    else if(page==='research'){context='问题研究';nav='research';research();}
    else if(page==='saved'){context='我的收藏';nav='saved';saved();}
    else if(byId.has(hash)){context=byId.get(hash).ch.title;nav='courses';readerMode='text';reader(hash);}
    else {context='页面未找到';notFound();}
    $('pageContext').textContent=context;
    document.title=`${activeItem?title(activeItem):context} · 地理之间`;
    document.querySelectorAll('[data-nav]').forEach(el=>{const selected=el.dataset.nav===nav;el.classList.toggle('active',selected);if(selected)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
    updateProgress();hydrate($('main'));
    $('main').focus({preventScroll:true});
  }
  function highlight(text,query){if(!query)return esc(text);const lower=text.toLowerCase(),q=query.toLowerCase();let out='',start=0,idx;while((idx=lower.indexOf(q,start))!==-1){out+=esc(text.slice(start,idx))+'<mark>'+esc(text.slice(idx,idx+q.length))+'</mark>';start=idx+q.length;}return out+esc(text.slice(start));}
  function search(){
    const query=$('searchInput').value.trim(),q=normalize(query);
    if(!q){$('searchStatus').textContent='搜索两册教材的章节标题与完整正文';$('searchResults').innerHTML='<div class="search-hints">'+['水循环','太阳','人口迁移','城镇化','自然灾害'].map(s=>`<button data-query="${s}">${s}</button>`).join('')+'</div>';return;}
    const hits=flat.filter(x=>x.search.includes(q)).sort((a,b)=>Number(normalize(b.sec.title).includes(q))-Number(normalize(a.sec.title).includes(q)));
    $('searchStatus').textContent=hits.length?`找到 ${hits.length} 篇相关内容`:'没有找到匹配内容，试试更短的关键词。';
    $('searchResults').innerHTML=hits.map(x=>{const body=x.sec.text.replace(/\s+/g,''),idx=body.toLowerCase().indexOf(q),start=Math.max(0,idx-28),snippet=(start?'…':'')+body.slice(start,start+100)+'…';return `<a class="search-result" href="#${x.sec.id}"><strong>${highlight(title(x),query)}</strong><small>${esc(x.bk.short)} · ${esc(x.ch.title)} · ${kind(x.sec)}</small><p>${highlight(snippet,q)}</p></a>`;}).join('');
  }
  function openSearch(){search();$('searchDialog').showModal();$('searchInput').focus();}
  function closeMenu(returnFocus=true){const wasOpen=$('sidebar').classList.contains('open');$('sidebar').classList.remove('open');$('scrim').hidden=true;$('menuBtn').setAttribute('aria-expanded','false');if(matchMedia('(max-width:680px)').matches)$('sidebar').inert=true;if(returnFocus&&wasOpen)$('menuBtn').focus();}
  function syncMenu(){if(!matchMedia('(max-width:680px)').matches){$('sidebar').inert=false;$('scrim').hidden=true;$('sidebar').classList.remove('open');$('menuBtn').setAttribute('aria-expanded','false');}else if(!$('sidebar').classList.contains('open'))$('sidebar').inert=true;}
  $('menuBtn').addEventListener('click',()=>{if($('sidebar').classList.contains('open'))return closeMenu();$('sidebar').inert=false;$('sidebar').classList.add('open');$('scrim').hidden=false;$('menuBtn').setAttribute('aria-expanded','true');$('sidebar').querySelector('a').focus();});
  $('scrim').addEventListener('click',()=>closeMenu());
  $('searchTrigger').addEventListener('click',openSearch);
  $('searchInput').addEventListener('input',search);
  $('searchInput').addEventListener('keydown',e=>{if(e.key==='Enter'){const link=$('searchResults').querySelector('a');if(link){e.preventDefault();link.click();}}if(e.key==='ArrowDown'){e.preventDefault();$('searchResults').querySelector('a,button')?.focus();}});
  $('aboutBtn').addEventListener('click',()=>$('aboutDialog').showModal());
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(!$('searchDialog').open)openSearch();}if(e.key==='Escape')closeMenu();});
  document.addEventListener('click',e=>{
    const button=e.target.closest('button');
    const searchLink=e.target.closest('.search-result');if(searchLink){if(location.hash===searchLink.getAttribute('href')){$('searchDialog').close();$('main').focus();}else $('searchDialog').close();}
    if(e.target.closest('#sidebar a'))closeMenu(false);
    if(!button)return;
    if(button.dataset.close)$(button.dataset.close).close();
    if(button.dataset.filter){if(button.dataset.place==='home'){homeBook=button.dataset.filter;$('homeChapters').innerHTML=cards(homeBook);button.closest('.segmented').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b===button));}else location.hash='courses/'+button.dataset.filter;}
    if(button.dataset.query){$('searchInput').value=button.dataset.query;search();$('searchInput').focus();}
    if(button.dataset.image){$('largeImage').src='assets/pages/'+button.dataset.image;$('largeImage').alt=button.dataset.caption;$('imageCaption').textContent=button.dataset.caption;$('imageDialog').showModal();$('imageDialog').scrollTop=0;}
    if(button.dataset.save){const id=button.dataset.save;state.saved=state.saved.includes(id)?state.saved.filter(x=>x!==id):[id,...state.saved];saveState();button.outerHTML=saveButton(byId.get(id));document.querySelector(`[data-save="${id}"]`)?.focus({preventScroll:true});updateProgress();toast(state.saved.includes(id)?'已加入我的收藏':'已取消收藏');}
    if(button.dataset.done){const id=button.dataset.done;state.done=state.done.includes(id)?state.done.filter(x=>x!==id):[...state.done,id];saveState();const buttons=[...document.querySelectorAll(`[data-done="${id}"]`)];const index=buttons.indexOf(button);buttons.forEach(b=>b.outerHTML=doneButton(byId.get(id)));document.querySelectorAll(`[data-done="${id}"]`)[index]?.focus({preventScroll:true});updateProgress();toast(state.done.includes(id)?'已留下这一步学习足迹':'已取消完成标记');}
    if(button.dataset.mode && activeItem){persistPosition();readerMode=button.dataset.mode;const top=window.scrollY;reader(activeItem.sec.id,false);window.scrollTo({top,behavior:'instant'});document.querySelector(`[data-mode="${readerMode}"]`)?.focus({preventScroll:true});}
    if(button.dataset.font){state.font=Math.max(15,Math.min(23,state.font+Number(button.dataset.font)));saveState();document.documentElement.style.setProperty('--article-size',state.font+'px');document.querySelector('[data-font="-1"]').disabled=state.font<=15;document.querySelector('[data-font="1"]').disabled=state.font>=23;}
  });
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}}));
  let scrollTimer;
  function updateReadingProgress(){const el=$('readingProgress');if(el)el.style.width=Math.min(100,Math.max(0,window.scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)*100))+'%';}
  window.addEventListener('scroll',()=>{updateReadingProgress();clearTimeout(scrollTimer);scrollTimer=setTimeout(persistPosition,300);},{passive:true});
  window.addEventListener('pagehide',persistPosition);
  window.addEventListener('hashchange',route);
  window.addEventListener('resize',syncMenu);
  hydrate();syncMenu();route();
})();
