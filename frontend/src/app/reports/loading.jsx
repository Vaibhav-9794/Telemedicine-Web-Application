import Sidebar from '@/components/Sidebar';

export default function Loading() {
  return (
    <Sidebar>
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-7 w-48 bg-slate-200/80 dark:bg-slate-700/50 rounded-2xl mb-2" />
          <div className="h-3 w-64 bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
        </div>
        <div className="glass-card p-6 border border-slate-200/30 dark:border-slate-700/30 space-y-4 min-h-[400px]">
          <div className="h-4 w-40 bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <div className="w-10 h-10 bg-slate-200/80 dark:bg-slate-700/50 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-32 bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
                <div className="h-2 w-48 bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
              </div>
              <div className="h-8 w-20 bg-slate-200/80 dark:bg-slate-700/50 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </Sidebar>
  );
}
