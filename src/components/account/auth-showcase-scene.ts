import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { SHOWCASE_SLIDES } from '@/lib/auth-showcase-content';

/** One local PBR studio scene. Geometry, textures and listeners are released on unmount. */
export function createShowcaseScene(host: HTMLDivElement, reducedMotion: boolean) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, 0.045);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.8;
  room.dispose();
  pmrem.dispose();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
  camera.position.set(0, 0.7, 7.15);
  camera.lookAt(0, -0.05, 0);
  scene.add(new THREE.HemisphereLight(0xeaf2ff, 0x303545, 0.65));
  const key = new THREE.DirectionalLight(0xfff2e4, 3.2);
  key.position.set(-3.5, 5, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 15 });
  key.shadow.normalBias = 0.025;
  key.shadow.bias = -0.0001;
  key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xf5b37f, 2.5);
  rim.position.set(4, 2, -3);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xb6d6ff, 1.3);
  fill.position.set(2, 1, 5);
  scene.add(fill);
  const model = new THREE.Group();
  scene.add(model);
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];
  let disposed = false;
  let generation = 0;
  let entered = performance.now();
  let renderFrame = 0;
  let inView = true;
  let targetX = 0;
  let targetY = 0;
  let yaw = -0.3;
  let spinStart: number | null = null;
  let spinOffset = 0;
  let pointerDown: { x: number; y: number } | null = null;
  const pointer = host.parentElement;
  host.dataset.spin = 'idle';

  function material(color: string, metalness = 0, roughness = 0.4) {
    const value = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    materials.push(value);
    return value;
  }
  function physical(color: string, clearcoat = 0.8) {
    const value = new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.15,
      roughness: 0.17,
      clearcoat,
      clearcoatRoughness: 0.15,
    });
    materials.push(value);
    return value;
  }
  function mesh(geometry: THREE.BufferGeometry, mat: THREE.Material, parent = model) {
    geometries.push(geometry);
    const value = new THREE.Mesh(geometry, mat);
    value.castShadow = true;
    value.receiveShadow = true;
    parent.add(value);
    return value;
  }
  function box(
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    x = 0,
    y = 0,
    z = 0,
    parent = model,
  ) {
    const value = mesh(new RoundedBoxGeometry(w, h, d, 4, Math.min(0.075, d / 3)), mat, parent);
    value.position.set(x, y, z);
    return value;
  }
  function artwork(draw: (context: CanvasRenderingContext2D) => void, width = 1024, height = 640) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas unavailable');
    draw(context);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    textures.push(texture);
    return texture;
  }
  function surface(texture: THREE.Texture, lit = false) {
    const value = lit
      ? new THREE.MeshStandardMaterial({ map: texture, roughness: 0.6 })
      : new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
    materials.push(value);
    return value;
  }
  function courseTile(icon: string, x: number, y: number, z: number, size = 0.62) {
    const currentGeneration = generation;
    const tile = new THREE.Group();
    tile.position.set(x, y, z);
    tile.rotation.set(-0.1, -0.05, -0.1);
    model.add(tile);
    box(size, size, 0.11, physical('#f4f1eb'), 0, 0, 0, tile);
    const texture = new THREE.TextureLoader().load(`/course-icons/${icon}.svg`, () => {
      if (disposed || generation !== currentGeneration) {
        texture.dispose();
        return;
      }
      renderOnce();
    });
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.push(texture);
    const iconMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });
    materials.push(iconMaterial);
    const logo = mesh(new THREE.PlaneGeometry(size * 0.72, size * 0.72), iconMaterial, tile);
    logo.position.z = 0.061;
    logo.castShadow = false;
    return tile;
  }
  function pencil(x: number, y: number, z: number, accent: THREE.Material) {
    const group = new THREE.Group();
    model.add(group);
    group.position.set(x, y, z);
    group.rotation.z = -0.23;
    const body = mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.7, 6), accent, group);
    body.position.y = 0.1;
    const wood = mesh(new THREE.ConeGeometry(0.055, 0.2, 6), material('#d7ac79'), group);
    wood.position.y = -0.85;
    wood.rotation.z = Math.PI;
    const graphite = mesh(new THREE.ConeGeometry(0.022, 0.08, 6), material('#262a30'), group);
    graphite.position.y = -0.97;
    graphite.rotation.z = Math.PI;
    const ferrule = mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.16, 24),
      material('#d7b477', 0.9, 0.25),
      group,
    );
    ferrule.position.y = 0.91;
  }
  function notebook(accent: THREE.Material, open = false) {
    const paper = material('#f3eee3', 0, 0.85);
    const book = new THREE.Group();
    book.rotation.set(-0.04, 0.08, -0.09);
    model.add(book);
    if (open) {
      book.rotation.x = -0.23;
      book.position.y = -0.15;
      box(2.9, 1.9, 0.12, accent, 0, 0, -0.08, book);
      box(1.36, 1.78, 0.15, paper, -0.7, 0, 0.05, book);
      box(1.36, 1.78, 0.15, paper, 0.7, 0, 0.05, book);
      const notes = artwork((ctx) => {
        ctx.fillStyle = '#f7f2e8';
        ctx.fillRect(0, 0, 1024, 640);
        ctx.fillStyle = '#283344';
        ctx.font = '600 46px sans-serif';
        ctx.fillText('DevAtlas', 72, 95);
        ctx.strokeStyle = '#b6bdc5';
        ctx.lineWidth = 2;
        for (let i = 0; i < 9; i++) {
          ctx.beginPath();
          ctx.moveTo(72, 150 + i * 48);
          ctx.lineTo(i === 8 ? 650 : 950, 150 + i * 48);
          ctx.stroke();
        }
      });
      const page = mesh(new THREE.PlaneGeometry(1.29, 1.7), surface(notes, true), book);
      page.position.set(0.7, 0, 0.13);
      for (let i = 0; i < 6; i++)
        box(
          0.84 - i * 0.065,
          0.015,
          0.008,
          material('#a4aeb9'),
          -0.75,
          0.45 - i * 0.19,
          0.132,
          book,
        );
      box(0.035, 1.85, 0.035, material('#c2b7a4'), 0, 0, 0.15, book);
    } else {
      box(1.85, 2.15, 0.08, accent, 0, 0, -0.2, book);
      box(1.67, 2.02, 0.3, paper, 0.05, 0, 0, book);
      box(1.85, 2.15, 0.08, accent, 0, 0, 0.2, book);
      for (let i = 0; i < 14; i++)
        box(1.6, 0.008, 0.012, material('#cfc8bc'), 0.07, -1.015, -0.13 + i * 0.02, book);
      box(0.09, 2.18, 0.49, accent, -0.88, 0, 0, book);
      const cover = artwork(
        (ctx) => {
          ctx.fillStyle = '#b85f35';
          ctx.fillRect(0, 0, 768, 1024);
          ctx.strokeStyle = '#d58f64';
          ctx.lineWidth = 2;
          ctx.strokeRect(35, 35, 698, 954);
          ctx.fillStyle = '#fff0da';
          ctx.font = '600 65px sans-serif';
          ctx.fillText('DevAtlas', 65, 160);
          ctx.font = '24px monospace';
          ctx.fillStyle = '#e9bb96';
          ctx.fillText('01 / LEARNING', 65, 225);
          ctx.strokeStyle = '#e4b38d';
          ctx.lineWidth = 5;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(65, 800 + i * 40);
            ctx.lineTo(520 - i * 90, 800 + i * 40);
            ctx.stroke();
          }
        },
        768,
        1024,
      );
      const face = mesh(new THREE.PlaneGeometry(1.72, 2.02), surface(cover, true), book);
      face.position.set(0, 0, 0.245);
      const ribbon = box(0.12, 0.42, 0.025, material('#e0b46e'), 0.52, -1.12, 0.12, book);
      ribbon.rotation.z = -0.05;
    }
    pencil(1.4, -0.1, 0.4, material('#2f5264', 0.35));
  }
  function laptop(accent: THREE.Material, debug: boolean) {
    const silver = material('#a7b3bf', 0.92, 0.24);
    const dark = material('#141b25', 0.2, 0.34);
    box(3.0, 0.12, 1.72, silver, 0, -0.9, 0.6);
    box(2.82, 0.025, 1.48, material('#53606d', 0.8), 0, -0.825, 0.6);
    box(0.83, 0.012, 0.41, material('#82909e', 0.8), 0, -0.802, 1.12);
    for (let row = 0; row < 4; row++)
      for (let column = 0; column < 12; column++)
        box(0.175, 0.024, 0.145, dark, -1.14 + column * 0.207, -0.795, 0.12 + row * 0.19);
    box(0.95, 0.02, 0.11, dark, 0, -0.795, 0.83);
    const screen = new THREE.Group();
    screen.position.set(0, -0.79, -0.12);
    screen.rotation.x = -0.12;
    model.add(screen);
    box(2.91, 1.88, 0.11, silver, 0, 0.94, 0, screen);
    box(2.78, 1.74, 0.025, dark, 0, 0.94, 0.067, screen);
    const screenTexture = artwork((ctx) => {
      ctx.fillStyle = '#101a29';
      ctx.fillRect(0, 0, 1024, 640);
      ctx.fillStyle = '#1c2a3c';
      ctx.fillRect(0, 0, 1024, 65);
      ctx.font = '20px monospace';
      ctx.fillStyle = '#b7c6d8';
      ctx.fillText('DevAtlas / practice.tsx', 35, 42);
      const lines = [
        'const Learning = () => {',
        '  return (',
        '    <main>',
        '      <h1>DevAtlas</h1>',
        '      <Practice />',
        '    </main>',
        '  );',
        '};',
      ];
      ctx.font = '27px monospace';
      lines.forEach((line, i) => {
        ctx.fillStyle = '#475a73';
        ctx.fillText(String(i + 1), 30, 118 + i * 49);
        ctx.fillStyle = i === 0 ? '#bba2ff' : i % 2 ? '#87c8d9' : '#e0ba87';
        ctx.fillText(line, 85, 118 + i * 49);
      });
      ctx.fillStyle = '#172b34';
      ctx.fillRect(0, 556, 1024, 84);
      ctx.font = '22px monospace';
      ctx.fillStyle = '#9ac8b1';
      ctx.fillText(debug ? 'TypeScript / diagnostics' : 'React / preview', 35, 605);
    });
    const display = mesh(new THREE.PlaneGeometry(2.65, 1.58), surface(screenTexture), screen);
    display.position.set(0, 0.94, 0.084);
    display.castShadow = false;
    const webcam = mesh(new THREE.SphereGeometry(0.018, 12, 10), dark, screen);
    webcam.position.set(0, 1.815, 0.083);
    if (debug) {
      const lens = new THREE.Group();
      lens.position.set(1.1, 0.02, 1.05);
      lens.rotation.z = -0.35;
      model.add(lens);
      mesh(new THREE.TorusGeometry(0.37, 0.055, 16, 64), accent, lens);
      const glass = new THREE.MeshPhysicalMaterial({
        color: '#b8dcea',
        transparent: true,
        opacity: 0.25,
        roughness: 0.05,
        metalness: 0.1,
        clearcoat: 1,
      });
      materials.push(glass);
      mesh(new THREE.CircleGeometry(0.32, 48), glass, lens);
      box(0.115, 0.6, 0.11, dark, 0, -0.62, 0, lens);
    }
  }
  function clear() {
    generation++;
    model.clear();
    geometries.splice(0).forEach((value) => value.dispose());
    materials.splice(0).forEach((value) => value.dispose());
    textures.splice(0).forEach((value) => value.dispose());
  }
  function setSlide(index: number) {
    if (disposed) return;
    clear();
    entered = performance.now();
    spinStart = null;
    spinOffset = 0;
    host.dataset.spin = 'idle';
    const slide = SHOWCASE_SLIDES[index];
    const accent = physical(slide.theme);
    const ivory = material('#e9e6de', 0.1, 0.38);
    const chrome = material('#d6c4a6', 0.95, 0.2);
    // Dark, low-profile studio plinth and real cast shadows ground the composition.
    box(3.8, 0.08, 2.85, material('#23313f', 0.4, 0.28), 0, -1.25, 0.2);
    if (index === 0 || index === 4) notebook(accent, index === 4);
    else if (index === 1 || index === 3) laptop(accent, index === 3);
    else if (index === 2) {
      const atom = new THREE.Group();
      atom.position.y = 0.05;
      atom.rotation.set(0.12, -0.1, 0.05);
      model.add(atom);
      mesh(new THREE.SphereGeometry(0.24, 40, 28), physical('#75d0e0'), atom);
      for (let i = 0; i < 3; i++) {
        const orbit = new THREE.Group();
        orbit.rotation.z = (i * Math.PI) / 3;
        orbit.rotation.y = 0.18;
        atom.add(orbit);
        const ring = mesh(new THREE.TorusGeometry(1.05, 0.04, 18, 100), accent, orbit);
        ring.scale.y = 0.4;
        const electron = mesh(new THREE.SphereGeometry(0.075, 20, 16), chrome, orbit);
        electron.position.set(0.77, 0.28, 0);
      }
    } else if (index === 5) {
      for (let i = 0; i < 3; i++) {
        const card = new THREE.Group();
        model.add(card);
        card.position.set(-0.62 + i * 0.62, -0.28 + i * 0.38, i * 0.22);
        card.rotation.z = -0.14 + i * 0.08;
        box(1.15, 1.65, 0.16, ivory, 0, 0, 0, card);
        mesh(new THREE.TorusGeometry(0.22, 0.028, 12, 48), accent, card).position.set(0, 0.35, 0.1);
        const first = box(0.07, 0.18, 0.03, accent, -0.06, 0.35, 0.13, card);
        first.rotation.z = 0.7;
        const second = box(0.07, 0.3, 0.03, accent, 0.06, 0.4, 0.13, card);
        second.rotation.z = -0.55;
        for (let j = 0; j < 3; j++)
          box(0.68 - j * 0.1, 0.025, 0.02, material('#a3adb7'), 0, -0.15 - j * 0.17, 0.1, card);
      }
    } else if (index === 6) {
      const tiles = [
        ['react', -0.85, 0.4, 0.15],
        ['ux-design', 0.6, 0.15, 0.6],
        ['english-foundations', -0.1, -0.65, 0.9],
      ] as const;
      tiles.forEach(([icon, x, y, z]) => courseTile(icon, x, y, z, 1.08));
    } else {
      const clock = new THREE.Group();
      clock.position.set(-0.25, 0.02, 0.18);
      model.add(clock);
      mesh(new THREE.TorusGeometry(0.92, 0.1, 20, 96), chrome, clock);
      const face = mesh(new THREE.CylinderGeometry(0.86, 0.86, 0.12, 80), ivory, clock);
      face.rotation.x = Math.PI / 2;
      for (let i = 0; i < 12; i++) {
        const tick = box(
          0.035,
          i % 3 === 0 ? 0.13 : 0.07,
          0.02,
          material('#5d6c77'),
          Math.sin((i * Math.PI) / 6) * 0.72,
          Math.cos((i * Math.PI) / 6) * 0.72,
          0.08,
          clock,
        );
        tick.rotation.z = (-i * Math.PI) / 6;
      }
      const hour = box(0.055, 0.42, 0.03, material('#283747'), -0.12, 0.15, 0.11, clock);
      hour.rotation.z = 0.6;
      const minute = box(0.035, 0.61, 0.035, accent, 0.18, 0.22, 0.14, clock);
      minute.rotation.z = -0.65;
      mesh(new THREE.SphereGeometry(0.065, 20, 16), chrome, clock).position.z = 0.15;
      box(0.5, 0.2, 0.46, chrome, 0, -1.05, 0, clock);
    }
    if (index !== 6) courseTile(slide.icon, 1.35, 0.95, 0.3);
    model.rotation.set(0.08, -0.3, 0);
    model.position.y = 0;
    model.scale.setScalar(1);
    renderOnce();
  }
  function renderOnce() {
    if (!disposed) renderer.render(scene, camera);
  }
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (width < 1 || height < 1) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderOnce();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  function inside(event: PointerEvent) {
    const bounds = host.getBoundingClientRect();
    return (
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom
    );
  }
  const raycaster = new THREE.Raycaster();
  const rayPointer = new THREE.Vector2();
  function hitsObject(event: PointerEvent) {
    const bounds = host.getBoundingClientRect();
    rayPointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    raycaster.setFromCamera(rayPointer, camera);
    return raycaster.intersectObjects(model.children, true).length > 0;
  }
  function spin() {
    if (disposed || reducedMotion || spinStart !== null) return;
    spinStart = performance.now();
    host.dataset.spin = 'running';
  }
  function onPointerMove(event: PointerEvent) {
    if (
      pointerDown &&
      Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) >= 9
    )
      pointerDown = null;
    if (!pointer || reducedMotion) return;
    const hover = inside(event);
    pointer.dataset.sceneHover = String(hover);
    const bounds = host.getBoundingClientRect();
    targetY = hover ? (event.clientX - bounds.left) / bounds.width - 0.5 : 0;
    targetX = hover ? (event.clientY - bounds.top) / bounds.height - 0.5 : 0;
  }
  function onPointerDown(event: PointerEvent) {
    pointerDown =
      inside(event) && event.button === 0 && !(event.target as Element).closest('button,a')
        ? { x: event.clientX, y: event.clientY }
        : null;
  }
  function onPointerUp(event: PointerEvent) {
    if (
      pointerDown &&
      inside(event) &&
      hitsObject(event) &&
      Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) < 9
    )
      spin();
    pointerDown = null;
  }
  function resetPointer() {
    targetX = 0;
    targetY = 0;
    pointerDown = null;
    if (pointer) delete pointer.dataset.sceneHover;
  }
  pointer?.addEventListener('pointermove', onPointerMove);
  pointer?.addEventListener('pointerdown', onPointerDown);
  pointer?.addEventListener('pointerup', onPointerUp);
  pointer?.addEventListener('pointercancel', resetPointer);
  pointer?.addEventListener('pointerleave', resetPointer);
  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
  });
  observer.observe(host);
  const animationStart = performance.now();
  function animate() {
    if (disposed) return;
    renderFrame = requestAnimationFrame(animate);
    if (!inView || document.hidden || host.clientWidth === 0) return;
    const now = performance.now();
    const t = (now - animationStart) / 1000;
    const entrance = Math.min((now - entered) / 750, 1);
    model.rotation.x += (0.08 + targetX * 0.1 - model.rotation.x) * 0.045;
    yaw += (-0.3 + targetY * 0.28 - yaw) * 0.045;
    let turn = 0;
    if (spinStart !== null) {
      const progress = Math.min((now - spinStart) / 1500, 1);
      const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      turn = eased * Math.PI * 2;
      if (progress === 1) {
        spinStart = null;
        spinOffset += Math.PI * 2;
        turn = 0;
        host.dataset.spin = 'idle';
      }
    }
    model.rotation.y = yaw + spinOffset + turn;
    model.position.y = Math.sin(t * 0.7) * 0.035 - (1 - entrance) * 0.15;
    model.scale.setScalar(0.96 + entrance * 0.04);
    renderOnce();
  }
  setSlide(0);
  resize();
  if (!reducedMotion) animate();
  return {
    setSlide,
    spin,
    dispose() {
      disposed = true;
      cancelAnimationFrame(renderFrame);
      resizeObserver.disconnect();
      observer.disconnect();
      pointer?.removeEventListener('pointermove', onPointerMove);
      pointer?.removeEventListener('pointerdown', onPointerDown);
      pointer?.removeEventListener('pointerup', onPointerUp);
      pointer?.removeEventListener('pointercancel', resetPointer);
      pointer?.removeEventListener('pointerleave', resetPointer);
      if (pointer) delete pointer.dataset.sceneHover;
      delete host.dataset.spin;
      clear();
      environment.dispose();
      key.shadow.map?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
