
import { useMemo, useCallback } from 'react';
import { useFileExplorerStore } from '../../../stores/auto-claude/file-explorer-store';
import type { FileNode } from '../../../shared/types';

export interface FlattenedNode {
    key: string;
    node: FileNode;
    depth: number;
    isExpanded: boolean;
    isLoading: boolean;
}

export function useVirtualizedTree(rootPath: string) {
    const files = useFileExplorerStore((state) => state.files);
    const expandedFolders = useFileExplorerStore((state) => state.expandedFolders);
    const loadingMap = useFileExplorerStore((state) => state.isLoading);
    const toggleFolder = useFileExplorerStore((state) => state.toggleFolder);
    const loadDirectory = useFileExplorerStore((state) => state.loadDirectory);

    const isRootLoading = loadingMap.get(rootPath) || false;
    const hasRootFiles = files.has(rootPath);

    const flattenedNodes = useMemo(() => {
        const nodes: FlattenedNode[] = [];

        const processNode = (node: FileNode, depth: number) => {
            const isExpanded = expandedFolders.has(node.path);
            const isLoading = loadingMap.get(node.path) || false;

            nodes.push({
                key: node.path,
                node,
                depth,
                isExpanded,
                isLoading
            });

            if (node.isDirectory && isExpanded) {
                const children = files.get(node.path);
                if (children) {
                    children.forEach((child) => processNode(child, depth + 1));
                }
            }
        };

        const rootFiles = files.get(rootPath);
        if (rootFiles) {
            rootFiles.forEach((file) => processNode(file, 0));
        }

        return nodes;
    }, [files, expandedFolders, loadingMap, rootPath]);

    const handleToggle = useCallback((node: FileNode) => {
        if (node.isDirectory) {
            toggleFolder(node.path);
            if (!expandedFolders.has(node.path) && !files.has(node.path)) {
                loadDirectory(node.path);
            }
        }
    }, [toggleFolder, expandedFolders, files, loadDirectory]);

    return {
        flattenedNodes,
        count: flattenedNodes.length,
        handleToggle,
        isRootLoading,
        hasRootFiles
    };
}
