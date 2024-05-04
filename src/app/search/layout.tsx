'use client'

import { useState, useMemo } from 'react';
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
  homepage: string;
  keywords: string[];
  author: { name: string };
  license: string;
  dependencies: { [key: string]: string };
};

type NpmPackageSearchResultTree = {
  id: string;
  name: string;
  children: NpmPackageSearchResultTree[];
}

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

// 为新节点生成一个唯一的ID
const generateNewNodeId = () => `node-${Math.random().toString(36).substr(2, 9)}`;



const Search = () => {
  const [text, setState] = useState('');
  const [packageList, setPackageList] = useState<NpmPackageVersionInfo[]>([]);
  const [packageTree, setPackageTree] = useState<NpmPackageSearchResultTree>({} as NpmPackageSearchResultTree);

  const getItem = async (name: string) => {
    let pack;
    if (packageList.some(item => item.name === name)) {
      pack = packageList.find(item => item.name === name);
    } else {
      const data = await fetchPackageByName(name);
      pack = getLatestPackageInfo(data);
    }
    // 将 pack 信息进行储存
    setPackageList(prev => {
      if (pack && prev.every(item => item.name !== pack?.name)) {
        return [...prev, pack]
      } else {
        return prev;
      }
    });
    return pack;
  };

  const updateChildrenNode = (node: NpmPackageSearchResultTree, targetId: string, children: NpmPackageSearchResultTree[]): NpmPackageSearchResultTree => {
    if (node.id === targetId) {
      // 如果找到目标节点，返回一个新的节点
      const newNode = { ...node, children };
      return newNode;
    }

    return {
      ...node,
      children: node.children.map(childNode => updateChildrenNode(childNode, targetId, children))
    };
  };

  const onSearch = async () => {
    const tree: NpmPackageSearchResultTree = { id: generateNewNodeId(), name: text, children: [] };
    const queue = [tree];
    while (queue.length) {
      const node = queue.shift()!;
      const info = await getItem(node.name);
      const packageNames = getDependencies(info!);
      // 新的子节点
      const newNodes = packageNames.map(item => {
        const child = { id: generateNewNodeId(), name: item, children: [] };
        return child;
      });

      // 这块需要把子节点注入 packageTree 当中
      setPackageTree((prev) => updateChildrenNode(prev?.id ? prev : tree, node.id, newNodes));
      if (newNodes?.length) {
        queue.push(...newNodes);
      }
    }
  };

  console.log(packageTree);

  const displayPackageInfo = useMemo(() => {
    return packageList.map(item => {
      const { name, version, homepage, author, license, keywords } = item;
      return {
        name,
        version,
        homepage,
        author,
        license,
        keywords,
      };
    });
  }, [packageList]);

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
