/* Labsens PUCV dashboard — demo mode + optional Supabase connection */
(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const state = {
    simulation: true, connected: false, client: null, table: 'greenhouse_readings',
    readings: [], filtered: [], page: 1, pageSize: 10, charts: {}, timer: null,
    thresholds: {temp:30, hum:45, vpd:1.4, rad:150},
    current: {temp:25.4, hum:68.2, vpd:0.92, rad:486},
    tutorialIndex: 0
  };
  const fmt = (n, digits=1) => Number(n).toFixed(digits);
  const now = () => new Date();
  const dateLabel = d => new Intl.DateTimeFormat('es-CL',{day:'2-digit',month:'short',year:'numeric'}).format(d);
  const stamp = d => new Intl.DateTimeFormat('es-CL',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(d);
  const isoDate = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let toastTimer;
  function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3200)}
  function randomAround(base,spread,min=0){return Math.max(min,base+(Math.random()-.5)*spread)}
  function calcVpd(temp,hum){const svp=.6108*Math.exp((17.27*temp)/(temp+237.3));return svp*(1-hum/100)}
  function makeReading(date, overrides={}) {
    const hour=date.getHours();
    const daylight=Math.max(0,Math.sin((hour-6)/12*Math.PI));
    const temp=overrides.temp ?? randomAround(22.5+daylight*4.2,1.8,10);
    const hum=overrides.hum ?? Math.min(95,Math.max(35,randomAround(75-daylight*8,7,20)));
    const vpd=overrides.vpd ?? calcVpd(temp,hum);
    const rad=overrides.rad ?? Math.max(0,Math.round(randomAround(daylight*650,100,0)));
    return {date:new Date(date),temp:Number(temp),hum:Number(hum),vpd:Number(vpd),rad:Number(rad),status:'normal'};
  }
  function seedReadings(){const arr=[];const t=now();for(let i=119;i>=0;i--){const d=new Date(t.getTime()-i*60000);arr.push(makeReading(d))}return arr}
  function getStatus(r){return r.temp>state.thresholds.temp||r.hum<state.thresholds.hum||r.vpd>state.thresholds.vpd||r.rad<state.thresholds.rad?'warning':'normal'}
  function evaluate(r){r.status=getStatus(r);return r}
  function updateClock(){$('#todayLabel').textContent=dateLabel(now());$('#settingsUpdated').textContent=now().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'})}
  function setText(id,value){const el=$('#'+id);if(el)el.textContent=value}
  function currentFromReading(r){state.current={temp:r.temp,hum:r.hum,vpd:r.vpd,rad:r.rad}}
  function updateKPIs(){
    const c=state.current;
    setText('tempValue',fmt(c.temp,1));setText('humValue',fmt(c.hum,1));setText('vpdValue',fmt(c.vpd,2));setText('radValue',Math.round(c.rad));
    setText('latencyValue',`${(6+Math.random()*4).toFixed(1)} ms`);setText('sidebarLatency',`${Math.round(6+Math.random()*4)} ms`);
    setText('lastUpdated','ahora');setText('analyticsVpd',fmt(c.vpd,2));setText('vpdMarkerLabel',fmt(c.vpd,2));
    setText('vpdTempFactor',`${fmt(c.temp,1)} °C`);setText('vpdHumFactor',`${fmt(c.hum,1)} %`);
    const marker=$('#vpdMarker');if(marker)marker.style.left=`${Math.max(2,Math.min(98,c.vpd/2.5*100))}%`;
    const zone=c.vpd>=.8&&c.vpd<=1.2;
    setText('vpdZoneBadge',zone?'● Zona objetivo':c.vpd<.8?'● VPD bajo':'● VPD elevado');
    setText('vpdDescription',zone?'El valor actual está dentro de la banda objetivo referencial para crecimiento vegetativo. Ajusta el rango según especie y etapa del cultivo.':c.vpd<.8?'La demanda evaporativa es baja. Revisa humedad y temperatura, y valida el rango óptimo para tu especie.':'La demanda evaporativa está elevada. Revisa ventilación, temperatura y disponibilidad hídrica del cultivo.');
    $('#vpdZoneBadge').style.color=zone?'#4f8a5c':'#b87e4b';$('#vpdZoneBadge').style.background=zone?'#edf7eb':'#fff2e7';
    const alertCount=state.readings.filter(r=>r.status==='warning').length;
    setText('notificationCount',Math.min(alertCount,9));setText('alertCount',`${String(alertCount).padStart(2,'0')} EVENTOS`);
    setText('sidebarConnection',state.simulation?'Simulación activa':state.connected?'Supabase conectado':'Esperando datos');
    $('#sidebarDot').style.background=state.simulation?'#66b77a':state.connected?'#66b77a':'#d4a05b';
    setText('liveLabel',state.simulation?'LIVE SIMULATION':state.connected?'SUPABASE DATA':'LIVE MODE OFF');
    setText('modbusStatus',state.simulation?'Bus Modbus simulado estable':state.connected?'Fuente de datos conectada':'Sin fuente activa');
    setText('historySource',state.simulation?'Simulación local':state.connected?'Supabase':'Sin conexión');
    setText('modeStateText',state.simulation?'Simulación activa':state.connected?'Fuente externa configurada':'Simulación desactivada');
    $('#modeDot').style.background=state.simulation?'#66b77a':state.connected?'#66b77a':'#d4a05b';
  }
  function makeGradient(ctx,color){const g=ctx.createLinearGradient(0,0,0,200);g.addColorStop(0,color+'28');g.addColorStop(1,color+'00');return g}
  function chartDefaults(){return {responsive:true,maintainAspectRatio:false,animation:{duration:300},interaction:{intersect:false,mode:'index'},plugins:{legend:{display:false},tooltip:{backgroundColor:'#183a2b',padding:10,titleFont:{family:'DM Sans'},bodyFont:{family:'DM Sans'},displayColors:true}},scales:{x:{grid:{display:false},ticks:{color:'#9aa89e',font:{size:9},maxTicksLimit:7},border:{display:false}},y:{grid:{color:'#edf2ed'},ticks:{color:'#9aa89e',font:{size:9}},border:{display:false}}}}}
  function createLineChart(id,datasets,labels,extra={}){
    const canvas=$('#'+id);if(!canvas||!window.Chart)return;
    if(state.charts[id])state.charts[id].destroy();
    const ctx=canvas.getContext('2d');
    const ds=datasets.map(d=>({...d,fill:d.fill??true,backgroundColor:d.fill===false?'transparent':makeGradient(ctx,d.borderColor),borderWidth:d.borderWidth||2,pointRadius:0,tension:.36}));
    state.charts[id]=new Chart(ctx,{type:'line',data:{labels,datasets:ds},options:{...chartDefaults(),...extra}});
  }
  function refreshCharts(){
    const recent=state.readings.slice(-60),labels=recent.map((r,i)=>i%10===0?r.date.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'}):'');
    createLineChart('homeChart',[{label:'Temperatura °C',data:recent.map(r=>r.temp),borderColor:'#4e8a62'},{label:'Humedad %',data:recent.map(r=>r.hum),borderColor:'#7db8ca',fill:false}],labels,{scales:{x:{grid:{display:false},ticks:{color:'#9aa89e',font:{size:9},maxTicksLimit:7},border:{display:false}},y:{grid:{color:'#edf2ed'},ticks:{color:'#9aa89e',font:{size:9}},border:{display:false}}}});
    const analyticsCount=Number($('#analyticsRange')?.value||24),subset=state.readings.slice(-Math.min(state.readings.length,analyticsCount*5));
    const alabels=subset.map((r,i)=>i%Math.max(1,Math.floor(subset.length/8))===0?r.date.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'}):'');
    const norm=key=>subset.map(r=>key==='temp'?r.temp/45*100:key==='hum'?r.hum:key==='vpd'?r.vpd/2.5*100:r.rad/800*100);
    createLineChart('analyticsChart',[{label:'Temperatura normalizada',data:norm('temp'),borderColor:'#4e8a62'},{label:'Humedad',data:norm('hum'),borderColor:'#7db8ca',fill:false},{label:'VPD normalizado',data:norm('vpd'),borderColor:'#9a8ac8',fill:false},{label:'Radiación normalizada',data:norm('rad'),borderColor:'#d9a05c',fill:false}],alabels,{scales:{x:{grid:{display:false},ticks:{color:'#9aa89e',font:{size:9},maxTicksLimit:8},border:{display:false}},y:{min:0,max:100,grid:{color:'#edf2ed'},ticks:{color:'#9aa89e',font:{size:9},callback:v=>v+'%'},border:{display:false}}}});
    ['temp','hum','vpd','rad'].forEach(key=>{
      const readings=state.readings.slice(-18);const colors={temp:'#4e8a62',hum:'#7db8ca',vpd:'#9a8ac8',rad:'#d9a05c'};
      const canvas=$('#spark'+({temp:'Temp',hum:'Hum',vpd:'Vpd',rad:'Rad'}[key]));if(!canvas||!window.Chart)return;
      const id=canvas.id;if(state.charts[id])state.charts[id].destroy();
      state.charts[id]=new Chart(canvas,{type:'line',data:{labels:readings.map((_,i)=>i),datasets:[{data:readings.map(r=>r[key]),borderColor:colors[key],borderWidth:1.8,pointRadius:0,tension:.4,fill:true,backgroundColor:makeGradient(canvas.getContext('2d'),colors[key])}]},options:{responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{display:false},tooltip:{enabled:false}},scales:{x:{display:false},y:{display:false}}}});
    });
  }
  function renderAlerts(){
    const c=state.current,items=[];
    if(c.temp>state.thresholds.temp)items.push({icon:'!',title:'Temperatura por encima del umbral',desc:`Actual ${fmt(c.temp)} °C · límite ${state.thresholds.temp} °C`,time:'Ahora',type:'warning'});
    if(c.hum<state.thresholds.hum)items.push({icon:'!',title:'Humedad relativa baja',desc:`Actual ${fmt(c.hum)} % · mínimo ${state.thresholds.hum} %`,time:'Ahora',type:'warning'});
    if(c.vpd>state.thresholds.vpd)items.push({icon:'!',title:'VPD elevado',desc:`Actual ${fmt(c.vpd,2)} kPa · límite ${state.thresholds.vpd} kPa`,time:'Ahora',type:'warning'});
    if(c.rad<state.thresholds.rad)items.push({icon:'!',title:'Radiación bajo el umbral',desc:`Actual ${Math.round(c.rad)} µmol/m²/s · mínimo ${state.thresholds.rad}`,time:'Ahora',type:'warning'});
    if(!items.length)items.push({icon:'✓',title:'Variables dentro de los umbrales',desc:'No se detectan condiciones críticas en la lectura actual.',time:'Ahora',type:'info'});
    items.push({icon:'↗',title:state.connected?'Consulta de backend disponible':'Nodo edge respondiendo',desc:state.simulation?'Datos sintéticos para validación de interfaz':state.connected?'Cliente Supabase inicializado':'Modo de adquisición local',time:'Sistema',type:'info'});
    $('#alertsList').innerHTML=items.slice(0,3).map(i=>`<div class="alert-item"><span class="alert-icon ${i.type==='info'?'info':''}">${i.icon}</span><div class="alert-copy"><b>${esc(i.title)}</b><small>${esc(i.desc)}</small></div><span class="alert-time">${esc(i.time)}</span></div>`).join('');
  }
  function renderHourly(){
    const rows=[];for(let h=0;h<6;h++){const start=now();start.setHours(start.getHours()-5+h,0,0,0);const subset=state.readings.filter(r=>r.date.getHours()===start.getHours()).slice(-12);const avg=k=>subset.length?subset.reduce((s,r)=>s+r[k],0)/subset.length:0;const r={temp:avg('temp'),hum:avg('hum'),vpd:avg('vpd'),rad:avg('rad')};const warning=r.temp>state.thresholds.temp||r.hum<state.thresholds.hum||r.vpd>state.thresholds.vpd;rows.push(`<tr><td>${String(start.getHours()).padStart(2,'0')}:00 – ${String((start.getHours()+1)%24).padStart(2,'0')}:00</td><td>${fmt(r.temp)} °C</td><td>${fmt(r.hum)} %</td><td>${fmt(r.vpd,2)} kPa</td><td>${Math.round(r.rad)} µmol</td><td><span class="state-pill ${warning?'warning':''}">● ${warning?'Revisar':'Normal'}</span></td></tr>`)}$('#hourlyTable').innerHTML=rows.join('');
    const last=state.readings.slice(-60);const avg=k=>last.reduce((s,r)=>s+r[k],0)/(last.length||1);setText('avgTemp',`${fmt(avg('temp'))} °C`);setText('avgHum',`${fmt(avg('hum'))} %`);setText('avgVpd',`${fmt(avg('vpd'),2)} kPa`);
  }
  function renderHistory(){
    const from=$('#dateFrom').value,to=$('#dateTo').value,variable=$('#variableFilter').value,status=$('#statusFilter').value;
    state.filtered=state.readings.filter(r=>(!from||isoDate(r.date)>=from)&&(!to||isoDate(r.date)<=to)&&(status==='all'||r.status===status));
    const total=state.filtered.length;const pages=Math.max(1,Math.ceil(total/state.pageSize));state.page=Math.min(state.page,pages);
    const pageRows=state.filtered.slice((state.page-1)*state.pageSize,state.page*state.pageSize);
    $('#historyTable').innerHTML=pageRows.length?pageRows.map(r=>`<tr><td>${esc(stamp(r.date))}</td><td>${variable==='all'||variable==='temp'?fmt(r.temp)+' °C':'—'}</td><td>${variable==='all'||variable==='hum'?fmt(r.hum)+' %':'—'}</td><td>${variable==='all'||variable==='vpd'?fmt(r.vpd,2)+' kPa':'—'}</td><td>${variable==='all'||variable==='rad'?Math.round(r.rad)+' µmol':'—'}</td><td><span class="state-pill ${r.status==='warning'?'warning':''}">● ${r.status==='warning'?'Alerta':'Normal'}</span></td></tr>`).join(''):'<tr><td colspan="6" style="text-align:center;padding:30px;color:#98a69b">No hay registros con estos filtros.</td></tr>';
    setText('historyTotal',total);setText('tableInfo',total?`Mostrando ${(state.page-1)*state.pageSize+1}–${Math.min(state.page*state.pageSize,total)} de ${total} registros`:'Sin registros');
    const p=$('#pagination');p.innerHTML=`<button class="page-btn" data-page="${state.page-1}" ${state.page===1?'disabled':''}>‹</button>`+Array.from({length:pages},(_,i)=>i+1).filter(n=>n===1||n===pages||Math.abs(n-state.page)<=1).map((n,i,a)=>`${i>0&&n-a[i-1]>1?'<span style="padding:7px 2px">…</span>':''}<button class="page-btn ${n===state.page?'active':''}" data-page="${n}">${n}</button>`).join('')+`<button class="page-btn" data-page="${state.page+1}" ${state.page===pages?'disabled':''}>›</button>`;
  }
  function updateStatuses(){state.readings.forEach(evaluate);updateKPIs();renderAlerts();renderHourly();renderHistory()}
  function addReading(){
    if(!state.simulation)return;
    const prev=state.current;const temp=randomAround(prev.temp,.7,10),hum=Math.min(95,Math.max(30,randomAround(prev.hum,2,20))),rad=Math.max(0,Math.round(randomAround(prev.rad,35,0)));
    const r=evaluate(makeReading(now(),{temp,hum,vpd:calcVpd(temp,hum),rad}));state.readings.push(r);if(state.readings.length>1000)state.readings.shift();currentFromReading(r);updateStatuses();refreshCharts();
  }
  function goPage(name){const valid=['home','analytics','tutorial','historial','configuraciones'];if(!valid.includes(name))name='home';$$('.page-section').forEach(p=>p.classList.toggle('active',p.id==='page-'+name));$$('.nav-link').forEach(a=>a.classList.toggle('active',a.dataset.page===name));const crumbs={home:'Overview',analytics:'Analytics',tutorial:'Tutorial',historial:'Historial',configuraciones:'Configuraciones'};setText('pageCrumb',crumbs[name]);location.hash=name;$('#sidebar').classList.remove('open');if(name==='analytics')setTimeout(refreshCharts,50);if(name==='historial')renderHistory();window.scrollTo({top:0,behavior:'smooth'})}
  const tutorials=[
    {title:'Conecta el bus RS485',intro:'Comprueba el cableado y los parámetros eléctricos del sensor antes de iniciar la adquisición.',heading:'Checklist de hardware',code:'Sensor A / D+  ─────────  A / D+ del adaptador\\nSensor B / D−  ─────────  B / D− del adaptador\\nGND            ─────────  GND (si el fabricante lo requiere)\\n\\nUSB-RS485 → puerto USB de Raspberry Pi',bullets:['Confirma si el fabricante etiqueta los bornes como A/B o D+/D−: la nomenclatura varía.','Configura la resistencia de terminación según la longitud del bus y el manual.','Registra baud rate, paridad, bits de datos, stop bits e ID Modbus del dispositivo.']},
    {title:'Prepara Raspberry Pi 4 B',intro:'Usa un entorno virtual para aislar dependencias y ejecuta el proceso con un usuario de sistema de permisos limitados.',heading:'Instalación inicial',code:'sudo apt update && sudo apt upgrade -y\\nsudo apt install -y python3-venv python3-pip\\nmkdir -p ~/labsens-iot && cd ~/labsens-iot\\npython3 -m venv .venv\\nsource .venv/bin/activate\\npip install pymodbus supabase python-dotenv',bullets:['Comprueba el puerto con ls -l /dev/ttyUSB* o /dev/serial/by-id/.','Añade el usuario al grupo de acceso serial que corresponda y vuelve a iniciar sesión.','Guarda credenciales en variables de entorno o un archivo .env protegido.']},
    {title:'Lee registros Modbus con Python',intro:'Este ejemplo es una plantilla: debes sustituir el puerto, la dirección del esclavo y los registros por los definidos en el manual de tu sensor.',heading:'Ejemplo de adquisición',code:'from pymodbus.client import ModbusSerialClient\\n\\nclient = ModbusSerialClient(\\n    port="/dev/ttyUSB0", baudrate=9600,\\n    parity="N", stopbits=1, bytesize=8, timeout=2\\n)\\n\\nif client.connect():\\n    result = client.read_holding_registers(\\n        address=0, count=2, device_id=1\\n    )\\n    if not result.isError():\\n        print("Registros:", result.registers)\\n    client.close()',bullets:['La API de pymodbus cambia entre versiones; confirma la firma de los métodos instalada.','Aplica escalado y conversión de registros según el datasheet.','Añade reintentos, logs, timestamps y tratamiento de timeouts antes de desplegar.']},
    {title:'Envía lecturas a Supabase',intro:'Crea una tabla para almacenar las mediciones y limita permisos mediante Row Level Security (RLS).',heading:'Tabla sugerida',code:'create table public.greenhouse_readings (\\n  id bigint generated by default as identity primary key,\\n  recorded_at timestamptz not null default now(),\\n  temperature double precision not null,\\n  humidity double precision not null,\\n  vpd double precision not null,\\n  radiation double precision not null\\n);',bullets:['Activa RLS y crea políticas de lectura/escritura acordes a tu modelo de seguridad.','En el nodo Raspberry Pi usa secretos de servidor fuera del frontend.','Registra unidades y zona horaria de forma consistente para facilitar el análisis.']},
    {title:'Conecta el dashboard',intro:'El formulario de Configuraciones inicializa el cliente web con una clave pública y consulta la tabla indicada.',heading:'Consulta de ejemplo',code:'const { data, error } = await supabase\\n  .from("greenhouse_readings")\\n  .select("*")\\n  .order("recorded_at", { ascending: false })\\n  .limit(100);\\n\\nif (error) console.error(error);\\nelse console.table(data);',bullets:['La tabla debe permitir SELECT a la identidad que usa el cliente, según las políticas RLS.','La clave anon/publishable no sustituye las políticas de seguridad.','La demo actual lee datos de Supabase al pulsar “Conectar y probar”; el resto de la UI conserva el fallback local.']}
  ];
  function renderTutorial(index){state.tutorialIndex=index;const t=tutorials[index];$('#tutorialContent').innerHTML=`<span class="step-count">PASO ${String(index+1).padStart(2,'0')} / 05</span><h3>${t.title}</h3><p>${t.intro}</p><h4>${t.heading}</h4><pre><code>${esc(t.code)}</code></pre><p class="copy-hint">Ejemplo de referencia · adapta valores al hardware y a tu entorno.</p><h4>Buenas prácticas</h4><ul>${t.bullets.map(b=>`<li style="font-size:10px;color:#7e8e82;line-height:1.7;margin:7px 0">${esc(b)}</li>`).join('')}</ul><div style="display:flex;justify-content:space-between;margin-top:22px"><button class="secondary-button" id="prevTutorial" ${index===0?'disabled':''}>← Anterior</button><button class="primary-button" id="nextTutorial">${index===4?'Volver al inicio':'Siguiente paso →'}</button></div>`;
    $$('.tutorial-step').forEach(b=>b.classList.toggle('active',Number(b.dataset.step)===index));
    $('#prevTutorial').addEventListener('click',()=>renderTutorial(Math.max(0,index-1)));
    $('#nextTutorial').addEventListener('click',()=>renderTutorial(index===4?0:index+1));
  }
  async function connectSupabase(e){
    e.preventDefault();const url=$('#supabaseUrl').value.trim(),key=$('#supabaseKey').value.trim(),table=$('#tableName').value.trim()||'greenhouse_readings',msg=$('#supabaseMessage');
    if(!url||!key){msg.textContent='Ingresa URL y clave pública.';msg.style.color='#c58954';toast('Completa la URL y la clave pública de Supabase.');return}
    if(!/^https:\/\/[a-zA-Z0-9.-]+/.test(url)){msg.textContent='La URL no parece válida.';msg.style.color='#c58954';return}
    if(!window.supabase?.createClient){msg.textContent='No se pudo cargar el SDK de Supabase.';return}
    msg.textContent='Probando conexión…';msg.style.color='#8a9a8f';
    try{
      const client=window.supabase.createClient(url,key);const {data,error}=await client.from(table).select('*').limit(20);
      if(error)throw error;
      state.client=client;state.connected=true;state.table=table;state.simulation=false;$('#simulationToggle').checked=false;
      const mapped=(data||[]).map(row=>{const d=new Date(row.recorded_at||row.created_at||row.timestamp||now());const r=makeReading(d,{temp:Number(row.temperature??row.temp??row.temp_c??state.current.temp),hum:Number(row.humidity??row.hum??row.humidity_percent??state.current.hum),vpd:Number(row.vpd??state.current.vpd),rad:Number(row.radiation??row.radiation_par??row.rad??state.current.rad)});return evaluate(r)}).filter(r=>Number.isFinite(r.temp)&&Number.isFinite(r.hum));
      if(mapped.length){state.readings=mapped.sort((a,b)=>a.date-b.date);currentFromReading(state.readings[state.readings.length-1]);}
      if($('#rememberConfig').checked){localStorage.setItem('labsensSupabaseConfig',JSON.stringify({url,key,table}));}
      msg.textContent=`Conectado · ${data?.length||0} registros leídos`;msg.style.color='#4f8a5c';toast('Cliente Supabase conectado correctamente.');updateStatuses();refreshCharts();
    }catch(err){state.connected=false;msg.textContent=`Error: ${err.message||'no se pudo consultar la tabla'}`;msg.style.color='#c16e55';toast('No se pudo conectar. Revisa la tabla, red y políticas RLS.');updateKPIs()}
  }
  function exportCSV(){
    const rows=state.filtered.length?state.filtered:state.readings;
    if(!rows.length){toast('No hay datos para exportar.');return}
    const header=['recorded_at','temperature_c','humidity_percent','vpd_kpa','radiation_umol_m2_s','status'];
    const lines=[header.join(','),...rows.map(r=>[r.date.toISOString(),fmt(r.temp,2),fmt(r.hum,2),fmt(r.vpd,3),Math.round(r.rad),r.status].join(','))];
    const blob=new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`labsens-historial-${isoDate(now())}.csv`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);toast(`CSV exportado · ${rows.length} registros`);
  }
  function wire(){
    $$('.nav-link').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();goPage(a.dataset.page)}));
    $$('[data-go]').forEach(b=>b.addEventListener('click',()=>goPage(b.dataset.go)));
    $$('[data-page]').filter(e=>e.classList.contains('page-btn')).forEach(()=>{});
    $('#mobileMenu').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
    document.addEventListener('click',e=>{if(window.innerWidth<=800&&$('#sidebar').classList.contains('open')&&!$('#sidebar').contains(e.target)&&!$('#mobileMenu').contains(e.target))$('#sidebar').classList.remove('open')});
    $('#notificationBtn').addEventListener('click',()=>{goPage('home');$('#alertsList').scrollIntoView({behavior:'smooth',block:'center'})});
    $('#analyticsRange').addEventListener('change',refreshCharts);
    $$('.tutorial-step').forEach(b=>b.addEventListener('click',()=>renderTutorial(Number(b.dataset.step))));
    ['dateFrom','dateTo','variableFilter','statusFilter'].forEach(id=>$('#'+id).addEventListener('change',()=>{state.page=1;renderHistory()}));
    $('#clearFilters').addEventListener('click',()=>{$('#dateFrom').value='';$('#dateTo').value='';$('#variableFilter').value='all';$('#statusFilter').value='all';state.page=1;renderHistory()});
    $('#pagination').addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(!b||b.disabled)return;state.page=Number(b.dataset.page);renderHistory()});
    $('#exportCsv').addEventListener('click',exportCSV);$('#supabaseForm').addEventListener('submit',connectSupabase);
    $('#simulationToggle').addEventListener('change',e=>{state.simulation=e.target.checked;if(state.simulation){state.connected=false;toast('Simulación local activada.')}else toast('Simulación pausada. Configura una fuente de datos real.');updateKPIs();renderAlerts()});
    const configPairs=[['tempThreshold','tempThresholdLabel','temp'],['humThreshold','humThresholdLabel','hum'],['vpdThreshold','vpdThresholdLabel','vpd'],['radThreshold','radThresholdLabel','rad']];
    configPairs.forEach(([input,label,key])=>$('#'+input).addEventListener('input',e=>{state.thresholds[key]=Number(e.target.value);setText(label,e.target.value);updateStatuses()}));
    $('#supabaseUrl').addEventListener('input',()=>{if($('#supabaseMessage').textContent.startsWith('Error'))$('#supabaseMessage').textContent='Sin conexión configurada'});
    window.addEventListener('hashchange',()=>goPage(location.hash.replace('#','')||'home'));
  }
  function restoreConfig(){try{const saved=JSON.parse(localStorage.getItem('labsensSupabaseConfig')||'null');if(saved){$('#supabaseUrl').value=saved.url||'';$('#supabaseKey').value=saved.key||'';$('#tableName').value=saved.table||'greenhouse_readings';$('#rememberConfig').checked=true;}}catch{}}
  function init(){
    state.readings=seedReadings();state.readings.forEach(evaluate);currentFromReading(state.readings[state.readings.length-1]);
    updateClock();restoreConfig();wire();renderTutorial(0);updateStatuses();refreshCharts();
    setInterval(updateClock,30000);state.timer=setInterval(addReading,5000);
    if(location.hash&&location.hash!=='#home')goPage(location.hash.slice(1));
  }
  document.addEventListener('DOMContentLoaded',init);
})();
