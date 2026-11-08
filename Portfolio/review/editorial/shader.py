from pathlib import Path
s=Path(r'C:\Users\Sarthak Salvi\.codex\attachments\36c973ea-b64f-42d6-971b-d50421cfee11\Pasted text.txt').read_text(encoding='utf-8')
s=s.split('// src/components/ui/InteractiveNebulaShader.tsx',1)[1].split('demo.tsx',1)[0].strip()
s=s.replace('  className?: string;', '  className?: string;\n  monochrome?: boolean;')
s=s.replace('  className = "",', '  className = "",\n  monochrome = true,')
s=s.replace('      mat.uniforms.hasActiveReminders.value', '      mat.uniforms.monochrome.value = monochrome;\n      mat.uniforms.hasActiveReminders.value')
s=s.replace('[hasActiveReminders, hasUpcomingReminders, disableCenterDimming]', '[hasActiveReminders, hasUpcomingReminders, disableCenterDimming, monochrome]')
s=s.replace('    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });\n    renderer.setPixelRatio(window.devicePixelRatio);', '''    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "low-power" }); }
    catch { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));''')
s=s.replace('      uniform bool disableCenterDimming;', '      uniform bool disableCenterDimming;\n      uniform bool monochrome;')
s=s.replace('smoothstep(2.5, 0.0, rz)', '(1.0 - smoothstep(0.0, 2.5, rz))')
s=s.replace('        O = vec4(col, 1.0);', '        if (monochrome) { float gray = clamp(dot(col, vec3(.299, .587, .114)), 0.0, 1.0); col = mix(vec3(.03), vec3(.969, .965, .949), gray); }\n        O = vec4(col, 1.0);')
s=s.replace('      iTime: { value: 0 },', '      monochrome: { value: monochrome },\n      iTime: { value: 0 },')
s=s.replace('      const w = container.clientWidth;', '      const w = Math.max(1, container.clientWidth);').replace('      const h = container.clientHeight;', '      const h = Math.max(1, container.clientHeight);')
s=s.replace('    window.addEventListener("resize", onResize);', '    const observer = new ResizeObserver(onResize);\n    observer.observe(container);')
s=s.replace('    window.addEventListener("mousemove", onMouseMove);','')
s=s.replace('      uniforms.iTime.value = clock.getElapsedTime();', '      if (document.hidden) return;\n      uniforms.iTime.value = clock.getElapsedTime();')
s=s.replace('      window.removeEventListener("resize", onResize);','      observer.disconnect();').replace('      window.removeEventListener("mousemove", onMouseMove);','')
s=s.replace('      renderer.dispose();', '      renderer.dispose();\n      renderer.forceContextLoss();\n      materialRef.current = undefined;')
s=s.replace('className={`fixed inset-0 bg-background ${className}`}','className={`liquid-shader ${className}`}').replace('aria-label="Interactive nebula background"','aria-hidden="true"')
s=s.replace(' * Full-screen nebula shader background.', ' * Supplied nebula shader, adapted to a disposable monochrome entry layer.')
Path('src/components/ui/liquid-shader.tsx').write_text(s)
