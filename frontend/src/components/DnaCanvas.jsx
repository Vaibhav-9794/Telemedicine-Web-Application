'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function DnaCanvas({ className = '' }) {
  const containerRef = useRef(null);
  const isVisible = useRef(true);

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
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0x14b8a6, 0.6);
    scene.add(ambient);
    const pointLight = new THREE.PointLight(0x06b6d4, 2, 50);
    pointLight.position.set(5, 5, 10);
    scene.add(pointLight);
    const pointLight2 = new THREE.PointLight(0x0d9488, 1.5, 50);
    pointLight2.position.set(-5, -5, 8);
    scene.add(pointLight2);

    // DNA Helix
    const helixGroup = new THREE.Group();
    const sphereGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const rodGeo = new THREE.CylinderGeometry(0.04, 0.04, 1, 4);

    const mat1 = new THREE.MeshPhongMaterial({ color: 0x14b8a6, emissive: 0x0a5e56, emissiveIntensity: 0.4, shininess: 100 });
    const mat2 = new THREE.MeshPhongMaterial({ color: 0x06b6d4, emissive: 0x034e5e, emissiveIntensity: 0.4, shininess: 100 });
    const rodMat = new THREE.MeshPhongMaterial({ color: 0x5eead4, emissive: 0x2a7a6e, emissiveIntensity: 0.3, transparent: true, opacity: 0.6 });

    const numPoints = 60;
    const radius = 2.5;
    const height = 14;

    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;
      const angle = t * Math.PI * 6;
      const y = (t - 0.5) * height;

      // Strand 1
      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      const sphere1 = new THREE.Mesh(sphereGeo, mat1);
      sphere1.position.set(x1, y, z1);
      helixGroup.add(sphere1);

      // Strand 2 (offset by PI)
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;
      const sphere2 = new THREE.Mesh(sphereGeo, mat2);
      sphere2.position.set(x2, y, z2);
      helixGroup.add(sphere2);

      // Connecting rod every 3rd node
      if (i % 3 === 0) {
        const midX = (x1 + x2) / 2;
        const midZ = (z1 + z2) / 2;
        const dist = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
        const rod = new THREE.Mesh(rodGeo, rodMat);
        rod.position.set(midX, y, midZ);
        rod.scale.y = dist;
        rod.lookAt(x2, y, z2);
        rod.rotateX(Math.PI / 2);
        helixGroup.add(rod);
      }
    }

    // Floating particles
    const particleGeo = new THREE.SphereGeometry(0.06, 6, 6);
    const particleMat = new THREE.MeshPhongMaterial({ color: 0x5eead4, emissive: 0x14b8a6, emissiveIntensity: 0.8, transparent: true, opacity: 0.5 });
    const particles = [];
    for (let i = 0; i < 40; i++) {
      const p = new THREE.Mesh(particleGeo, particleMat);
      p.position.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8);
      p.userData = { speed: 0.002 + Math.random() * 0.005, offset: Math.random() * Math.PI * 2 };
      helixGroup.add(p);
      particles.push(p);
    }

    scene.add(helixGroup);

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
      helixGroup.rotation.y = t * 0.3;
      helixGroup.rotation.x = Math.sin(t * 0.15) * 0.1;
      particles.forEach((p) => {
        p.position.y += Math.sin(t * 2 + p.userData.offset) * 0.003;
      });
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
      observer.disconnect();
      sphereGeo.dispose(); rodGeo.dispose(); particleGeo.dispose();
      mat1.dispose(); mat2.dispose(); rodMat.dispose(); particleMat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className={`w-full h-full ${className}`} />;
}
