import { useEffect, useRef } from 'react';
import { SceneManager } from '../../scene/SceneManager';
import { useSceneSync } from '../../hooks/useSceneSync';

export function ThreeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<SceneManager | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useSceneSync(sceneRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const mgr = new SceneManager(canvas);
    sceneRef.current = mgr;

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      mgr.resize(w, h);
    });
    ro.observe(container);
    mgr.resize(container.clientWidth, container.clientHeight);

    return () => {
      ro.disconnect();
      mgr.dispose();
      sceneRef.current = null;
    };
  }, []);

  return (
    <div ref={containerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
