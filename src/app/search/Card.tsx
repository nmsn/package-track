import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import dayjs from 'dayjs';
import type { NpmPackageVersionInfo } from './page';
import classnames from 'class-variance-authority';

type CardPropsType = NpmPackageVersionInfo & {
  onHover: (name: string, type: 'enter' | 'leave') => void;
  isHovered: boolean;
};

export default function Card({
  name,
  time,
  homepage,
  description,
  version,
  count,
  onHover,
  isHovered,
}: CardPropsType) {
  const { created, modified } = time || {};
  const displayTime = dayjs(modified || created).format('YYYY-MM-DD HH:mm');
  return (
    <div onMouseEnter={(e) => onHover(name, 'enter')} onMouseLeave={(e) => onHover(name, 'leave')} className={`flex flex-col gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent bg-muted" ${isHovered ? 'shadow-md bg-accent' : ''}`}>
      < div className="flex justify-between items-center" >
        <Link href={homepage}><div className="font-semibold">{name}</div></Link>
        <div className="ml-auto text-xs text-foreground">{displayTime}</div>
      </div >
      <div className="line-clamp-2 text-xs text-muted-foreground">
        {description}
      </div>
      <div className='flex gap-2 justify-between items-center'>
        <Badge>{version}</Badge>
        <Badge>{count}</Badge>
      </div>
    </div >
  );
}