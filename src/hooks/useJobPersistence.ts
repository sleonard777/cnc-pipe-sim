import { SavedJob } from '../types/job';
import { savedJobsArraySchema } from '../utils/validation';
import { useLocalStorage } from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { useJobStore } from '../state/jobStore';

const STORAGE_KEY = 'cnc-sim-jobs';

export function useJobPersistence() {
  const [savedJobs, setSavedJobs] = useLocalStorage<SavedJob[]>(STORAGE_KEY, []);
  const jobState = useJobStore((s) => s.jobState);
  const loadJobState = useJobStore((s) => s.loadJobState);

  const saveJob = (name: string) => {
    const entry: SavedJob = {
      id: uuidv4(),
      name,
      savedAt: new Date().toISOString(),
      state: jobState,
    };
    setSavedJobs((prev) => [...prev, entry]);
  };

  const loadJob = (id: string) => {
    const job = savedJobs.find((j) => j.id === id);
    if (job) loadJobState(job.state);
  };

  const deleteJob = (id: string) => {
    setSavedJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const listJobs = (): SavedJob[] => {
    try {
      return savedJobsArraySchema.parse(savedJobs);
    } catch {
      return [];
    }
  };

  return { saveJob, loadJob, deleteJob, listJobs };
}
