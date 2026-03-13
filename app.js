// ==================== MINERVA 1003 - APP.JS (Diseño fiel) ====================
(function () {
  'use strict';

  const STORAGE_KEY = 'minerva1003_v2';

  // -------- FOTO --------
  const photoInput = document.getElementById('ph-input');
  const photoPreview = document.getElementById('ph-img');
  const photoPh = document.getElementById('ph-txt');

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
    const form = document.getElementById('f');
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
    // Firma
    if (signPreview && signPreview.src && signPreview.src.startsWith('data:')) {
      data['__firma'] = signPreview.src;
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

    const form = document.getElementById('f');

    Object.entries(data).forEach(([key, val]) => {
      if (key === '__photo') {
        if (photoPreview) {
          photoPreview.src = val;
          photoPreview.style.display = 'block';
        }
        if (photoPh) photoPh.style.display = 'none';
        return;
      }
      if (key === '__firma') {
        if (signPreview) {
          signPreview.src = val;
          signPreview.style.display = 'block';
        }
        if (signPh) signPh.style.display = 'none';
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
    document.getElementById('f').reset();
    if (photoPreview) { photoPreview.src = ''; photoPreview.style.display = 'none'; }
    if (photoPh) photoPh.style.display = 'flex';
    if (signPreview) { signPreview.src = ''; signPreview.style.display = 'none'; }
    if (signPh) signPh.style.display = 'block';
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
  const form = document.getElementById('f');
  if (form) {
    form.addEventListener('input', debounce(guardar, 800));
    form.addEventListener('change', debounce(guardar, 400));
  }

  // -------- DOCUMENT NUMBER AUTO-FOCUS --------
  const charboxes = document.querySelectorAll('.charbox input');
  charboxes.forEach((cb, i) => {
    // Para forzar que sólo haya 1 carácter numérico
    cb.addEventListener('input', function(e) {
      // Eliminar todo lo que no sea número
      let val = this.value.replace(/\\D/g, '');
      this.value = val;
      
      if (val.length > 1) {
        // Dejar sólo el primer carácter en esta casilla
        this.value = val.charAt(0);
        // Si hay más caracteres y no es la última casilla, pasarlos a la siguiente
        if (i < charboxes.length - 1) {
          charboxes[i + 1].focus();
          charboxes[i + 1].value = val.substring(1);
          charboxes[i + 1].dispatchEvent(new Event('input', { bubbles: true }));
        }
      } else if (val.length === 1 && i < charboxes.length - 1) {
        // Si es 1 carácter, pasar foco a la siguiente
        charboxes[i + 1].focus();
      }
    });
    
    cb.addEventListener('keydown', function(e) {
      // Prevenir letras o símbolos desde el teclado, permitiendo borrar y moverse
      if (!/^[0-9]$/i.test(e.key) && !['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'].includes(e.key)) {
         e.preventDefault();
      }
      
      // Volver a la casilla anterior si se presiona borrar y está vacía
      if (e.key === 'Backspace' && this.value === '' && i > 0) {
        charboxes[i - 1].focus();
        charboxes[i - 1].value = ''; // Borrar el de atrás visualmente
      }
    });
    
    // Pegar texto largo de sólo números
    cb.addEventListener('paste', function(e) {
      e.preventDefault();
      // Filtrar para que sólo queden números
      const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\\D/g, '');
      if (!text) return;
      this.value = text;
      this.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });

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

  // -------- FIRMA (CANVAS) --------
  const sigModal = document.getElementById('sig-modal');
  const canvas = document.getElementById('sig-canvas');
  const signPreview = document.getElementById('sign-img');
  const signPh = document.getElementById('sign-placeholder');
  let ctx, isDrawing = false;

  if (canvas) {
    ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000033'; // Tinta azul oscuro

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function startDraw(e) {
      if (e.cancelable) e.preventDefault();
      isDrawing = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }

    function draw(e) {
      if (!isDrawing) return;
      if (e.cancelable) e.preventDefault();
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    function endDraw() {
      isDrawing = false;
      ctx.closePath();
    }

    // Mouse events
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseout', endDraw);

    // Touch events for mobile
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', endDraw);
  }

  window.abrirFirma = function() {
    if (sigModal) {
      sigModal.style.display = 'flex';
      // Ajustar width al contenedor actual si es móvil
      const box = sigModal.querySelector('.signature-box');
      if (box) {
        let w = box.clientWidth - 32; // padding
        if (w > 400) w = 400;
        if (canvas.width !== w) {
          // Si cambia el tamaño, guardar la imagen actual y redibujarla para no perderla
          const tempImg = new Image();
          tempImg.src = canvas.toDataURL();
          canvas.width = w;
          ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#000033';
          tempImg.onload = () => ctx.drawImage(tempImg, 0, 0);
        }
      }
    }
  };

  window.cerrarFirma = function() {
    if (sigModal) sigModal.style.display = 'none';
  };

  window.limpiarFirma = function() {
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  window.guardarFirma = function() {
    // Verificar si el canvas está vacío no es trivial, pero asumimos que si se da guardar es porque dibujó
    const dataUrl = canvas.toDataURL('image/png');
    if (signPreview) {
      signPreview.src = dataUrl;
      signPreview.style.display = 'block';
    }
    if (signPh) signPh.style.display = 'none';
    cerrarFirma();
    guardar(); // Guardar en localStorage
    mostrarMensaje('Firma aplicada');
  };

  // -------- INIT --------
  cargarDatos();

})();
