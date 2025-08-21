// RhinoViewer.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Rhino3dmLoader } from 'three/examples/jsm/loaders/3DMLoader.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

type Props = {
  // Your Node endpoint that returns raw 3DM bytes from Rhino Compute JSON
  url?: string;
  // Optional: the same JSON you posted to Rhino Compute
  payload?: unknown;
  // Units hint; if server sends X-Rhino-ModelUnits header you don’t need this
  units?: 'Millimeters' | 'Meters' | 'Centimeters';
};

const RhinoViewer: React.FC<Props> = ({
  url = 'http://localhost:4000/gh/3dm',
  payload,
  units = 'Millimeters',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rootObj, setRootObj] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Three.js boot ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf6f7fb);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.01,
      1000
    );
    camera.position.set(0.3, 0.3, 0.6);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 0.9));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(2, 3, 4);
    scene.add(dir);

    // Resize
    const onResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animate
    let raf = 0;
    const tick = () => {
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    // Load 3DM
    let disposed = false;
    (async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // body: payload ? JSON.stringify(payload) : undefined,
      });
      if (!res.ok) throw new Error(`3DM request failed: ${res.status}`);

      const serverUnits = (res.headers.get('X-Rhino-ModelUnits') || units).toLowerCase();
      const ab = await res.arrayBuffer();

      const loader = new Rhino3dmLoader();
      loader.setLibraryPath('https://cdn.jsdelivr.net/npm/rhino3dm@8.*/'); // or a local path

      await new Promise<void>((resolve, reject) =>
        loader.parse(
          ab,
          (obj) => {
            if (disposed) return;

            // Units → Three.js usually expects meters. Your pipeline is “Millimeters”.
            if (serverUnits.startsWith('mm')) obj.scale.setScalar(0.001);
            else if (serverUnits.startsWith('centi')) obj.scale.setScalar(0.01);

            scene.add(obj);
            setRootObj(obj);

            // Fit camera nicely around the object
            fitCameraToObject(camera, obj, controls);
            resolve();
          },
          reject
        )
      );
    })().catch((e) => console.error('Rhino3dmLoader error:', e));

    // Cleanup
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      scene.traverse((n: any) => {
        if (n.geometry) n.geometry.dispose();
        if (n.material) {
          const mats = Array.isArray(n.material) ? n.material : [n.material];
          mats.forEach((m) => m && m.dispose && m.dispose());
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [url, payload, units]);

  const downloadSTL = () => {
    if (!rootObj) return;
    const exporter = new STLExporter();
    const ab = exporter.parse(rootObj, { binary: true }) as unknown as ArrayBuffer; // binary STL
    const blob = new Blob([ab], { type: 'model/stl' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'model.stl';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '60vh',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
        }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={downloadSTL} disabled={!rootObj}>
          Download STL
        </button>
      </div>
    </div>
  );
};

export default RhinoViewer;

// --- helpers ---
function fitCameraToObject(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  controls?: OrbitControls
) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  // Compute a good distance
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = (camera.fov * Math.PI) / 180;
  let distance = maxDim / (2 * Math.tan(fov / 2));

  distance *= 1.4; // padding

  // Position camera
  const dir = new THREE.Vector3(1, 1, 1).normalize();
  camera.position.copy(center).add(dir.multiplyScalar(distance));
  camera.near = distance / 100;
  camera.far = distance * 10;
  camera.updateProjectionMatrix();

  // Re-center controls
  controls?.target.copy(center);
  controls?.update();
}
