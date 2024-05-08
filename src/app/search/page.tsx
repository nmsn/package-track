'use client'

import { useState, useMemo, MutableRefObject, Dispatch, SetStateAction } from 'react';
import { useLatest } from 'ahooks';
import { ModeToggle } from '@/components/ModeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import Card from './Card';
import Graph from './Graph';

import { fakeListData, fakeTreeData } from './index';

type NpmPackageSearchType = {
  name: string;
  versions: { [key: string]: NpmPackageVersionInfo };
  time: {
    modified: string;
    created: string;
  }
};

export type NpmPackageVersionInfo = {
  name: string;
  version: string;
  homepage: string;
  description: string;
  keywords: string[];
  author: { name: string };
  license: string;
  dependencies?: { [key: string]: string };
  count: number;
  time: NpmPackageSearchType['time'];
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
  const { time } = data;
  const latestVersion = Object.values(data.versions).pop();
  return { ...latestVersion, time };
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

const Search = ({ setPackageList, setPackageTree, latestPackageList }: {
  setPackageList: Dispatch<SetStateAction<NpmPackageVersionInfo[]>>;
  setPackageTree: Dispatch<SetStateAction<NpmPackageSearchResultTree>>;
  latestPackageList: MutableRefObject<NpmPackageVersionInfo[]>;
}) => {
  const [text, setState] = useState('');
  // const [packageList, setPackageList] = useState<NpmPackageVersionInfo[]>([] as NpmPackageVersionInfo[]);
  // const [packageTree, setPackageTree] = useState<NpmPackageSearchResultTree>({} as NpmPackageSearchResultTree);
  // const latestPackageList = useLatest(packageList);

  const getItem = async (name: string): Promise<NpmPackageVersionInfo> => {
    let pack: NpmPackageVersionInfo;
    if (latestPackageList.current.some(item => item.name === name)) {
      pack = latestPackageList.current.find(item => item.name === name) as NpmPackageVersionInfo;
    } else {
      const data = await fetchPackageByName(name);
      pack = getLatestPackageInfo(data) as NpmPackageVersionInfo;
    }
    const packWithCount = { ...pack, count: (pack?.count || 0) + 1 };
    // 将 pack 信息进行储存
    setPackageList(prev => {
      if (pack && prev.every(item => item.name !== pack?.name)) {
        return [...prev, packWithCount] as NpmPackageVersionInfo[];
      } else {
        return prev.map(item => {
          if (item.name === packWithCount.name) {
            return packWithCount;
          }
          return item;
        }) as NpmPackageVersionInfo[];
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
    // TODO 记录树结构的层级
    const queue = [tree];
    while (queue.length) {
      const node = queue.shift()!;
      const info = await getItem(node.name)!;
      const packageNames = getDependencies(info);
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

  return (
    <div className="flex items-center space-x-2">
      <Input onChange={e => setState(e.target.value)} value={text} />
      <Button size="sm" onClick={onSearch}>Confirm</Button>
    </div>
  )
};

export default function Page() {
  const [packageList, setPackageList] = useState<NpmPackageVersionInfo[]>(fakeListData as any as NpmPackageVersionInfo[]);
  const [packageTree, setPackageTree] = useState<NpmPackageSearchResultTree>(fakeTreeData as NpmPackageSearchResultTree);
  const latestPackageList = useLatest(packageList);

  const packageInfoList = useMemo(() => {
    return packageList.map(item => {
      const { name, version, homepage, author, license, keywords, count, description, time } = item;
      return {
        name,
        version,
        homepage,
        author,
        license,
        keywords,
        count,
        time,
        description,
      };
    });
  }, [packageList]);
  
  
  // TODO 引用次数和层级的权重
  const graphNodes = useMemo(() => {
    return packageInfoList.map(item => {
      const { name, count  } = item;
      return { id: name, size: 50 + count * 10, label: name };
    });
  }, [packageInfoList]);


  const sourceTargetMap = useMemo(() => {
    const result = [] as { source: string, target: string }[];

    const deal = (tree: NpmPackageSearchResultTree) => {
      if (tree.children?.length) {
        tree.children.forEach(item => {
          const saveItem = { source: tree.name, target: item.name };
          result.push(saveItem);
          deal(item);
        });
      }
    };

    deal(packageTree);
    return result;
  }, [packageTree]);


  return (
    <div>
      <div className='flex justify-between items-center p-4 h-16'>
        <div className="flex item-center">
          <div className='flex items-center w-80'>
            <Avatar className="mr-4">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            NPM Package Track
          </div>
          <Search setPackageList={setPackageList} setPackageTree={setPackageTree} latestPackageList={latestPackageList} />
        </div>
        <div>
          <ModeToggle />
        </div>
      </div>
      <div style={{ height: 'calc(100vh - 64px)' }} className="flex p-4 pt-0">
        <div className="w-80 gap-2 flex flex-col h-full overflow-auto pr-2">
          {packageInfoList.map(item => <Card {...item} key={item.name} />)}
        </div>
        <div className="grow h-full">
          <Graph edges={sourceTargetMap} nodes={graphNodes} />
        </div>
      </div>
    </div>
  );
}
