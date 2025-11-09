document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ script.js loaded successfully");

  const symptoms = [
    'fever', 'headache', 'nausea', 'vomiting', 'fatigue',
    'joint_pain', 'skin_rash', 'cough', 'weight_loss', 'yellow_eyes'
  ];

  const inputsDiv = document.getElementById('inputs');
  symptoms.forEach(name => {
    const row = document.createElement('div');
    row.className = 'row';
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = name.replace('_', ' ');
    const select = document.createElement('select');
    select.name = name;
    select.innerHTML = '<option value="0">No</option><option value="1">Yes</option>';
    row.appendChild(label);
    row.appendChild(select);
    inputsDiv.appendChild(row);
  });

  const form = document.getElementById('predict-form');
  const overlay = document.getElementById('loader-overlay');
  const statusText = document.getElementById('status');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    overlay.classList.remove('hidden');
    statusText.textContent = "Status: Analyzing...";

    const formData = new FormData(form);

    fetch('/predict_ajax', { method: 'POST', body: formData })
      .then(res => res.json())
      .then(data => {
        overlay.classList.add('hidden');
        showPrediction(data.result);
        statusText.textContent = "Status: Completed ✅";
      })
      .catch(err => {
        overlay.classList.add('hidden');
        showPrediction("Error: " + err.message);
        statusText.textContent = "Status: Failed ❌";
      });
  });

  // Smooth fade-in prediction text
  window.showPrediction = function(result) {
    const resultText = document.getElementById('result-text');
    resultText.textContent = "Prediction: " + result;
    resultText.classList.remove('visible');
    setTimeout(() => resultText.classList.add('visible'), 50);
  };

  // === 3D Scene Setup ===
  const canvas = document.getElementById("bgCanvas");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
  renderer.setSize(360, 360);
  camera.position.z = 3;

  // === Lighting ===
  const ambient = new THREE.AmbientLight(0x00ffff, 0.6);
  scene.add(ambient);
  const point = new THREE.PointLight(0x00bfff, 1);
  point.position.set(0, 0, 0);
  scene.add(point);

  // === Load Anatomy Image as 3D Plane ===
  const textureLoader = new THREE.TextureLoader();
  const anatomyTexture = textureLoader.load("/static/images/hologram.png"); // ✅ CORRECT PATH (forward slashes)
  const planeGeometry = new THREE.PlaneGeometry(5, 5);
  const planeMaterial = new THREE.MeshStandardMaterial({
    map: anatomyTexture,
    transparent: true,
    opacity: 100,
    side: THREE.DoubleSide
  });
  const anatomyPlane = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(anatomyPlane);

  // === Animation ===
  function animate() {
    requestAnimationFrame(animate);
    anatomyPlane.rotation.y += 0.003; // slow rotate
    anatomyPlane.rotation.x = Math.sin(Date.now() * 0.001) * 0.08; // breathing-like motion
    renderer.render(scene, camera);
  }
  animate();

  // === Handle Resizing ===
  window.addEventListener('resize', () => {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  });
});
