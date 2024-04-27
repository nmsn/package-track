'use client'

import { useState } from 'react';
import { ModeToggle } from '@/components/ModeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

type NpmPackageSearchType = {
  name: string;
  versions: { [key: string]: NpmPackageVersionInfo };
  time: {
    modified: Date;
    created: Date;
  }
};

type NpmPackageVersionInfo = {
  name: string;
  version: string;
  dependencies: { [key: string]: string };
};

// 这个函数只能用来搜索包名
const packageLink = 'https://registry.npmjs.org/';
// 用来检索列表的
// const searchLink = 'https://registry.npmjs.org/-/v1/search?size=10&from=0';

const getDependencies = (data: NpmPackageVersionInfo): string[] => {
  if (data.dependencies) {
    return Object.keys(data.dependencies);
  }
  return [];
};


const getLatestPackageInfo = (data: NpmPackageSearchType) => {
  const latestVersion = Object.values(data.versions).pop();
  return latestVersion;
};

// TODO 需要间隔一定时间进行请求
const fetchPackageByName = async (name: string): Promise<NpmPackageSearchType> => {
  const endpoint = `${packageLink}${name}`;
  const response = await fetch(endpoint);
  const data = await response.json();
  return data;
};

const getItem = async (name: string, arr: NpmPackageVersionInfo[] = []) => {
  const data = await fetchPackageByName(name);
  const pack = getLatestPackageInfo(data);
  // 将 pack 信息进行储存
  if (pack && arr.every(item => item.name !== pack?.name)) {
    arr.push(pack);
  }
  return getDependencies(pack!);
};

// 广度优先遍历
const getRecursionDep = async (name: string, arr: NpmPackageVersionInfo[] = []) => {
  const packageNames = await getItem(name, arr);

  for (let packageName of packageNames) {
    await getRecursionDep(packageName, arr);
  }
};

const Search = () => {
  const [text, setState] = useState('');
  const [packageList, setPackageList] = useState<NpmPackageVersionInfo[]>([]);
  const onSearch = async () => {
    const result: NpmPackageVersionInfo[] = [];
    const data = await getRecursionDep(text, result);
    console.log(result);
    return data;
  };

  return (
    <div className="flex item-center space-x-2">
      <Input onChange={e => setState(e.target.value)} value={text} />
      <Button size="sm" onClick={onSearch}>Confirm</Button>
    </div>
  )
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <div className='flex justify-between items-center p-4 h-16'>
        <div className="flex item-center gap-4">
          <div className='flex items-center w-52 gap-4'>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            Package Track
          </div>
          <Search />
        </div>
        <div>
          <ModeToggle />
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}
