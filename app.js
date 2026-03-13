// ==================== MINERVA 1003 - APP.JS (Diseño fiel) ====================
(function () {
  'use strict';

  const STORAGE_KEY = 'minerva1003_v2';

  // -------- FOTO --------
  const photoInput = document.getElementById('photo-input');
  const photoPreview = document.getElementById('photo-preview');
  const photoPh = document.getElementById('photo-ph');

  if (photoInput) {
    photoInput.addEventListener('change', function () {
      const file = this.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        photoPreview.src = e.target.result;
        photoPreview.style.display = 'block';
        if (photoPh) photoPh.style.display = 'none';
        guardar();
      };
      reader.readAsDataURL(file);
    });
  }

  // -------- GUARDAR --------
  window.guardar = function () {
    const form = document.getElementById('minerva-form');
    if (!form) return;
    const data = {};

    // Texto / número / fecha / select / textarea
    form.querySelectorAll('input:not([type=file]):not([type=radio]):not([type=checkbox]), select, textarea').forEach(el => {
      if (el.name) data[el.name] = el.value;
    });
    // Radio
    form.querySelectorAll('input[type=radio]:checked').forEach(el => {
      data[el.name] = el.value;
    });
    // Checkbox
    form.querySelectorAll('input[type=checkbox]').forEach(el => {
      if (el.name) data[el.name] = el.checked;
    });
    // Foto
    if (photoPreview && photoPreview.src && photoPreview.src.startsWith('data:')) {
      data['__photo'] = photoPreview.src;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      mostrarMensaje('💾 Datos guardados');
    } catch (e) {
      mostrarMensaje('⚠️ No se pudo guardar (datos muy grandes)', true);
    }
  };

  // -------- CARGAR --------
  function cargarDatos() {
    let data;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      data = JSON.parse(raw);
    } catch (e) { return; }

    const form = document.getElementById('minerva-form');

    Object.entries(data).forEach(([key, val]) => {
      if (key === '__photo') {
        if (photoPreview) {
          photoPreview.src = val;
          photoPreview.style.display = 'block';
        }
        if (photoPh) photoPh.style.display = 'none';
        return;
      }
      // Radio inputs — can have multiple with same name
      const radios = form.querySelectorAll(`input[type=radio][name="${key}"]`);
      if (radios.length > 0) {
        radios.forEach(r => { r.checked = (r.value === val); });
        return;
      }
      const el = form.querySelector(`[name="${CSS.escape(key)}"]`);
      if (!el) return;
      if (el.type === 'checkbox') {
        el.checked = !!val;
      } else {
        el.value = val;
      }
    });
  }

  // -------- LIMPIAR --------
  window.limpiar = function () {
    if (!confirm('¿Desea borrar todos los datos del formulario?')) return;
    document.getElementById('minerva-form').reset();
    if (photoPreview) { photoPreview.src = ''; photoPreview.style.display = 'none'; }
    if (photoPh) photoPh.style.display = 'flex';
    localStorage.removeItem(STORAGE_KEY);
    mostrarMensaje('🗑 Formulario limpiado');
  };

  // -------- IMPRIMIR --------
  window.imprimir = function () {
    guardar();
    mostrarMensaje('🖨 Abriendo vista de impresión...');
    setTimeout(() => {
      try {
        window.focus();
        window.print();
      } catch (e) {
        mostrarMensaje('⌨️ Use Ctrl+P para imprimir', true);
      }
    }, 350);
  };

  // -------- AUTO-SAVE --------
  const form = document.getElementById('minerva-form');
  if (form) {
    form.addEventListener('input', debounce(guardar, 800));
    form.addEventListener('change', debounce(guardar, 400));
  }

  function debounce(fn, ms) {
    let t;
    return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  // -------- TOAST --------
  function mostrarMensaje(msg, esError) {
    let toast = document.getElementById('toast-msg');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-msg';
      toast.style.cssText = `
        position:fixed;bottom:20px;right:20px;z-index:9999;
        background:${esError ? '#b33' : '#1a6f3c'};color:#fff;
        padding:9px 18px;border-radius:6px;font-size:13px;font-family:Arial;
        box-shadow:0 3px 12px rgba(0,0,0,0.3);
        transition:opacity 0.4s;opacity:1;
      `;
      document.body.appendChild(toast);
    }
    toast.style.background = esError ? '#b33' : '#1a6f3c';
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
  }

  // -------- INIT --------
  cargarDatos();

})();
