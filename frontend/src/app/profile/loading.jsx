import Sidebar from '@/components/Sidebar';

export default function Loading() {
  return (
    <Sidebar>
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-7 w-48 bg-slate-200/80 dark:bg-slate-700/50 rounded-2xl mb-2" />
          <div className="h-3 w-64 bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 border border-slate-200/30 dark:border-slate-700/30 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
                <div className="h-10 w-full bg-slate-200/80 dark:bg-slate-700/50 rounded-xl" />
              </div>
            ))}
          </div>
          <div className="glass-card p-6 border border-slate-200/30 dark:border-slate-700/30">
            <div className="w-24 h-24 rounded-full bg-slate-200/80 dark:bg-slate-700/50 mx-auto mb-4" />
            <div className="h-5 w-32 bg-slate-200/80 dark:bg-slate-700/50 rounded-full mx-auto mb-2" />
            <div className="h-3 w-48 bg-slate-200/80 dark:bg-slate-700/50 rounded-full mx-auto" />
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
