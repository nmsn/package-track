'use client'

import { useState } from 'react';
import { ModeToggle } from '@/components/ModeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lexend } from 'next/font/google';


const packageLink = 'https://registry.npmjs.org/';
const searchLink = 'https://registry.npmjs.org/-/v1/search?size=10&from=0';

const Search = () => {
  const [text, setState] = useState('');
  // const onSearch = async () => {
  //   const endpoint = `https://registry.npmjs.org/-/v1/search?text=${text}`;
  //   const response = await fetch(endpoint);
  //   const data = await response.json();
  //   console.log(data);
  // };

  const onSearch = async () => {
    const endpoint = `https://registry.npmjs.org/${text}`;
    const response = await fetch(endpoint);
    const data = await response.json();
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
      <div className='flex justify-between items-center p-2 h-16'>
        <div className="flex item-center gap-4"><div className='flex items-center'>Package Track</div><Search /></div>
        <div>
          <ModeToggle />
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}
