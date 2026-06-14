'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const REGIONS = {
  head: { y: 3.8, radius: 0.7, keywords: 'headache, migraine, dizziness' },
  chest: { y: 2.0, width: 1.6, height: 1.5, keywords: 'chest pain, shortness of breath, palpitations' },
  stomach: { y: 0.4, width: 1.4, height: 1.2, keywords: 'stomach pain, nausea, bloating, vomiting' },
  leftArm: { x: -1.6, y: 2.2, keywords: 'joint pain, muscle pain, arm pain' },
  rightArm: { x: 1.6, y: 2.2, keywords: 'joint pain, muscle pain, arm pain' },
  leftLeg: { x: -0.4, y: -1.8, keywords: 'knee pain, joint pain, leg swelling' },
  rightLeg: { x: 0.4, y: -1.8, keywords: 'knee pain, joint pain, leg swelling' },
};

export default function AnatomyCanvas({ className = '', onRegionClick }) {
  const containerRef = useRef(null);
  const hoveredRef = useRef(null);
  const isVisible = useRef(true);
  const onRegionClickRef = useRef(onRegionClick);

  useEffect(() => { onRegionClickRef.current = onRegionClick; }, [onRegionClick]);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;
    const container = containerRef.current;

    // IntersectionObserver to pause rendering when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(container);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.5, 9);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0x14b8a6, 1);
    dirLight.position.set(3, 5, 5);
    scene.add(dirLight);

    const bodyGroup = new THREE.Group();
    const defaultMat = () => new THREE.MeshPhongMaterial({ color: 0x5eead4, transparent: true, opacity: 0.5, emissive: 0x0a3a35, emissiveIntensity: 0.15 });
    const wireMat = () => new THREE.MeshBasicMaterial({ color: 0x14b8a6, wireframe: true, transparent: true, opacity: 0.3 });

    const parts = {};

    // Head
    const headGeo = new THREE.SphereGeometry(REGIONS.head.radius, 24, 24);
    const head = new THREE.Mesh(headGeo, defaultMat());
    head.position.y = REGIONS.head.y;
    head.userData = { region: 'head' };
    bodyGroup.add(head);
    const headWire = new THREE.Mesh(headGeo, wireMat());
    headWire.position.copy(head.position);
    bodyGroup.add(headWire);
    parts.head = { mesh: head, wire: headWire };

    // Chest
    const chestGeo = new THREE.BoxGeometry(REGIONS.chest.width, REGIONS.chest.height, 0.8, 4, 4, 4);
    const chest = new THREE.Mesh(chestGeo, defaultMat());
    chest.position.y = REGIONS.chest.y;
    chest.userData = { region: 'chest' };
    bodyGroup.add(chest);
    const chestWire = new THREE.Mesh(chestGeo, wireMat());
    chestWire.position.copy(chest.position);
    bodyGroup.add(chestWire);
    parts.chest = { mesh: chest, wire: chestWire };

    // Stomach
    const stomachGeo = new THREE.BoxGeometry(REGIONS.stomach.width, REGIONS.stomach.height, 0.7, 4, 4, 4);
    const stomach = new THREE.Mesh(stomachGeo, defaultMat());
    stomach.position.y = REGIONS.stomach.y;
    stomach.userData = { region: 'stomach' };
    bodyGroup.add(stomach);
    const stomachWire = new THREE.Mesh(stomachGeo, wireMat());
    stomachWire.position.copy(stomach.position);
    bodyGroup.add(stomachWire);
    parts.stomach = { mesh: stomach, wire: stomachWire };

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.18, 0.16, 2, 12);
    ['leftArm', 'rightArm'].forEach((name) => {
      const arm = new THREE.Mesh(armGeo, defaultMat());
      arm.position.set(REGIONS[name].x, REGIONS[name].y, 0);
      arm.userData = { region: name };
      bodyGroup.add(arm);
      const armWire = new THREE.Mesh(armGeo, wireMat());
      armWire.position.copy(arm.position);
      bodyGroup.add(armWire);
      parts[name] = { mesh: arm, wire: armWire };
    });

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.22, 0.18, 2.5, 12);
    ['leftLeg', 'rightLeg'].forEach((name) => {
      const leg = new THREE.Mesh(legGeo, defaultMat());
      leg.position.set(REGIONS[name].x, REGIONS[name].y, 0);
      leg.userData = { region: name };
      bodyGroup.add(leg);
      const legWire = new THREE.Mesh(legGeo, wireMat());
      legWire.position.copy(leg.position);
      bodyGroup.add(legWire);
      parts[name] = { mesh: leg, wire: legWire };
    });

    scene.add(bodyGroup);

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const meshes = Object.values(parts).map((p) => p.mesh);

    const onMouseMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);

      // Reset previous hover
      if (hoveredRef.current) {
        const p = parts[hoveredRef.current];
        if (p) { p.mesh.material.emissiveIntensity = 0.15; p.mesh.material.opacity = 0.5; }
      }

      if (intersects.length > 0) {
        const region = intersects[0].object.userData.region;
        hoveredRef.current = region;
        const p = parts[region];
        if (p) { p.mesh.material.emissiveIntensity = 0.7; p.mesh.material.opacity = 0.8; p.mesh.material.emissive.set(0x14b8a6); }
        renderer.domElement.style.cursor = 'pointer';
      } else {
        hoveredRef.current = null;
        renderer.domElement.style.cursor = 'default';
      }
    };

    const onClick = () => {
      if (hoveredRef.current && onRegionClickRef.current) {
        onRegionClickRef.current(hoveredRef.current, REGIONS[hoveredRef.current]?.keywords || '');
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    let animId;
    const timer = new THREE.Timer();
    const interval = 1000 / 30;
    let lastTime = 0;

    const animate = (time) => {
      animId = requestAnimationFrame(animate);
      if (!isVisible.current) return;
      if (time - lastTime < interval) return;
      lastTime = time;
      timer.update();
      const t = timer.getElapsed();
      bodyGroup.rotation.y = Math.sin(t * 0.3) * 0.3;
      renderer.render(scene, camera);
    };
    requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onClick);
      observer.disconnect();
      scene.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className={`w-full h-full ${className}`} />;
}
