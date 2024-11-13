'use client';

import { queryAnnouncement } from '@/services/user/announcement';
import Empty from '@repo/ui/empty';
import { Markdown } from '@repo/ui/markdown';
import { formatDate } from '@repo/ui/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shadcn/ui/card';
import { useQuery } from '@tanstack/react-query';

export default function Page() {
  const { data } = useQuery({
    queryKey: ['queryAnnouncement'],
    queryFn: async () => {
      const { data } = await queryAnnouncement({
        page: 1,
        size: 20,
      });
      return data.data?.announcements || [];
    },
  });
  return (
    <div className='flex flex-col gap-5'>
      {data?.length ? (
        data.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{formatDate(item.updated_at)}</CardDescription>
            </CardHeader>
            <CardContent>
              <Markdown>{item.content}</Markdown>
            </CardContent>
          </Card>
        ))
      ) : (
        <Empty />
      )}
    </div>
  );
}
