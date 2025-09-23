'use client';

import { Empty } from '@/components/empty';
import { queryAnnouncement } from '@/services/user/announcement';
import { useQuery } from '@tanstack/react-query';

export default function Page() {
  const { data } = useQuery({
    queryKey: ['queryAnnouncement'],
    queryFn: async () => {
      const { data } = await queryAnnouncement({
        page: 1,
        size: 99,
        pinned: false,
        popup: false,
      });
      return data.data?.announcements || [];
    },
  });
  return data && data.length > 0 ? <Empty border /> : <Empty border />;
}
