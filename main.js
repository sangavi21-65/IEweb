// ===== Mobile menu =====
const menuBtn = document.getElementById('menuBtn');
const mobile = document.getElementById('mobile');

menuBtn?.addEventListener('click', () => {
  const open = mobile.style.display === 'block';
  mobile.style.display = open ? 'none' : 'block';
  if (!open) {
    mobile.innerHTML = `
      <div class="container">
        <a href="#services">Services</a>
        <a href="#work">Work</a>
        <a href="#stack">Stack</a>
        <a href="#contact">Contact</a>
      </div>`;
  }
  menuBtn.setAttribute('aria-expanded', (!open).toString());
});

// ===== Smooth scroll for internal links =====
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const id=a.getAttribute('href');
    if(id && id.length>1){
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({behavior:'smooth',block:'start'});
      if (mobile) mobile.style.display='none';
    }
  });
});

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Fade-in on scroll =====
const io = new IntersectionObserver((entries)=>{
  entries.forEach(el=>{
    if(el.isIntersecting){el.target.style.transform='translateY(0)';el.target.style.opacity='1'}
  });
},{threshold:.12});
document.querySelectorAll('.fade-in').forEach(c=>io.observe(c));

// ===== Three.js Scene (3D Website Hero) =====
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
const stage = canvas.parentElement;
const dpr = Math.min(window.devicePixelRatio || 1, 2);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 80);
camera.position.set(3, 2, 4);

// Resize handler
function resize(){
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setPixelRatio(dpr);
  renderer.setSize(w, h, false);
  camera.aspect = w / h; 
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.55));
const p1 = new THREE.PointLight(0xffffff, 26); p1.position.set(4,4,4); scene.add(p1);
const p2 = new THREE.PointLight(0x9b87f5, 12); p2.position.set(-4,-2,-3); scene.add(p2);

// Icosahedron
const geo = new THREE.IcosahedronGeometry(1.4, 0);
const mat = new THREE.MeshStandardMaterial({metalness:0.72, roughness:0.26, color:0x60a5fa});
const ico = new THREE.Mesh(geo, mat);

// Wireframe overlay
const wire = new THREE.LineSegments(
  new THREE.WireframeGeometry(geo),
  new THREE.LineBasicMaterial({ color:0xffffff, transparent:true, opacity:0.15 })
);
ico.add(wire);

// Group for subtle bob + rotation
const group = new THREE.Group();
group.add(ico);
scene.add(group);

// Starfield particles for depth
const starCount = 900;
const positions = new Float32Array(starCount * 3);
for(let i=0;i<starCount;i++){
  const r = 12 + Math.random()*12;
  const theta = Math.random()*Math.PI*2;
  const phi = Math.acos(2*Math.random()-1);
  positions[i*3+0] = r * Math.sin(phi) * Math.cos(theta);
  positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
  positions[i*3+2] = r * Math.cos(phi);
}
const starsGeo = new THREE.BufferGeometry();
starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const starsMat = new THREE.PointsMaterial({ size:0.02, color:0x9fb7ff, transparent:true, opacity:0.8, depthWrite:false });
const stars = new THREE.Points(starsGeo, starsMat);
scene.add(stars);

// Drag-to-orbit interaction (no external controls)
let isDown = false, startX=0, startY=0, rotY=0, rotX=0;
const ROT_SPEED = 0.005;
canvas.addEventListener('pointerdown',(e)=>{ isDown=true; startX=e.clientX; startY=e.clientY; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove',(e)=>{
  if(!isDown) return;
  const dx = e.clientX - startX; const dy = e.clientY - startY;
  rotY = dx * ROT_SPEED;
  rotX = dy * ROT_SPEED;
});
canvas.addEventListener('pointerup',()=>{ isDown=false; });
canvas.addEventListener('pointerleave',()=>{ isDown=false; });

// Parallax with mouse
let mouseX=0, mouseY=0;
window.addEventListener('mousemove', (e)=>{
  const rect = stage.getBoundingClientRect();
  mouseX = ((e.clientX - rect.left) / rect.width) - 0.5;
  mouseY = ((e.clientY - rect.top) / rect.height) - 0.5;
});

// Animate
let t = 0;
const clock = new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const dt = clock.getDelta(); t += dt;

  // Idle rotation + bob
  group.rotation.y += 0.35 * dt + rotY;
  group.rotation.x += 0.22 * dt + rotX;
  rotX *= 0.92; rotY *= 0.92; // inertia
  group.position.y = Math.sin(t * 1.2) * 0.06;

  // Subtle camera parallax
  camera.position.x = 3 + mouseX * 0.6;
  camera.position.y = 2 - mouseY * 0.4;
  camera.lookAt(0, 0, 0);

  // Stars slow spin
  stars.rotation.y += 0.02 * dt;

  renderer.render(scene, camera);
}

// Init
resize();
animate();

// ===== Simple client-side form handler (replace with real endpoint) =====
const form = document.getElementById('contactForm');
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  console.log('Form submission', data);
  alert('Thanks! Your inquiry has been captured locally. Hook this form to your backend or a service like Formspree/Resend.');
  form.reset();
});
