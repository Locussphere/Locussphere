/* ═══════════════════════════════════════
   THEME TOGGLE
   ═══════════════════════════════════════ */
(function(){
    const btn=document.getElementById('themeToggle');
    const sun=document.querySelector('.sun-icon');
    const moon=document.querySelector('.moon-icon');
    if(!btn) return;
    const saved=localStorage.getItem('locus-theme');
    if(saved==='light') setLight();

    btn.addEventListener('click',()=>document.body.classList.contains('light-mode')?setDark():setLight());

    function setLight(){document.body.classList.add('light-mode');sun&&sun.classList.add('hidden');moon&&moon.classList.remove('hidden');localStorage.setItem('locus-theme','light');}
    function setDark(){document.body.classList.remove('light-mode');sun&&sun.classList.remove('hidden');moon&&moon.classList.add('hidden');localStorage.setItem('locus-theme','dark');}
})();

/* ═══════════════════════════════════════
   INDEX PAGE
   ═══════════════════════════════════════ */
(function(){
    const grid=document.getElementById('cardGrid');
    if(!grid) return;

    let all=[], cat='all';

    fetch('mods.json').then(r=>r.json()).then(d=>{all=d;render();}).catch(()=>{grid.innerHTML='<p style="color:var(--text-secondary)">Failed to load.</p>';});

    // category clicks
    document.querySelectorAll('.category-list li').forEach(li=>{
        li.addEventListener('click',()=>{
            document.querySelectorAll('.category-list li').forEach(x=>x.classList.remove('active'));
            li.classList.add('active');
            cat=li.dataset.category;
            render();
        });
    });

    // search
    const inp=document.getElementById('searchInput');
    if(inp) inp.addEventListener('input',render);

    function render(){
        const q=(inp?inp.value:'').toLowerCase();
        let list=all;
        if(cat!=='all') list=list.filter(p=>p.category.toLowerCase().replace(/\s+/g,'-')===cat);
        if(q) list=list.filter(p=>p.title.toLowerCase().includes(q)||p.description.toLowerCase().includes(q));

        const cnt=document.getElementById('resultsCount');
        if(cnt) cnt.textContent=`${list.length} project${list.length!==1?'s':''}  found`;

        grid.innerHTML='';
        list.forEach(p=>{
            // pick badge colour class
            let bc='';
            if(p.category==='Resource Packs') bc=' badge-rp';
            else if(p.category==='Tools') bc=' badge-tool';
            else if(p.category==='3D Models') bc=' badge-3d';

            const a=document.createElement('a');
            a.className='project-card';
            a.href=`details.html?id=${p.id}`;
            a.innerHTML=`
                <img class="card-thumbnail" src="${p.thumbnail}" alt="${p.title}" onerror="this.style.background='var(--bg-tertiary)'">
                <div class="card-content">
                    <div class="card-header">
                        <span class="card-title">${p.title}</span>
                        <span class="card-badge${bc}">${p.category}</span>
                    </div>
                    <p class="card-description">${p.description}</p>
                    <div class="card-footer">
                        <span class="card-meta">Multiple versions available</span>
                    </div>
                </div>`;
            grid.appendChild(a);
        });
    }
})();

/* ═══════════════════════════════════════
   DETAILS PAGE
   ═══════════════════════════════════════ */
