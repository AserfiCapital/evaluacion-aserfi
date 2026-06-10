// ════════════════════════════════════════════════════════════════════
//  index.html
//  Panel de control de solicitudes
//  
//  INSTRUCCIONES DE INSTALACIÓN:
//  1. Abre Google Sheets en tu cuenta de Google
//  2. Crea una hoja nueva (o usa una existente)
//  3. Menú superior → Extensiones → Apps Script
//  4. Borra el código que aparece y pega TODO este archivo
//  5. Cambia SHEET_ID abajo por el ID de tu hoja de Google Sheets
//     (el ID está en la URL: docs.google.com/spreadsheets/d/[ESTE_ID]/edit)
//  6. Haz clic en Guardar (ícono de disco)
//  7. Menú → Implementar → Nueva implementación
//     - Tipo: Aplicación web
//     - Ejecutar como: Yo (tu cuenta de Google)
//     - Acceso: Cualquier usuario
//  8. Copia la URL que te da — esa es tu WEBHOOK_URL
//  9. En el archivo HTML de la evaluación, reemplaza la URL de formsubmit
//     por tu WEBHOOK_URL en la función submitForm()
// ════════════════════════════════════════════════════════════════════

const SHEET_ID = '1lM8ef401Vv93vJQiFiw6LlSZFXSgMwrOZIK5MQ6MpLw';
const SHEET_NAME = 'Solicitudes';
const NOTIFY_EMAIL = 'administracion@aserficapital.com';

// Columnas del panel
const COLUMNS = [
  'Fecha',
  'ID Solicitud',
  'Nombre / Razón Social',
  'Tipo Persona',
  'Estado',
  'Sector',
  'Tipo Fondeo',
  'Monto Solicitado',
  'Giro / Actividad',
  'Años Operando',
  'RFC Activo',
  'SAT al Corriente',
  'Ingresos Anuales',
  'Estados Financieros',
  'Declaraciones Fiscales',
  'Tipo Garantía',
  'Aval',
  'Nombre Aval',
  'Historial Crediticio',
  'Buró',
  // Crédito Simple
  'Destino Crédito',
  'Plazo Deseado',
  'Créditos Activos',
  // Crédito Puente
  'Nombre Proyecto',
  'Valor Proyecto',
  'Permisos',
  'Preventas',
  // Arrendamiento
  'Tipo Equipo',
  'Valor Equipo',
  // Contacto
  'Nombre Contacto',
  'Cargo',
  'Teléfono',
  'Email',
  'Vía Contacto',
  // Control interno
  'Estatus',
  'Analista Asignado',
  'Notas Internas',
  'Fecha Primer Contacto',
  'Archivos Recibidos',
];

// ── RECIBIR SOLICITUD (POST desde el formulario) ──────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Crear hoja si no existe
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(COLUMNS);
      formatHeader(sheet);
    }

    // Generar ID único
    const lastRow = sheet.getLastRow();
    const solicitudId = 'ASF-' + String(lastRow).padStart(4, '0');

    // Armar fila
    const row = [
      data.fecha || new Date().toLocaleString('es-MX'),
      solicitudId,
      data.nombre || '',
      data.tipo_persona || '',
      data.estado || '',
      data.sector || '',
      data.tipo_fondeo || '',
      data.monto || '',
      data.giro || '',
      data.anos_operacion || '',
      data.rfc_activo || '',
      data.sat || '',
      data.ingresos || '',
      data.eeff || '',
      data.declaraciones || '',
      data.garantia || '',
      data.aval || '',
      data.aval_nombre || '',
      data.historial || '',
      data.buro || '',
      data.destino || '',
      data.plazo || '',
      data.creditos_act || '',
      data.proy_nombre || '',
      data.proy_valor || '',
      data.permisos || '',
      data.preventas || '',
      data.equipo_tipo || '',
      data.equipo_valor || '',
      data.contacto_nombre || '',
      data.cargo || '',
      data.telefono || '',
      data.email_contacto || '',
      data.contacto_via || '',
      '🟡 Nueva',       // Estatus inicial
      '',               // Analista
      '',               // Notas
      '',               // Fecha primer contacto
      'Pendiente',      // Archivos
    ];

    sheet.appendRow(row);
    formatNewRow(sheet, sheet.getLastRow());

    // Enviar notificación por correo
    sendNotificationEmail(data, solicitudId);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, id: solicitudId }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── ENVIAR CORREO DE NOTIFICACIÓN ─────────────────────────────────────────
