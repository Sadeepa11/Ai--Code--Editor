"use client";
import React from 'react';
import { 
  FilePlus, 
  FolderPlus, 
  File, 
  Folder, 
  Trash2, 
  Edit2, 
  ChevronRight, 
  ChevronDown,
  FileCode,
  FileJson,
  FileType,
  FileText,
  LayoutGrid,
  Settings,
  Sparkles,
  ImagePlus
} from 'lucide-react';

interface FileNode {
  id: number;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  folder_id: number | null;
  children?: FileNode[];
}

const getFileIcon = (name: string, type: string) => {
  if (type === 'folder') return <Folder size={16} className="text-amber-400/90 fill-amber-400/20" />;
  
  const ext = name.split('.').pop()?.toLowerCase();
  
  // Specific file names
  if (name === 'package.json') return <FileJson size={16} className="text-orange-500/90" />;
  if (name.includes('config')) return <Settings size={14} className="text-blue-400/90" />;
  if (name === '.env' || name.startsWith('.env.')) return <Sparkles size={16} className="text-yellow-500/90" />;
  if (name === '.gitignore') return <Trash2 size={16} className="text-red-500/90" />;
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '')) return <ImagePlus size={16} className="text-pink-400/90" />;

  switch (ext) {
    case 'js':
    case 'jsx':
    case 'mjs':
      return <FileCode size={16} className="text-yellow-400/90" />;
    case 'ts':
    case 'tsx':
      return <FileCode size={16} className="text-blue-400/90 font-bold" />;
    case 'json':
      return <FileJson size={16} className="text-orange-400/90" />;
    case 'css':
      return <FileType size={16} className="text-blue-300/90" />;
    case 'md':
      return <FileText size={16} className="text-sky-400/90" />;
    case 'html':
      return <FileCode size={16} className="text-orange-600/90" />;
    case 'sqlite':
    case 'db':
      return <LayoutGrid size={16} className="text-purple-400/90" />;
    default:
      return <File size={16} className="text-gray-400/90" />;
  }
};

function FileTreeItem({ 
  node, 
  level, 
  activeFile, 
  onFileSelect, 
  onDeleteFile, 
  onRenameFile,
  onFolderToggle,
  expandedFolders
}: { 
  node: FileNode, 
  level: number, 
  activeFile: string | null,
  onFileSelect: (name: string) => void,
  onDeleteFile: (id: number) => void,
  onRenameFile: (id: number, currentName: string) => void,
  onFolderToggle: (id: number) => void,
  expandedFolders: Set<number>
}) {
  const isExpanded = expandedFolders.has(node.id);
  const isSelected = node.name === activeFile;

  return (
    <div className="select-none">
      <div 
        className={`group flex items-center justify-between py-1 px-4 cursor-pointer hover:bg-[#2d2d2d] transition-colors ${
          isSelected ? 'bg-[#37373d] text-white' : 'text-text-secondary'
        }`}
        style={{ paddingLeft: (level * 12) + 16 }}
        onClick={() => {
          if (node.type === 'folder') {
            onFolderToggle(node.id);
          } else {
            onFileSelect(node.name);
          }
        }}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {node.type === 'folder' && (
            <span className="opacity-60">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          )}
          {getFileIcon(node.name, node.type)}
          <span className="text-[13px] truncate">{node.name}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onRenameFile(node.id, node.name); }} 
            className="p-1 hover:bg-[#3d3d3d] rounded"
          >
            <Edit2 size={12} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDeleteFile(node.id); }} 
            className="p-1 hover:bg-[#3d3d3d] hover:text-red-400 rounded"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children.map(child => (
            <FileTreeItem 
              key={child.id} 
              node={child} 
              level={level + 1} 
              activeFile={activeFile}
              onFileSelect={onFileSelect}
              onDeleteFile={onDeleteFile}
              onRenameFile={onRenameFile}
              onFolderToggle={onFolderToggle}
              expandedFolders={expandedFolders}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ 
  files, 
  activeFile, 
  onFileSelect, 
  onCreateFile, 
  onCreateFolder, 
  onUploadImage,
  onDeleteFile, 
  onRenameFile 
}: { 
  files: any[], 
  activeFile: string | null, 
  onFileSelect: (name: string) => void,
  onCreateFile: (folderId?: number) => void,
  onCreateFolder: (folderId?: number) => void,
  onUploadImage: (folderId?: number) => void,
  onDeleteFile: (id: number) => void,
  onRenameFile: (id: number, currentName: string) => void
}) {
  const [expandedFolders, setExpandedFolders] = React.useState<Set<number>>(new Set());

  const toggleFolder = (id: number) => {
    const next = new Set(expandedFolders);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedFolders(next);
  };

  // Build tree from flat list
  const buildTree = (nodes: any[]): FileNode[] => {
    const nodeMap: { [key: number]: FileNode } = {};
    const rootNodes: FileNode[] = [];

    nodes.forEach(node => {
      nodeMap[node.id] = { ...node, children: [] };
    });

    nodes.forEach(node => {
      if (node.folder_id && nodeMap[node.folder_id]) {
        nodeMap[node.folder_id].children?.push(nodeMap[node.id]);
      } else {
        rootNodes.push(nodeMap[node.id]);
      }
    });

    // Sort: Folders first, then alphabetically
    const sorter = (a: FileNode, b: FileNode) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    };

    const recursiveSort = (nodes: FileNode[]) => {
      nodes.sort(sorter);
      nodes.forEach(node => {
        if (node.children) recursiveSort(node.children);
      });
    };

    recursiveSort(rootNodes);
    return rootNodes;
  };

  const tree = buildTree(files);

  return (
    <aside className="w-64 bg-[#181818] border-r border-[#333] flex flex-col shrink-0 overflow-hidden">
      <div className="flex justify-between items-center px-4 py-2 bg-[#252526] border-b border-[#333]">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Explorer</span>
        <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
          <button onClick={() => onCreateFile()} title="New File" className="p-1 hover:bg-[#333] rounded"><FilePlus size={14} /></button>
          <button onClick={() => onCreateFolder()} title="New Folder" className="p-1 hover:bg-[#333] rounded"><FolderPlus size={14} /></button>
          <button onClick={() => onUploadImage()} title="Upload Image" className="p-1 hover:bg-[#333] rounded"><ImagePlus size={14} /></button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pt-1 py-10 scrollbar-thin scrollbar-thumb-[#333]">
        {tree.length === 0 && (
          <div className="px-5 py-2 text-[12px] text-gray-500 italic opacity-50">Empty workspace...</div>
        )}
        {tree.map(node => (
          <FileTreeItem 
            key={node.id} 
            node={node} 
            level={0} 
            activeFile={activeFile}
            onFileSelect={onFileSelect}
            onDeleteFile={onDeleteFile}
            onRenameFile={onRenameFile}
            onFolderToggle={toggleFolder}
            expandedFolders={expandedFolders}
          />
        ))}
      </div>
    </aside>
  );
}
