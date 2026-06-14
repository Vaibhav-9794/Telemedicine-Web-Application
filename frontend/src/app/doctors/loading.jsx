import { CardGridSkeleton } from '@/components/LoadingSkeleton';
import Sidebar from '@/components/Sidebar';

export default function Loading() {
  return (
    <Sidebar>
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-7 w-48 bg-slate-200/80 dark:bg-slate-700/50 rounded-2xl mb-2" />
          <div className="h-3 w-64 bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
        </div>
        <div className="h-12 w-full bg-slate-200/80 dark:bg-slate-700/50 rounded-2xl" />
        <CardGridSkeleton count={6} />
      </div>
    </Sidebar>
  );
}
