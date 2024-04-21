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

type NpmPackageType = {
  versions: { [key: string]: NpmPackageType },
  dependencies: { [key: string]: string }
};

const packageLink = 'https://registry.npmjs.org/';
// const searchLink = 'https://registry.npmjs.org/-/v1/search?size=10&from=0';

const getDependencies = (data: NpmPackageType) => {
  if (data.dependencies) {
    return Object.values(data.dependencies);
  }
  
  return {};

};
const getVersions = (data: NpmPackageType) => {
  return Object.values(data.versions);
};

const getLatestPackageInfo = (data: NpmPackageType) => {
  const latestVersion =  getVersions(data).pop();
  return latestVersion;
}

const Search = () => {
  const [text, setState] = useState('');
  const onSearch = async () => {
    const endpoint = `${packageLink}${text}`;
    const response = await fetch(endpoint);
    const data = await response.json();
    console.log(getVersions(data));
    console.log(getDependencies(data));
    console.log(getLatestPackageInfo(data));
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
