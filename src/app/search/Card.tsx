import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import dayjs from 'dayjs';
import type { NpmPackageVersionInfo } from './page';

export default function Card({
  name,
  time,
  homepage,
  description,
  version,
  count,
}: NpmPackageVersionInfo) {
  const { created, modified } = time || {};
   const displayTime = dayjs(modified || created).format('YYYY-MM-DD HH:mm');
  return (<div className="flex flex-col gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent bg-muted">
    <div className="flex justify-between items-center">
      <Link href={homepage}><div className="font-semibold">{name}</div></Link>
      <div className="ml-auto text-xs text-foreground">{displayTime}</div>
    </div>
    <div className="line-clamp-2 text-xs text-muted-foreground">
      {description}
    </div>
    <div className='flex gap-2 justify-between items-center'>
      <Badge>{version}</Badge>
      <Badge>{count}</Badge>
    </div>
  </div>
  );
}