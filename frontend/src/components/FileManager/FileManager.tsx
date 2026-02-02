import { useState, useEffect } from 'react';
import { 
  Folder, File, Plus, Trash2, Edit2, ChevronRight, ChevronDown, 
  Upload, Download, FolderPlus, FilePlus, Save, Loader2, RefreshCw
} from 'lucide-react';
import { useEditorStore } from '../../store';
import { useProjects } from '../../hooks/useProjects';
import { useAuth } from '../../hooks/useAuth';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'domain' | 'problem';
  content?: string;
  children?: FileItem[];
  dbId?: number;  // Database ID for saved projects
  isLoading?: boolean;
}

const defaultFiles: FileItem[] = [
  {
    id: 'my-projects',
    name: 'My Projects',
    type: 'folder',
    children: []
  }
];

export function FileManager() {
  const [files, setFiles] = useState<FileItem[]>(defaultFiles);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['my-projects']));
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showNewMenu, setShowNewMenu] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const { setDomainPddl, setProblemPddl } = useEditorStore();
  
  const { token } = useAuth();
  const { 
    projects, 
    isLoading: isLoadingProjects, 
    createProject, 
    updateProject, 
    deleteProject,
    fetchProjects 
  } = useProjects(token);

  // Convert database projects to file tree structure
  useEffect(() => {
    if (!projects.length) return;

    const projectChildren: FileItem[] = projects.map(p => ({
      id: `project-${p.id}`,
      name: p.project_name,
      type: p.project_type,
      content: p.content,
      dbId: p.id,
    }));

    setFiles(prev => {
      const newFiles = [...prev];
      const myProjects = newFiles.find(f => f.id === 'my-projects');
      if (myProjects) {
        // Merge with existing unsaved items
        const existingIds = new Set(projectChildren.map(p => p.id));
        const unsavedChildren = (myProjects.children || []).filter(
          c => !c.dbId && !existingIds.has(c.id)
        );
        myProjects.children = [...projectChildren, ...unsavedChildren];
      }
      return newFiles;
    });
  }, [projects]);

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const findFileById = (items: FileItem[], id: string): FileItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findFileById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'folder') {
      toggleFolder(file.id);
    } else {
      setSelectedFile(file.id);
      if (file.content) {
        if (file.type === 'domain') {
          setDomainPddl(file.content);
        } else if (file.type === 'problem') {
          setProblemPddl(file.content);
        }
      }
    }
  };

  const saveFileToDb = async (file: FileItem) => {
    if (!file.dbId) {
      // Create new project
      const result = await createProject({
        project_name: file.name,
        project_type: file.type as 'domain' | 'problem',
        folder_path: '',
        content: file.content || '',
      });
      if (result) {
        // Refresh to get the new ID
        await fetchProjects();
        setPendingChanges(prev => {
          const next = new Set(prev);
          next.delete(file.id);
          return next;
        });
      }
    } else {
      // Update existing project
      const success = await updateProject(file.dbId, file.content || '', file.name);
      if (success) {
        setPendingChanges(prev => {
          const next = new Set(prev);
          next.delete(file.id);
          return next;
        });
      }
    }
  };

  const createNewItem = (parentId: string, type: 'folder' | 'domain' | 'problem') => {
    const newId = `${type}-${Date.now()}`;
    const newItem: FileItem = {
      id: newId,
      name: type === 'folder' ? 'New Folder' : type === 'domain' ? 'new-domain.pddl' : 'new-problem.pddl',
      type,
      children: type === 'folder' ? [] : undefined,
      content: type === 'domain' 
        ? `(define (domain new-domain)\n  (:requirements :strips)\n  (:predicates (p))\n  (:action example\n    :parameters ()\n    :precondition (p)\n    :effect (not (p))))`
        : type === 'problem'
        ? `(define (problem new-problem)\n  (:domain new-domain)\n  (:objects a)\n  (:init (p))\n  (:goal (not (p))))`
        : undefined
    };

    const updateFiles = (items: FileItem[]): FileItem[] => {
      return items.map(item => {
        if (item.id === parentId) {
          return { ...item, children: [...(item.children || []), newItem] };
        }
        if (item.children) {
          return { ...item, children: updateFiles(item.children) };
        }
        return item;
      });
    };

    setFiles(updateFiles(files));
    setExpandedFolders(prev => new Set(prev).add(parentId));
    setShowNewMenu(null);

    // Auto-save new files to DB
    if (type !== 'folder') {
      setPendingChanges(prev => new Set(prev).add(newId));
    }
  };

  const deleteFile = async (id: string) => {
    const file = findFileById(files, id);
    
    // Delete from database if it exists there
    if (file?.dbId) {
      const success = await deleteProject(file.dbId);
      if (!success) return;
    }

    const deleteFromTree = (items: FileItem[]): FileItem[] => {
      return items.filter(item => item.id !== id).map(item => {
        if (item.children) {
          return { ...item, children: deleteFromTree(item.children) };
        }
        return item;
      });
    };

    setFiles(deleteFromTree(files));
    if (selectedFile === id) setSelectedFile(null);
  };

  const renameFile = async (id: string, newName: string) => {
    const file = findFileById(files, id);
    
    const updateName = (items: FileItem[]): FileItem[] => {
      return items.map(item => {
        if (item.id === id) return { ...item, name: newName };
        if (item.children) return { ...item, children: updateName(item.children) };
        return item;
      });
    };
    setFiles(updateName(files));
    setEditingFile(null);

    // Update in database if saved
    if (file?.dbId) {
      await updateProject(file.dbId, file.content || '', newName);
    }
  };

  const updateFileContent = async (id: string, content: string) => {
    const updateContent = (items: FileItem[]): FileItem[] => {
      return items.map(item => {
        if (item.id === id) return { ...item, content };
        if (item.children) return { ...item, children: updateContent(item.children) };
        return item;
      });
    };
    setFiles(updateContent(files));
    setPendingChanges(prev => new Set(prev).add(id));
  };

  const saveCurrentFile = async () => {
    const file = findFileById(files, selectedFile || '');
    if (!file || file.type === 'folder') return;
    
    await saveFileToDb(file);
  };

  const exportFiles = () => {
    const dataStr = JSON.stringify(files, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'strips-projects.json';
    link.click();
  };

  const importFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        // Import each project to database
        for (const item of imported) {
          if (item.children) {
            for (const child of item.children) {
              if (child.type === 'domain' || child.type === 'problem') {
                await createProject({
                  project_name: child.name,
                  project_type: child.type,
                  folder_path: '',
                  content: child.content || '',
                });
              }
            }
          }
        }
        await fetchProjects();
      } catch (err) {
        alert('Failed to import files. Invalid JSON.');
      }
    };
    reader.readAsText(file);
  };

  const renderFileTree = (items: FileItem[], depth = 0) => {
    return items.map(item => (
      <div key={item.id}>
        <div
          className={`flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer ${
            selectedFile === item.id ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {item.type === 'folder' && (
            <button onClick={(e) => { e.stopPropagation(); toggleFolder(item.id); }} className="p-0.5">
              {expandedFolders.has(item.id) ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}
          {item.type === 'folder' && <Folder className="w-4 h-4 text-yellow-500" />}
          {item.type === 'domain' && <File className="w-4 h-4 text-blue-500" />}
          {item.type === 'problem' && <File className="w-4 h-4 text-green-500" />}
          
          {editingFile === item.id ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => renameFile(item.id, editName)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') renameFile(item.id, editName);
                if (e.key === 'Escape') setEditingFile(null);
              }}
              className="flex-1 text-sm border rounded px-1"
              autoFocus
            />
          ) : (
            <span className="flex-1 text-sm truncate flex items-center gap-1" onClick={() => handleFileClick(item)}>
              {item.name}
              {pendingChanges.has(item.id) && <span className="w-2 h-2 bg-orange-400 rounded-full" title="Unsaved changes" />}
            </span>
          )}

          {item.type === 'folder' && (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowNewMenu(showNewMenu === item.id ? null : item.id); }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <Plus className="w-3 h-3" />
              </button>
              {showNewMenu === item.id && (
                <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow-lg z-10 min-w-[120px]">
                  <button onClick={() => createNewItem(item.id, 'folder')} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2">
                    <FolderPlus className="w-3 h-3" /> Folder
                  </button>
                  <button onClick={() => createNewItem(item.id, 'domain')} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2">
                    <FilePlus className="w-3 h-3" /> Domain
                  </button>
                  <button onClick={() => createNewItem(item.id, 'problem')} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2">
                    <FilePlus className="w-3 h-3" /> Problem
                  </button>
                </div>
              )}
            </div>
          )}

          <button onClick={(e) => { e.stopPropagation(); setEditingFile(item.id); setEditName(item.name); }} className="p-1 hover:bg-gray-200 rounded">
            <Edit2 className="w-3 h-3" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); deleteFile(item.id); }} className="p-1 hover:bg-red-100 text-red-500 rounded">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {item.type === 'folder' && expandedFolders.has(item.id) && item.children && (
          <div>{renderFileTree(item.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  const selectedFileData = selectedFile ? findFileById(files, selectedFile) : null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <h2 className="text-sm font-semibold text-gray-700">My Files</h2>
        <div className="flex gap-1">
          <button 
            onClick={() => fetchProjects()} 
            className="p-1.5 hover:bg-gray-100 rounded" 
            title="Refresh"
            disabled={isLoadingProjects}
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${isLoadingProjects ? 'animate-spin' : ''}`} />
          </button>
          <label className="p-1.5 hover:bg-gray-100 rounded cursor-pointer" title="Import">
            <Upload className="w-4 h-4 text-gray-600" />
            <input type="file" accept=".json" onChange={importFiles} className="hidden" />
          </label>
          <button onClick={exportFiles} className="p-1.5 hover:bg-gray-100 rounded" title="Export">
            <Download className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoadingProjects ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
          </div>
        ) : (
          renderFileTree(files)
        )}
      </div>

      {selectedFileData && selectedFileData.type !== 'folder' && (
        <div className="border-t h-1/2 flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
            <span className="text-sm font-medium">{selectedFileData.name}</span>
            <div className="flex items-center gap-2">
              {pendingChanges.has(selectedFileData.id) && (
                <span className="text-xs text-orange-500">Unsaved</span>
              )}
              <button
                onClick={saveCurrentFile}
                disabled={!pendingChanges.has(selectedFileData.id) || isLoadingProjects}
                className="flex items-center gap-1 px-2 py-1 bg-primary-500 text-white text-xs rounded hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-3 h-3" />
                Save
              </button>
            </div>
          </div>
          <textarea
            value={selectedFileData.content || ''}
            onChange={(e) => updateFileContent(selectedFileData.id, e.target.value)}
            className="flex-1 p-3 font-mono text-xs resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
      )}

      <div className="p-3 border-t text-xs text-gray-500">
        <p>💡 Click a file to load it into the editor</p>
        <p>💡 Click + to create new files/folders</p>
        <p>💡 Files sync to your account automatically</p>
      </div>
    </div>
  );
}
