import { useEffect, useRef } from 'react';
import { SceneManager } from '../../scene/SceneManager';
import { useSceneSync } from '../../hooks/useSceneSync';
import { useJobStore } from '../../state/jobStore';

export function ThreeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<SceneManager | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Subscribe to store changes → imperative scene updates
  useSceneSync(sceneRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const mgr = new SceneManager(canvas);
    sceneRef.current = mgr;

    // Initial sync — SceneManager now exists, do it immediately
    const { jobState, animationState, animationSpeed } = useJobStore.getState();
    mgr.updateJob(jobState);
    mgr.setAnimationState(animationState);
    mgr.setAnimationSpeed(animationSpeed);

    const ro = new ResizeObserver(() => {
      mgr.resize(container.clientWidth, container.clientHeight);
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
    <div ref={containerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