function sendNotificationEmail(data, solicitudId) {
  const fondeoLabel = {
    simple: 'Crédito Simple',
    puente: 'Crédito Puente',
    arrendamiento: 'Arrendamiento'
  }[data.tipo_fondeo] || data.tipo_fondeo;

  const personaLabel = data.tipo_persona === 'moral' ? 'Persona Moral' : 'Persona Física';

  const htmlBody = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
    <div style="background:#132040;padding:20px 24px;border-bottom:3px solid #2e5fa3">
      <h2 style="color:#fff;margin:0;font-size:18px">🔔 Nueva solicitud — ASERFI Capital</h2>
      <p style="color:rgba(255,255,255,.6);margin:4px 0 0;font-size:13px">ID: <strong style="color:#fff">${solicitudId}</strong></p>
    </div>
    <div style="padding:24px;background:#f8f9fb">
      <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
        <tr style="background:#e8ecf4">
          <td colspan="2" style="padding:10px 14px;font-weight:700;color:#132040;font-size:13px;text-transform:uppercase;letter-spacing:.05em">Datos del solicitante</td>
        </tr>
        <tr><td style="padding:8px 14px;color:#5a6278;font-size:13px;width:40%">Nombre / Razón Social</td><td style="padding:8px 14px;font-weight:600;color:#132040;font-size:13px">${data.nombre || '—'}</td></tr>
        <tr style="background:#f8f9fb"><td style="padding:8px 14px;color:#5a6278;font-size:13px">Tipo de persona</td><td style="padding:8px 14px;font-size:13px">${personaLabel}</td></tr>
        <tr><td style="padding:8px 14px;color:#5a6278;font-size:13px">Estado</td><td style="padding:8px 14px;font-size:13px">${data.estado || '—'}</td></tr>
        <tr style="background:#f8f9fb"><td style="padding:8px 14px;color:#5a6278;font-size:13px">Sector</td><td style="padding:8px 14px;font-size:13px">${data.sector || '—'}</td></tr>
        <tr style="background:#e8ecf4">
          <td colspan="2" style="padding:10px 14px;font-weight:700;color:#132040;font-size:13px;text-transform:uppercase;letter-spacing:.05em">Financiamiento solicitado</td>
        </tr>
        <tr><td style="padding:8px 14px;color:#5a6278;font-size:13px">Tipo de fondeo</td><td style="padding:8px 14px;font-weight:600;color:#2e5fa3;font-size:13px">${fondeoLabel}</td></tr>
        <tr style="background:#f8f9fb"><td style="padding:8px 14px;color:#5a6278;font-size:13px">Monto solicitado</td><td style="padding:8px 14px;font-size:13px">${data.monto || '—'}</td></tr>
        <tr><td style="padding:8px 14px;color:#5a6278;font-size:13px">Años operando</td><td style="padding:8px 14px;font-size:13px">${data.anos_operacion || '—'}</td></tr>
        <tr style="background:#f8f9fb"><td style="padding:8px 14px;color:#5a6278;font-size:13px">Ingresos anuales</td><td style="padding:8px 14px;font-size:13px">${data.ingresos || '—'}</td></tr>
        <tr style="background:#e8ecf4">
          <td colspan="2" style="padding:10px 14px;font-weight:700;color:#132040;font-size:13px;text-transform:uppercase;letter-spacing:.05em">Contacto</td>
        </tr>
        <tr><td style="padding:8px 14px;color:#5a6278;font-size:13px">Nombre</td><td style="padding:8px 14px;font-size:13px">${data.contacto_nombre || '—'}</td></tr>
        <tr style="background:#f8f9fb"><td style="padding:8px 14px;color:#5a6278;font-size:13px">Teléfono</td><td style="padding:8px 14px;font-size:13px">${data.telefono || '—'}</td></tr>
        <tr><td style="padding:8px 14px;color:#5a6278;font-size:13px">Email</td><td style="padding:8px 14px;font-size:13px">${data.email_contacto || '—'}</td></tr>
        <tr style="background:#f8f9fb"><td style="padding:8px 14px;color:#5a6278;font-size:13px">Preferencia contacto</td><td style="padding:8px 14px;font-size:13px">${data.contacto_via || '—'}</td></tr>
      </table>
      <div style="margin-top:20px;padding:14px;background:#dce8f8;border-radius:8px;font-size:13px;color:#1e2f5a">
        <strong>Próximo paso:</strong> Revisar la solicitud en Google Sheets y asignar analista.<br>
        El solicitante enviará sus documentos a <strong>administracion@aserficapital.com</strong>.
      </div>
    </div>
    <div style="padding:12px 24px;background:#132040;font-size:11px;color:rgba(255,255,255,.5);text-align:center">
      ASERFI Capital · administracion@aserficapital.com · www.aserfi.mx
    </div>
  </div>`;

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: `🔔 Nueva solicitud [${solicitudId}] — ${data.nombre || 'Sin nombre'} — ${fondeoLabel}`,
    htmlBody: htmlBody
  });
}

// ── FORMATO HEADER ─────────────────────────────────────────────────────────
function formatHeader(sheet) {
  const header = sheet.getRange(1, 1, 1, COLUMNS.length);
  header.setBackground('#132040');
  header.setFontColor('#ffffff');
  header.setFontWeight('bold');
  header.setFontSize(10);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(3);
  // Ajustar anchos
  sheet.setColumnWidth(1, 140); // Fecha
  sheet.setColumnWidth(2, 90);  // ID
  sheet.setColumnWidth(3, 200); // Nombre
  sheet.setColumnWidth(35, 130); // Estatus
  sheet.setColumnWidth(36, 140); // Analista
  sheet.setColumnWidth(37, 200); // Notas
}

// ── FORMATO FILA NUEVA ─────────────────────────────────────────────────────
function formatNewRow(sheet, rowNum) {
  const row = sheet.getRange(rowNum, 1, 1, COLUMNS.length);
  const bg = rowNum % 2 === 0 ? '#f0f2f6' : '#ffffff';
  row.setBackground(bg);
  // Color de la celda de estatus
  const statusCell = sheet.getRange(rowNum, 35);
  statusCell.setBackground('#fdf6e3');
  statusCell.setFontColor('#7a5800');
  statusCell.setFontWeight('bold');
}

// ── MENÚ PERSONALIZADO EN EL SHEET ────────────────────────────────────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🏦 ASERFI')
    .addItem('Marcar seleccionada como En Revisión', 'setEnRevision')
    .addItem('Marcar seleccionada como Aprobada', 'setAprobada')
    .addItem('Marcar seleccionada como Rechazada', 'setRechazada')
    .addItem('Marcar seleccionada como Documentos Completos', 'setDocCompletos')
    .addSeparator()
    .addItem('Formatear encabezado', 'setupHeader')
    .addToUi();
}

function setEnRevision() { setStatus('🔵 En Revisión', '#dce8f8', '#1e2f5a'); }
function setAprobada()   { setStatus('🟢 Aprobada', '#e6f4ec', '#1a6b3c'); }
function setRechazada()  { setStatus('🔴 Rechazada', '#fdf0f0', '#8b1f1f'); }
function setDocCompletos(){ setStatus('✅ Docs Completos', '#e6f4ec', '#1a6b3c'); }

function setStatus(label, bg, fg) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const row = sheet.getActiveRange().getRow();
  if (row <= 1) { SpreadsheetApp.getUi().alert('Selecciona una fila de solicitud (no el encabezado).'); return; }
  const cell = sheet.getRange(row, 35);
  cell.setValue(label);
  cell.setBackground(bg);
  cell.setFontColor(fg);
  cell.setFontWeight('bold');
}

function setupHeader() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  // Verificar que tenga encabezados, si no crearlos
  if (sheet.getRange(1,1).getValue() !== 'Fecha') {
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]);
  }
  formatHeader(sheet);
  SpreadsheetApp.getUi().alert('✓ Encabezado formateado correctamente.');
}
