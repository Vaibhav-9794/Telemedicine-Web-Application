import Sidebar from '@/components/Sidebar';

export default function Loading() {
  return (
    <Sidebar>
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-7 w-60 bg-slate-200/80 dark:bg-slate-700/50 rounded-2xl mb-2" />
          <div className="h-3 w-72 bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 border border-slate-200/30 dark:border-slate-700/30 min-h-[400px] flex items-center justify-center">
            <div className="w-64 h-64 bg-slate-200/80 dark:bg-slate-700/50 rounded-2xl" />
          </div>
          <div className="glass-card p-6 border border-slate-200/30 dark:border-slate-700/30 space-y-4">
            <div className="h-5 w-40 bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-3 h-3 bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
                <div className="h-3 w-32 bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
              </div>
            ))}
            <div className="h-12 w-full bg-slate-200/80 dark:bg-slate-700/50 rounded-xl mt-4" />
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
