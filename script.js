// 1) Modo oscuro (recuerda la elección)
const raiz = document.documentElement;
const btnTema = document.getElementById('tema-btn');
function aplicarTema(t){
  raiz.dataset.theme = t;
  btnTema.textContent = t === 'dark' ? '☀️ Claro' : '🌙 Oscuro';
  btnTema.setAttribute('aria-pressed', t === 'dark');
}
let guardado = null;
try { guardado = localStorage.getItem('tema'); } catch(e){}
aplicarTema(guardado || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
btnTema.addEventListener('click', () => {
  const nuevo = raiz.dataset.theme === 'dark' ? 'light' : 'dark';
  aplicarTema(nuevo);
  try { localStorage.setItem('tema', nuevo); } catch(e){}
});

// 2) Menú móvil
const menuBtn = document.getElementById('menu-btn');
const menu = document.getElementById('menu');
menuBtn.addEventListener('click', () => {
  menuBtn.setAttribute('aria-expanded', menu.parentElement.classList.toggle('open'));
});

// 3) Contador animado de cifras (Inicio)
const cifras = document.querySelectorAll('[data-n]');
if (cifras.length) {
  const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = new Intl.NumberFormat('es-CO');
  const obs = new IntersectionObserver((items) => items.forEach(it => {
    if (!it.isIntersecting) return;
    const el = it.target, meta = +el.dataset.n, suf = el.dataset.suf || '';
    obs.unobserve(el);
    if (sinMovimiento) { el.textContent = fmt.format(meta) + suf; return; }
    const ini = performance.now();
    (function paso(t){
      const p = Math.min((t - ini) / 1500, 1);
      el.textContent = fmt.format(Math.round(meta * (1 - Math.pow(1 - p, 3)))) + suf;
      if (p < 1) requestAnimationFrame(paso);
    })(ini);
  }), { threshold: .5 });
  cifras.forEach(c => obs.observe(c));
}

// 4) Filtro de productos por categoría
const filtros = document.querySelectorAll('.filtros button');
filtros.forEach(b => b.addEventListener('click', () => {
  filtros.forEach(x => x.setAttribute('aria-pressed', x === b));
  document.querySelectorAll('[data-cat]').forEach(p => {
    p.hidden = b.dataset.filtro !== 'todo' && p.dataset.cat !== b.dataset.filtro;
  });
}));

// 5) Simulador de crédito (cuota fija mensual)
const monto = document.getElementById('monto');
if (monto) {
  const plazo = document.getElementById('plazo'), tipo = document.getElementById('tipo');
  const cop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  function calcular(){
    const P = +monto.value, n = +plazo.value, r = +tipo.value / 100;
    const cuota = P * r / (1 - Math.pow(1 + r, -n));
    document.getElementById('v-monto').textContent = cop.format(P);
    document.getElementById('v-plazo').textContent = n + ' meses';
    document.getElementById('r-cuota').textContent = cop.format(cuota);
    document.getElementById('r-total').textContent = cop.format(cuota * n);
    document.getElementById('r-int').textContent = cop.format(cuota * n - P);
  }
  [monto, plazo, tipo].forEach(c => c.addEventListener('input', calcular));
  calcular();
}

// 6) Validación del formulario de contacto
const form = document.getElementById('form-contacto');
if (form) {
  const reglas = {
    nombre: v => v.trim().length >= 3 || 'Escribe tu nombre completo (mínimo 3 letras).',
    documento: v => /^\d{6,12}$/.test(v.trim()) || 'Escribe solo números, entre 6 y 12 dígitos.',
    correo: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Escribe un correo válido, por ejemplo nombre@correo.com.',
    telefono: v => v === '' || /^[0-9+\s-]{7,15}$/.test(v) || 'Usa solo números, entre 7 y 15 dígitos.',
    mensaje: v => v.trim().length >= 10 || 'Cuéntanos un poco más (mínimo 10 caracteres).'
  };
  function validar(campo){
    const r = reglas[campo.name](campo.value);
    const ok = r === true;
    campo.classList.toggle('invalid', !ok);
    campo.setAttribute('aria-invalid', !ok);
    document.getElementById('err-' + campo.name).textContent = ok ? '' : r;
    return ok;
  }
  const campos = [...form.querySelectorAll('[name]')].filter(c => reglas[c.name]);
  campos.forEach(c => c.addEventListener('blur', () => validar(c)));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const todoOk = campos.map(validar).every(Boolean);
    const estado = document.getElementById('estado');
    if (todoOk) { estado.textContent = '¡Mensaje enviado! Un asesor te contactará en menos de 24 horas.'; form.reset(); }
    else { estado.textContent = ''; campos.find(c => c.classList.contains('invalid')).focus(); }
  });
}