(function(){
    const mainPreview=document.getElementById('mainPreview');
    const bannerWrap=document.getElementById('bannerWrap');
    // If neither exist we are not on details page
    if(!mainPreview && !bannerWrap) return;

    const id=new URLSearchParams(location.search).get('id');
    let project=null;
    let imgIdx=0;

    fetch('mods.json').then(r=>r.json()).then(list=>{
        project=list.find(p=>p.id===id);
        if(!project){document.body.innerHTML='<h2 style="padding:60px;color:var(--text-secondary)">Project not found.</h2>';return;}
        init();
    }).catch(()=>{document.body.innerHTML='<h2 style="padding:60px;color:var(--text-secondary)">Failed to load.</h2>';});

    /* ── bootstrap ── */
    function init(){
        // static text
        setText('projectTitle',project.title);
        setText('projectDescription',project.description);
        setText('breadcrumbCategory',project.category);
        setText('breadcrumbTitle',project.title);
        setText('category',project.category);

        // conditional: banner vs slider
        const hasScreenshots = project.screenshots && project.screenshots.length > 0;
        if(hasScreenshots){
            // hide banner, show slider
            document.getElementById('bannerWrap').classList.add('hidden');
            document.getElementById('sliderWrap').classList.remove('hidden');
            buildSlider();
        } else {
            // show banner, hide slider
            document.getElementById('bannerWrap').classList.remove('hidden');
            document.getElementById('sliderWrap').classList.add('hidden');
            document.getElementById('bannerImg').src=project.banner;
        }

        // build loader dropdown
        buildLoaderSelect();
    }

    /* ── Loader select ── */
    function buildLoaderSelect(){
        const sel=document.getElementById('loaderSelect');
        sel.innerHTML='';
        const loaders=Object.keys(project.loaders);
        loaders.forEach(name=>{
            const opt=document.createElement('option');
            opt.value=name;
            opt.textContent=name;
            sel.appendChild(opt);
        });
        sel.value=loaders[0];
        sel.addEventListener('change',()=>buildVersionSelect());
        buildVersionSelect(); // populate versions for default loader
    }

    /* ── Version select (depends on chosen loader) ── */
    function buildVersionSelect(){
        const loader=document.getElementById('loaderSelect').value;
        const sel=document.getElementById('versionSelect');
        sel.innerHTML='';
        const versions=Object.keys(project.loaders[loader].versions).sort(compareVersions);
        versions.forEach(v=>{
            const opt=document.createElement('option');
            opt.value=v;
            opt.textContent=v;
            sel.appendChild(opt);
        });
        sel.value=versions[0]; // default = highest version
        sel.addEventListener('change',()=>renderVersionData());
        renderVersionData();
    }

    /* ── Render changelog + file size for current loader+version ── */
    function renderVersionData(){
        const loader=document.getElementById('loaderSelect').value;
        const ver=document.getElementById('versionSelect').value;
        const data=project.loaders[loader].versions[ver];

        // file size
        setText('fileSize',data.fileSize);

        // download wiring
        document.getElementById('downloadButton').onclick=()=>window.open(data.downloadLink,'_blank');

        // changelog rows
        const card=document.getElementById('versionCard');
        card.innerHTML='<div class="version-list"></div>';
        const list=card.querySelector('.version-list');

        data.changelog.forEach((entry,i)=>{
            const row=document.createElement('div');
            row.className='version-row'+(i===0?' active':'');
            row.innerHTML=`
                <div class="vr-left">
                    <span class="vr-ver">${entry.version}</span>
                    <span class="vr-date">${entry.date}</span>
                </div>
                <div class="vr-right">
                    <p class="vr-changes">${entry.changes}</p>
                </div>`;
            row.addEventListener('click',()=>{
                card.querySelectorAll('.version-row').forEach(r=>r.classList.remove('active'));
                row.classList.add('active');
            });
            list.appendChild(row);
        });
    }

    /* ── Screenshot Slider (Resource Packs only) ── */
    function buildSlider(){
        const imgs=project.screenshots;
        const strip=document.getElementById('thumbStrip');
        strip.innerHTML='';

        imgs.forEach((src,i)=>{
            const img=document.createElement('img');
            img.className='thumb'+(i===0?' active':'');
            img.src=src;
            img.alt='Screenshot '+(i+1);
            img.onclick=()=>goTo(i);
            strip.appendChild(img);
        });

        goTo(0);

        document.getElementById('prevBtn').onclick=()=>goTo((imgIdx-1+imgs.length)%imgs.length);
        document.getElementById('nextBtn').onclick=()=>goTo((imgIdx+1)%imgs.length);

        document.addEventListener('keydown',e=>{
            if(e.key==='ArrowLeft') document.getElementById('prevBtn').click();
            if(e.key==='ArrowRight') document.getElementById('nextBtn').click();
        });
    }

    function goTo(i){
        imgIdx=i;
        const prev=document.getElementById('mainPreview');
        prev.style.opacity='0';
        setTimeout(()=>{prev.src=project.screenshots[i];prev.style.opacity='1';},150);
        document.querySelectorAll('.thumb').forEach((t,idx)=>t.classList.toggle('active',idx===i));
        const active=document.querySelectorAll('.thumb')[i];
        if(active) active.scrollIntoView({inline:'center',behavior:'smooth'});
    }

    /* ── Utility ── */
    function setText(id,txt){const el=document.getElementById(id);if(el) el.textContent=txt;}

    // Sort game versions descending (1.20.4 > 1.20.2 > 1.19.4 …)
    function compareVersions(a,b){
        const pa=a.split('.').map(Number);
        const pb=b.split('.').map(Number);
        for(let i=0;i<Math.max(pa.length,pb.length);i++){
            const na=pa[i]||0, nb=pb[i]||0;
            if(na!==nb) return nb-na;
        }
        return 0;
    }
})();
