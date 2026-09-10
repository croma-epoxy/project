const slidesData = [
  {
    id: 1,
    title: "Portada Formal",
    script: "Buenos días. Damos inicio a la Mesa Redonda 1. El objetivo principal es definir la integración de la IA en el hardware embebido (Raspberry Pi), comparar formalmente 3 alternativas de orquestación, y detallar cómo manejaremos el almacenamiento y la nube.",
    render: () => `
      <div class="flex-1 flex flex-col justify-between">
        <div class="flex justify-between items-start border-b border-slate-200 pb-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-pucv-blue">Pontificia Universidad Católica de Valparaíso</span>
            <h4 class="text-sm font-semibold text-slate-600">Escuela de Ingeniería Eléctrica • LabSens / DY</h4>
          </div>
          <span class="inline-block px-3 py-1 bg-pucv-navy text-white text-xs font-bold rounded-full">Mesa Redonda 1</span>
        </div>
        <div class="my-auto py-6">
          <span class="inline-block px-3 py-1 bg-emerald-100 text-agri-green text-xs font-bold rounded mb-3 tracking-wide">PROYECTO DE TITULACIÓN</span>
          <h1 class="font-heading font-extrabold text-3xl md:text-5xl text-pucv-navy leading-tight mb-4">Arquitectura Ciberfísica para Invernaderos Autónomos</h1>
          <p class="text-slate-600 text-base md:text-xl font-medium max-w-4xl">Evaluación de Alternativas, Edge AI y Sincronización ETL.</p>
        </div>
      </div>
    `
  },
  {
    id: 2,
    title: "Estudio Comparativo (3 Alternativas)",
    script: "Profesor, en respuesta a la metodología del LabSens, evaluamos 3 alternativas para orquestar la IA: n8n (antecedente 2025), Home Assistant (el estado del arte que me proporcionó) y nuestra propuesta híbrida en Python. Como se observa en la tabla, n8n consume demasiada RAM; Home Assistant es una caja negra que depende de internet para la IA; por descarte técnico y eficiencia energética (solo 5W), seleccionamos código nativo (Python/AsyncIO) en la Raspberry Pi.",
    render: () => `
      <div class="flex-1 flex flex-col justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-pucv-blue">Metodología EIE: Análisis de Alternativas</span>
          <h2 class="font-heading font-extrabold text-2xl text-pucv-navy mb-2">Evaluación del Orquestador y Cerebro de IA</h2>
        </div>
        <!-- Rúbrica LabSens: Rótulo en la parte superior -->
        <span class="table-caption">Tabla 1.1: Comparación técnica de 3 plataformas para el núcleo de control en la Raspberry Pi.</span>
        <table>
          <thead>
            <tr>
              <th>Criterio de Evaluación</th>
              <th class="bg-slate-200 text-slate-800">1. n8n (Tesis 2025)</th>
              <th class="bg-slate-200 text-slate-800">2. Home Assistant (Estado del Arte)</th>
              <th class="bg-emerald-700 text-white border-emerald-800">3. Python Nativo / AsyncIO (Nuestra Propuesta)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Consumo RAM e I/O</strong></td>
              <td class="text-red-600">Alto (~800MB) y desgasta la MicroSD con JSONs.</td>
              <td class="text-amber-600">Medio/Alto (Requiere OS dedicado).</td>
              <td class="font-bold text-agri-green bg-emerald-50">&lt; 70MB. Uso de RAM interna (tmpfs) protege la SD.</td>
            </tr>
            <tr>
              <td><strong>Dependencia de Nube (IA)</strong></td>
              <td class="text-red-600">Alta. Falla si cae la API de visión externa.</td>
              <td class="text-red-600">Total (Ej. OpenAI GPT-4 Vision). Falla sin red.</td>
              <td class="font-bold text-agri-green bg-emerald-50">100% Offline (Edge AI). Usa YOLOv8n local para decisiones físicas.</td>
            </tr>
            <tr>
              <td><strong>Capacidad de Integración</strong></td>
              <td class="text-slate-600">Excelente para APIs, mala para bucles cerrados.</td>
              <td class="text-slate-600">Caja negra. Rígida para integrar lógica a bajo nivel.</td>
              <td class="font-bold text-agri-green bg-emerald-50">Total. Control directo de relés optoacoplados en milisegundos.</td>
            </tr>
          </tbody>
        </table>
      </div>
    `
  },
  {
    id: 3,
    title: "Persistencia de Datos (Herramientas)",
    script: "Respecto al almacenamiento y visualización, planteamos una solución robusta: SQLite como base de datos local resistente a desconexiones; Supabase en la nube para resguardo remoto, y Streamlit para el dashboard. Además, elegimos Telegram sobre WhatsApp porque es gratuito, asíncrono y sin riesgo de baneo.",
    render: () => `
      <div class="flex-1 flex flex-col justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-pucv-blue">Estudio de Herramientas Software</span>
          <h2 class="font-heading font-extrabold text-2xl text-pucv-navy mb-2">Estrategia de Persistencia y Visualización</h2>
        </div>
        <!-- Rúbrica LabSens: Rótulo en la parte superior -->
        <span class="table-caption">Tabla 1.2: Selección fundamentada de software de capa superior.</span>
        <table>
          <thead>
            <tr>
              <th>Requerimiento</th>
              <th>Herramienta Seleccionada</th>
              <th>Justificación Técnica y de Costos</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Base de Datos Local</strong></td>
              <td><strong>SQLite (modo WAL)</strong></td>
              <td>Transaccional, nativa en Python, cero dependencias de red. Protege la MicroSD.</td>
            </tr>
            <tr>
              <td><strong>Base de Datos Nube</strong></td>
              <td><strong>Supabase (PostgreSQL)</strong></td>
              <td>Permite inserciones idempotentes (Upsert antiduplicados) en lote. Plan gratuito.</td>
            </tr>
            <tr>
              <td><strong>Dashboard (Visualización)</strong></td>
              <td><strong>Streamlit</strong></td>
              <td>Despliegue dual: En red local (sin internet) y despliegue público gratuito.</td>
            </tr>
            <tr>
              <td><strong>Notificaciones IA</strong></td>
              <td><strong>Telegram Bot API</strong></td>
              <td>100% gratuito, maneja imágenes fácilmente, sin riesgo de baneo (vs WhatsApp).</td>
            </tr>
          </tbody>
        </table>
      </div>
    `
  },
  {
    id: 4,
    title: "Arquitectura General en 3 Capas",
    script: "Diseñamos una arquitectura en 3 capas. Capa 1: planta física con relés optoacoplados para aislar el ruido. Capa 2: cerebro Raspberry Pi, operando 100% offline con IA en el borde. Capa 3: nube asíncrona, usada solo cuando hay internet para sincronizar.",
    render: () => `
      <div class="flex-1 flex flex-col justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-pucv-blue">Diseño de Ingeniería</span>
          <h2 class="font-heading font-extrabold text-2xl text-pucv-navy mb-2">Arquitectura Híbrida Desacoplada</h2>
        </div>
        
        <div class="space-y-4 my-auto">
          <div class="p-3 border-l-4 border-red-500 bg-red-50 rounded-r">
            <h4 class="font-bold text-xs text-red-700">CAPA 1: PLANTA Y POTENCIA FÍSICA (HW)</h4>
            <p class="text-[11px] text-slate-700">Sensores I2C/USB. <strong>Aislamiento Galvánico:</strong> Relés optoacoplados separan cargas inductivas (bomba 12V, luz 220V) de la placa lógica.(En evaluacion tecnica)</p>
          </div>
          <div class="p-3 border-l-4 border-agri-emerald bg-emerald-50 rounded-r">
            <h4 class="font-bold text-xs text-agri-green">CAPA 2: EDGE AUTONOMY (RASPBERRY PI - OFFLINE)</h4>
            <p class="text-[11px] text-slate-700">Orquestación nativa en <strong>Python</strong>. Inferencia visual con <strong>YOLOv8n</strong> en CPU. Base <strong>SQLite local</strong> soportada por buffers en RAM (tmpfs).</p>
          </div>
          <div class="p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r">
            <h4 class="font-bold text-xs text-blue-700">CAPA 3: NUBE OPORTUNISTA (ONLINE)</h4>
            <p class="text-[11px] text-slate-700">Proceso ETL "Store-and-Forward". Al detectar red, envía lotes a <strong>Supabase</strong> (sin duplicados) y actualiza <strong>Streamlit Cloud</strong>.</p>
          </div>
        </div>
        <!-- Rúbrica LabSens: Rótulo en la parte inferior -->
        <span class="fig-caption">Figura 1.1: Esquema de separación de responsabilidades en 3 capas.</span>
      </div>
    `
  },
  {
    id: 5,
    title: "Estrategia Antiduplicados (ETL)",
    script: "Para asegurar que los datos no se dupliquen al recuperar la red, implementamos un proceso ETL con el método Upsert, basándonos en el timestamp, ignorando conflictos y marcando los registros locales como sincronizados.",
    render: () => `
      <div class="flex-1 flex flex-col justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-pucv-blue">Persistencia</span>
          <h2 class="font-heading font-extrabold text-2xl text-pucv-navy mb-2">Pipeline de Datos (Store & Forward)</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-auto">
          <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 class="font-bold text-pucv-navy text-sm mb-2">1. Estrategia Antiduplicados (ETL)</h3>
            <ul class="text-[11px] text-slate-700 space-y-1 list-disc pl-4">
              <li>En SQLite local, los registros tienen la bandera: <code class="bg-slate-200 px-1 rounded">sinc = 0</code>.</li>
              <li>Al detectar internet, se envía a Supabase usando <strong>Upsert</strong> (INSERT ... ON CONFLICT DO NOTHING) basado en <em>Timestamp</em>.</li>
              <li>Si la API responde HTTP 200, se marca localmente <code class="bg-slate-200 px-1 rounded">sinc = 1</code>.</li>
            </ul>
          </div>
          <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 class="font-bold text-pucv-navy text-sm mb-2">2. Despliegue Dual de Streamlit</h3>
            <ul class="text-[11px] text-slate-700 space-y-1 list-disc pl-4">
              <li><strong>Modo Local:</strong> La RPi emite WiFi (Access Point). Acceso leyendo de SQLite sin requerir internet.</li>
              <li><strong>Modo Cloud:</strong> Streamlit Community Cloud lee desde Supabase el último volcado.</li>
            </ul>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 6,
    title: "Dashboard Implementado",
    script: "Aquí presentamos el prototipo del panel en Streamlit. Muestra telemetría y el diagnóstico foliar procesado en local, demostrando la autonomía del sistema en el borde.",
    render: () => `
      <div class="flex-1 flex flex-col justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-pucv-blue">Evidencia de Desarrollo</span>
          <h2 class="font-heading font-extrabold text-2xl text-pucv-navy mb-2">Panel de Supervisión (Streamlit)</h2>
        </div>
        <div class="my-auto w-full flex justify-center bg-slate-50 border border-slate-200 rounded-lg p-2">
          <!-- Debes tener "image_322113.jpg" en la misma carpeta que el HTML -->
          <img src="image_322113.jpg" alt="Dashboard Streamlit" class="max-h-[50vh] object-contain rounded">
        </div>
        <!-- Rúbrica LabSens: Rótulo en la parte inferior -->
        <p class="fig-caption">Figura 1.2: Panel reactivo mostrando variables climáticas y diagnóstico foliar procesado en local.</p>
      </div>
    `
  },
  {
    id: 7,
    title: "Próximos Pasos",
    script: "Nuestros próximos pasos de cara a la Mesa Redonda 2 son afinar el entorno Linux en la Raspberry, ensamblar el aislamiento de los relés optoacoplados, y someter la sonda a variaciones para evaluar tiempos de respuesta.",
    render: () => `
      <div class="flex-1 flex flex-col justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-pucv-blue">Planificación (Mesa Redonda 2)</span>
          <h2 class="font-heading font-extrabold text-2xl text-pucv-navy mb-2">Próximas Tareas y Banco de Pruebas</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-auto">
          <div class="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
            <span class="text-2xl mb-2 block">🖥️</span>
            <h3 class="font-bold text-sm text-pucv-navy">1. Entorno Base RPi</h3>
            <p class="text-[11px] text-slate-600 mt-1">Configuración Linux, RAM volátil (tmpfs), inicializar SQLite y script AsyncIO en Python.</p>
          </div>
          <div class="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
            <span class="text-2xl mb-2 block">🔌</span>
            <h3 class="font-bold text-sm text-pucv-navy">2. Integración Física</h3>
            <p class="text-[11px] text-slate-600 mt-1">Ensamblar aislamiento optoacoplado. Conectar sensores y validar lecturas deterministas sin Wi-Fi.</p>
          </div>
          <div class="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
            <span class="text-2xl mb-2 block">🌡️</span>
            <h3 class="font-bold text-sm text-pucv-navy">3. Simulación Ambiental</h3>
            <p class="text-[11px] text-slate-600 mt-1">Someter sonda a variaciones térmicas para evaluar los tiempos de respuesta del código y relés.</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 8,
    title: "Conclusiones de Etapa",
    script: "Para cerrar, concluimos que tras comparar rigurosamente 3 alternativas, resolvimos teóricamente la dependencia de red y sobrecarga de memoria del trabajo anterior, estableciendo un diseño robusto y de bajo consumo.",
    render: () => `
      <div class="flex-1 flex flex-col justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-pucv-blue">Resumen Ejecutivo</span>
          <h2 class="font-heading font-extrabold text-2xl text-pucv-navy mb-2">Conclusiones de la Mesa Redonda 1</h2>
        </div>
        
        <div class="space-y-4 my-auto">
          <div class="flex items-start space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span class="text-agri-green font-bold">✔️</span>
            <p class="text-xs text-slate-700"><strong>Evaluación Rigurosa:</strong> Se descartó n8n y Home Assistant, justificando mediante métricas (RAM, red, energía) la adopción de Python nativo.</p>
          </div>
          <div class="flex items-start space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span class="text-agri-green font-bold">✔️</span>
            <p class="text-xs text-slate-700"><strong>Bucle Cerrado en el Borde:</strong> Supervivencia de la planta 100% independiente de la nube (Edge Autonomy).</p>
          </div>
          <div class="flex items-start space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span class="text-agri-green font-bold">✔️</span>
            <p class="text-xs text-slate-700"><strong>Gestión de Datos:</strong> Diseño de pipeline ETL local (SQLite) a Supabase, evitando duplicados con patrón Store-and-Forward.</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 9,
    title: "Referencias Bibliográficas",
    script: "Finalmente, presento las referencias que sustentan esta investigación, incluyendo la tesis antecedente y la pauta de evaluación. Muchas gracias, quedo atento a sus consultas.",
    render: () => `
      <div class="flex-1 flex flex-col justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-pucv-blue">Sustento Teórico</span>
          <h2 class="font-heading font-extrabold text-2xl text-pucv-navy mb-2">Referencias Bibliográficas</h2>
        </div>
        
        <!-- Rúbrica LabSens: Formato MLA para Google Scholar -->
        <div class="space-y-3 text-[11px] text-slate-700 my-auto">
          <div class="p-2 border border-slate-200 bg-slate-50 rounded">
            <strong>[1]</strong> Reche Bernal, Irene y Daniel Yunge. <em>Diseño e Implementación de un Sistema de Diagnóstico Agrícola Automatizado mediante IA Generativa y Sensores IoT.</em> Memoria de Titulación, Escuela de Ingeniería Eléctrica, PUCV, 2025.
          </div>
          <div class="p-2 border border-slate-200 bg-slate-50 rounded">
            <strong>[2]</strong> Aubury, Simon. "Can AI Take Care of My Plant (Because I Can’t)?" <em>Medium</em>, 2024.
          </div>
          <div class="p-2 border border-slate-200 bg-slate-50 rounded">
            <strong>[3]</strong> Yunge, Daniel y Juan Vignolo. <em>Modelo de Desarrollo de Proyecto de Titulación LabSens.</em> Documento interno EIE, PUCV, 2025.
          </div>
        </div>
        <div class="text-center font-bold text-pucv-blue text-sm mt-4">Inicio de Ronda de Preguntas</div>
      </div>
    `
  }
];

let currentSlideIndex = 0;
let timerSeconds = 0;
let timerInterval = null;
let isTimerRunning = false;

function renderSlide(index) {
  const slide = slidesData[index];
  document.getElementById('slideContent').innerHTML = slide.render();
  document.getElementById('slideNumberBadge').textContent = slide.id;
  document.getElementById('navCurrentSlide').textContent = index + 1;
  document.getElementById('navTotalSlides').textContent = slidesData.length;
  document.getElementById('currentSlideTitle').textContent = slide.title;
  document.getElementById('noteScript').textContent = slide.script;
}

function nextSlide() {
  if (currentSlideIndex < slidesData.length - 1) {
    currentSlideIndex++;
    renderSlide(currentSlideIndex);
  }
}

function prevSlide() {
  if (currentSlideIndex > 0) {
    currentSlideIndex--;
    renderSlide(currentSlideIndex);
  }
}

function togglePresenterNotes() {
  document.getElementById('speakerNotesDrawer').classList.toggle('translate-x-full');
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
  }
}

function toggleTimer() {
  const btn = document.getElementById('btnTimerToggle');
  if (isTimerRunning) {
    clearInterval(timerInterval);
    isTimerRunning = false;
    btn.textContent = 'Reanudar';
    btn.classList.replace('bg-agri-alert', 'bg-slate-800');
  } else {
    isTimerRunning = true;
    btn.textContent = 'Pausar';
    btn.classList.replace('bg-slate-800', 'bg-agri-alert');
    timerInterval = setInterval(() => {
      timerSeconds++;
      const mins = Math.floor(timerSeconds / 60);
      const secs = timerSeconds % 60;
      document.getElementById('timerDisplay').textContent = 
        `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  isTimerRunning = false;
  timerSeconds = 0;
  document.getElementById('timerDisplay').textContent = '00:00';
  document.getElementById('btnTimerToggle').textContent = 'Iniciar';
  document.getElementById('btnTimerToggle').classList.replace('bg-agri-alert', 'bg-slate-800');
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
  if (e.key === 'ArrowLeft') prevSlide();
});

window.onload = () => renderSlide(0);