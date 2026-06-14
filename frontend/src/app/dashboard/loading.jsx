import { DashboardSkeleton } from '@/components/LoadingSkeleton';
import Sidebar from '@/components/Sidebar';

export default function Loading() {
  return (
    <Sidebar>
      <DashboardSkeleton />
    </Sidebar>
  );
}
