import { useEffect } from 'react';
import { useJobStore } from '../state/jobStore';
import { SceneManager } from '../scene/SceneManager';

/**
 * Subscribes to store changes and imperatively updates SceneManager.
 * Initial sync is handled by ThreeCanvas after the manager is created.
 * Never re-renders the canvas — all updates are imperative calls.
 */
export function useSceneSync(sceneRef: React.MutableRefObject<SceneManager | null>) {
  useEffect(() => {
    const unsub = useJobStore.subscribe((state, prev) => {
      const mgr = sceneRef.current;
      if (!mgr) return;

      if (state.jobState !== prev.jobState) {
        mgr.updateJob(state.jobState);
      }
      if (state.animationState !== prev.animationState) {
        mgr.setAnimationState(state.animationState);
      }
      if (state.animationSpeed !== prev.animationSpeed) {
        mgr.setAnimationSpeed(state.animationSpeed);
      }
    });
    return unsub;
  }, [sceneRef]);
}
