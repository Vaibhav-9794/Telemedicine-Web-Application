import Sidebar from '@/components/Sidebar';

export default function Loading() {
  return (
    <Sidebar>
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-7 w-48 bg-slate-200/80 dark:bg-slate-700/50 rounded-2xl mb-2" />
          <div className="h-3 w-64 bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 glass-card p-4 border border-slate-200/30 dark:border-slate-700/30 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 rounded-full bg-slate-200/80 dark:bg-slate-700/50" />
                <div className="space-y-1 flex-1">
                  <div className="h-3 w-24 bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
                  <div className="h-2 w-32 bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-2 glass-card p-6 border border-slate-200/30 dark:border-slate-700/30 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 bg-slate-200/80 dark:bg-slate-700/50 rounded-2xl mb-4" />
            <div className="h-4 w-48 bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
