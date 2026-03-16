import { useEffect, useRef } from 'react';
import { useJobStore } from '../state/jobStore';
import { SceneManager } from '../scene/SceneManager';

/**
 * Subscribes to store changes and imperatively updates SceneManager.
 * Never re-renders the canvas — all updates are imperative calls.
 */
export function useSceneSync(sceneRef: React.MutableRefObject<SceneManager | null>) {
  const storeRef = useRef(useJobStore.getState());

  useEffect(() => {
    const unsub = useJobStore.subscribe((state, prev) => {
      const mgr = sceneRef.current;
      if (!mgr) return;

      // Job changed — rebuild scene
      if (state.jobState !== prev.jobState) {
        mgr.updateJob(state.jobState);
      }

      // Animation state changed
      if (state.animationState !== prev.animationState) {
        mgr.setAnimationState(state.animationState);
      }

      // Speed changed
      if (state.animationSpeed !== prev.animationSpeed) {
        mgr.setAnimationSpeed(state.animationSpeed);
      }
    });

    // Initial sync
    const { jobState, animationState, animationSpeed } = useJobStore.getState();
    storeRef.current = useJobStore.getState();
    if (sceneRef.current) {
      sceneRef.current.updateJob(jobState);
      sceneRef.current.setAnimationState(animationState);
      sceneRef.current.setAnimationSpeed(animationSpeed);
    }

    return unsub;
  }, [sceneRef]);
}
