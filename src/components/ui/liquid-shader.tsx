import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export interface InteractiveNebulaShaderProps {
  hasActiveReminders?: boolean;
  hasUpcomingReminders?: boolean;
  disableCenterDimming?: boolean;
  className?: string;
  monochrome?: boolean;
  timeScale?: number;
}

/**
 * Supplied nebula shader, adapted to a disposable monochrome entry layer.
 * Props drive three GLSL uniforms—no demo markup here.
 */
export function InteractiveNebulaShader({
  hasActiveReminders = false,
  hasUpcomingReminders = false,
  disableCenterDimming = false,
  className = "",
  monochrome = true,
  timeScale = 1,
}: InteractiveNebulaShaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.ShaderMaterial>();

  // Sync props into uniforms
  useEffect(() => {
    const mat = materialRef.current;
    if (mat) {
      mat.uniforms.monochrome.value = monochrome;
      mat.uniforms.hasActiveReminders.value = hasActiveReminders;
      mat.uniforms.hasUpcomingReminders.value = hasUpcomingReminders;
      mat.uniforms.disableCenterDimming.value = disableCenterDimming;
    }
  }, [hasActiveReminders, hasUpcomingReminders, disableCenterDimming, monochrome]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Renderer, scene, camera, clock
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "low-power" }); }
    catch { return; }
    // Soft liquid detail does not need a full-resolution framebuffer.
    renderer.setPixelRatio(Math.min(1, 900 / Math.max(innerWidth, innerHeight)));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const clock = new THREE.Clock();

    // Vertex shader: pass UVs
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    // Ray-marched nebula fragment shader with reminder-driven palettes
    const fragmentShader = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec2 iMouse;
      uniform bool hasActiveReminders;
      uniform bool hasUpcomingReminders;
      uniform bool disableCenterDimming;
      uniform bool monochrome;
      varying vec2 vUv;

      #define t iTime
      mat2 m(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
      float map(vec3 p){
        p.xz *= m(t*0.4);
        p.xy *= m(t*0.3);
        vec3 q = p*2. + t;
        return length(p + vec3(sin(t*0.7))) * log(length(p)+1.0)
             + sin(q.x + sin(q.z + sin(q.y))) * 0.5 - 1.0;
      }

      void mainImage(out vec4 O, in vec2 fragCoord) {
        vec2 uv = fragCoord / min(iResolution.x, iResolution.y) - vec2(.9, .5);
        uv.x += .4;
        vec3 col = vec3(0.0);
        float d = 2.5;

        // Ray-march
        for (int i = 0; i <= 5; i++) {
          vec3 p = vec3(0,0,5.) + normalize(vec3(uv, -1.)) * d;
          float rz = map(p);
          float f  = clamp((rz - map(p + 0.1)) * 0.5, -0.1, 1.0);

          vec3 base = hasActiveReminders
            ? vec3(0.05,0.2,0.5) + vec3(4.0,2.0,5.0)*f
            : hasUpcomingReminders
            ? vec3(0.05,0.3,0.1) + vec3(2.0,5.0,1.0)*f
            : vec3(0.1,0.3,0.4) + vec3(5.0,2.5,3.0)*f;

          col = col * base + (1.0 - smoothstep(0.0, 2.5, rz)) * 0.7 * base;
          d += min(rz, 1.0);
        }

        // Center dimming
        float dist   = distance(fragCoord, iResolution*0.5);
        float radius = min(iResolution.x, iResolution.y) * 0.5;
        float dim    = disableCenterDimming
                     ? 1.0
                     : smoothstep(radius*0.3, radius*0.5, dist);

        if (monochrome) { float gray = clamp(dot(col, vec3(.299, .587, .114)), 0.0, 1.0); col = mix(vec3(.03), vec3(.969, .965, .949), gray); }
        O = vec4(col, 1.0);
        if (!disableCenterDimming) {
          O.rgb = mix(O.rgb * 0.3, O.rgb, dim);
        }
      }

      void main() {
        mainImage(gl_FragColor, vUv * iResolution);
      }
    `;

    // Uniforms
    const uniforms = {
      monochrome: { value: monochrome },
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2() },
      iMouse: { value: new THREE.Vector2() },
      hasActiveReminders: { value: hasActiveReminders },
      hasUpcomingReminders: { value: hasUpcomingReminders },
      disableCenterDimming: { value: disableCenterDimming },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });
    materialRef.current = material;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    // Resize to the entry container; no global pointer listeners.
    const onResize = () => {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      renderer.setSize(w, h);
      uniforms.iResolution.value.set(w, h);
    };
    const observer = new ResizeObserver(onResize);
    observer.observe(container);

    onResize();

    // Animation loop
    let previousFrame = 0;
    renderer.setAnimationLoop((time) => {
      if (document.hidden || time - previousFrame < 1000 / 30) return;
      previousFrame = time;
      uniforms.iTime.value = clock.getElapsedTime() * timeScale;
      renderer.render(scene, camera);
    });

    return () => {
      observer.disconnect();

      renderer.setAnimationLoop(null);
      container.removeChild(renderer.domElement);
      material.dispose();
      mesh.geometry.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      materialRef.current = undefined;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`liquid-shader ${className}`}
      aria-hidden="true"
    />
  );
}

export default InteractiveNebulaShader;
