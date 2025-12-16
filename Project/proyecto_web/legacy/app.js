// Datos de ejemplo: rutas con coordenadas (lat,lng)
const routes = [
  {
    id: 1, name: 'Ruta Centro - Norte', schedule: 'Lunes, Miércoles, Viernes - 06:00', coords: [
      [3.875, -77.076], [3.876, -77.075], [3.877, -77.074], [3.878, -77.073]
    ]
  },
  {
    id: 2, name: 'Ruta Sur - Este', schedule: 'Martes, Jueves - 07:30', coords: [
      [3.870, -77.080], [3.871, -77.079], [3.872, -77.078], [3.873, -77.077]
    ]
  }
];

// Contenido del proyecto 
const projectContent = {
  justificacion: `La ciudad de Buenaventura enfrenta problemas con la recolección de basura sólida, lo que impacta a la población directamente. La propuesta busca optimizar la comunicación entre ciudadanos y empresa de aseo mediante una app.`,
  objetivos: [
    'Crear una aplicación móvil con información actualizada de rutas y horarios.',
    'Implementar notificaciones en tiempo real.',
    'Agregar geolocalización y reporte ciudadano con fotos.'
  ],
  cronograma: [
    { fase: 'Detección y recolección de datos', duracion: '2 semanas' },
    { fase: 'Desarrollo', duracion: '8 semanas' },
    { fase: 'Prueba piloto', duracion: '4 semanas' }
  ],
  presupuesto: [
    { concepto: 'Desarrollo y diseño', costo: '3.000.000 COP' },
    { concepto: 'Infraestructura y hosting', costo: '1.000.000 COP' },
    { concepto: 'Pruebas y mantenimiento', costo: '500.000 COP' }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar mapas
  const map = L.map('map').setView([3.875, -77.076], 14);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

  // Report map (pin draggable)
  const rmap = L.map('reportMap').setView([3.875, -77.076], 15);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(rmap);
  const reportMarker = L.marker([3.875, -77.076], { draggable: true }).addTo(rmap);

  // Mostrar rutas en lista
  const routesList = document.getElementById('routesList');
  let selectedRoute = null;
  let simInterval = null;
  let simMarker = null;
  let simPolyline = null;
  routes.forEach(r => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.textContent = `${r.name} — ${r.schedule}`;
    li.onclick = () => selectRoute(r);
    routesList.appendChild(li);
  });

  function selectRoute(r) {
    selectedRoute = r;
    document.getElementById('routeTitle').textContent = r.name;
    document.getElementById('routeSchedule').textContent = r.schedule;
    document.getElementById('startSim').disabled = false;
    // draw polyline
    if (simPolyline) map.removeLayer(simPolyline);
    simPolyline = L.polyline(r.coords, { color: '#0d6efd' }).addTo(map);
    map.fitBounds(simPolyline.getBounds(), { padding: [20, 20] });
    if (simMarker) { map.removeLayer(simMarker); simMarker = null; }
  }

  document.getElementById('startSim').onclick = () => {
    if (!selectedRoute) return;
    startSimulation(selectedRoute);
    document.getElementById('startSim').disabled = true;
    document.getElementById('stopSim').disabled = false;
  };
  document.getElementById('stopSim').onclick = () => {
    stopSimulation();
    document.getElementById('startSim').disabled = false;
    document.getElementById('stopSim').disabled = true;
  };

  function startSimulation(route) {
    let idx = 0;
    if (simMarker) map.removeLayer(simMarker);
    simMarker = L.marker(route.coords[0], { icon: L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/1995/1995574.png', iconSize: [34, 34] }) }).addTo(map);
    simInterval = setInterval(() => {
      idx++;
      if (idx >= route.coords.length) idx = 0; // loop
      simMarker.setLatLng(route.coords[idx]);
      // Si el marker está cerca del centro del mapa (simulación), mostrar notificación
      const center = map.getCenter();
      const dist = map.distance(route.coords[idx], center);
      if (dist < 400) {
        pushNotification(`El camión de ${route.name} está cerca (~${Math.round(dist)} m).`);
      }
    }, 2000);
  }
  function stopSimulation() {
    if (simInterval) clearInterval(simInterval);
    simInterval = null;
    if (simMarker) { map.removeLayer(simMarker); simMarker = null; }
  }

  // Notificaciones (simple)
  const notifsDiv = document.getElementById('notifications');
  function pushNotification(text) {
    const el = document.createElement('div');
    el.className = 'alert alert-info alert-sm';
    el.textContent = text;
    notifsDiv.prepend(el);
    setTimeout(() => el.remove(), 7000);
  }

  // Reportes: guardar en localStorage como DB simulada
  const reportsKey = 'recoleccion_reports_v1';
  function loadReports() {
    const raw = localStorage.getItem(reportsKey);
    return raw ? JSON.parse(raw) : [];
  }
  function saveReports(list) {
    localStorage.setItem(reportsKey, JSON.stringify(list));
  }
  function renderReports() {
    const list = loadReports();
    const container = document.getElementById('reportsList');
    container.innerHTML = '';
    list.slice().reverse().forEach(r => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerHTML = `<div class="d-flex justify-content-between align-items-start">
        <div>
          <strong>${r.desc}</strong><br/><small>${r.date}</small><br/><small>Ubicación: ${r.lat.toFixed(5)}, ${r.lng.toFixed(5)}</small>
        </div>
        <div>`;
      if (r.photo) li.innerHTML += `<img class="report-thumb ms-2" src="${r.photo}">`;
      li.innerHTML += `</div></div>`;
      container.appendChild(li);
    });
  }
  renderReports();

  document.getElementById('reportForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const desc = document.getElementById('desc').value;
    const fileInput = document.getElementById('photo');
    let dataUrl = null;
    if (fileInput.files && fileInput.files[0]) {
      dataUrl = await fileToDataURL(fileInput.files[0]);
    }
    const pos = reportMarker.getLatLng();
    const report = { desc, photo: dataUrl, lat: pos.lat, lng: pos.lng, date: new Date().toLocaleString() };
    const list = loadReports();
    list.push(report);
    saveReports(list);
    renderReports();
    document.getElementById('reportForm').reset();
    pushNotification('Reporte enviado. Gracias por participar.');
  });

  function fileToDataURL(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }

  // Rellenar contenido del proyecto
  document.getElementById('justificacion').textContent = projectContent.justificacion;
  const objUl = document.getElementById('objetivos');
  projectContent.objetivos.forEach(o => {
    const li = document.createElement('li'); li.textContent = o; objUl.appendChild(li);
  });
  const cronDiv = document.getElementById('cronograma');
  let g = '<table class="table table-sm"><thead><tr><th>Fase</th><th>Duración</th></tr></thead><tbody>';
  projectContent.cronograma.forEach(c => g += `<tr><td>${c.fase}</td><td>${c.duracion}</td></tr>`);
  g += '</tbody></table>'; cronDiv.innerHTML = g;
  const presDiv = document.getElementById('presupuesto');
  let p = '<table class="table table-sm"><thead><tr><th>Concepto</th><th>Costo</th></tr></thead><tbody>';
  projectContent.presupuesto.forEach(item => p += `<tr><td>${item.concepto}</td><td>${item.costo}</td></tr>`);
  p += '</tbody></table>'; presDiv.innerHTML = p;

});
