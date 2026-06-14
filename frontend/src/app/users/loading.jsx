import { TableSkeleton } from '@/components/LoadingSkeleton';
import Sidebar from '@/components/Sidebar';

export default function Loading() {
  return (
    <Sidebar>
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-7 w-48 bg-slate-200/80 dark:bg-slate-700/50 rounded-2xl mb-2" />
          <div className="h-3 w-64 bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
        </div>
        <div className="glass-card p-6 border border-slate-200/30 dark:border-slate-700/30">
          <TableSkeleton rows={6} />
        </div>
      </div>
    </Sidebar>
  );
}
