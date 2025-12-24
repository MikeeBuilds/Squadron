/**
 * Squadron 3.0 - Powered by Auto-Claude UI
 * 
 * This is the main application component, based on Auto-Claude's architecture
 * with Squadron's integrations (Jira, Linear, Slack, Discord).
 */

import { useState, useEffect } from 'react';
import { Settings2 } from 'lucide-react';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    horizontalListSortingStrategy
} from '@dnd-kit/sortable';

// Auto-Claude Components
import { TooltipProvider } from './components/auto-claude/ui/tooltip';
import { Button } from './components/auto-claude/ui/button';

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from './components/auto-claude/ui/tooltip';
import { Sidebar, type SidebarView } from './components/auto-claude/Sidebar';
import { KanbanBoard } from './components/auto-claude/KanbanBoard';
import { TaskDetailModal } from './components/auto-claude/task-detail/TaskDetailModal';
import { TaskCreationWizard } from './components/auto-claude/TaskCreationWizard';
import { AppSettingsDialog } from './components/auto-claude/settings/AppSettings';
import { TerminalGrid } from './components/auto-claude/TerminalGrid';
import { Roadmap } from './components/auto-claude/Roadmap';
import { Context } from './components/auto-claude/Context';
import { Ideation } from './components/auto-claude/Ideation';
import { Insights } from './components/auto-claude/Insights';
import { GitHubIssues } from './components/auto-claude/GitHubIssues';
import { Changelog } from './components/auto-claude/Changelog';
import { Worktrees } from './components/auto-claude/Worktrees';
import { WelcomeScreen } from './components/auto-claude/WelcomeScreen';
import { OnboardingWizard } from './components/auto-claude/onboarding';
import { UsageIndicator } from './components/auto-claude/UsageIndicator';
import { ProjectTabBar } from './components/auto-claude/ProjectTabBar';

// Auto-Claude Stores
import { useProjectStore, loadProjects, addProject } from './stores/auto-claude/project-store';
import { useTaskStore, loadTasks } from './stores/auto-claude/task-store';
import { useSettingsStore, loadSettings } from './stores/auto-claude/settings-store';


// Shared types and constants
import type { Task, Project } from './shared/types';

export function App() {
    // Stores
    const projects = useProjectStore((state) => state.projects);
    const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
    const activeProjectId = useProjectStore((state) => state.activeProjectId);
    const getProjectTabs = useProjectStore((state) => state.getProjectTabs);

    const openProjectTab = useProjectStore((state) => state.openProjectTab);
    const closeProjectTab = useProjectStore((state) => state.closeProjectTab);
    const setActiveProject = useProjectStore((state) => state.setActiveProject);
    const reorderTabs = useProjectStore((state) => state.reorderTabs);
    const tasks = useTaskStore((state) => state.tasks);
    const settings = useSettingsStore((state) => state.settings);
    const settingsLoading = useSettingsStore((state) => state.isLoading);

    // UI State
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
    const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

    const [activeView, setActiveView] = useState<SidebarView>('kanban');
    const [isOnboardingWizardOpen, setIsOnboardingWizardOpen] = useState(false);

    // Setup drag sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Track dragging state for overlay
    const [activeDragProject, setActiveDragProject] = useState<Project | null>(null);

    // Get tabs and selected project
    const projectTabs = getProjectTabs();
    const selectedProject = projects.find((p) => p.id === (activeProjectId || selectedProjectId));

    // Initial load
    useEffect(() => {
        loadProjects();
        loadSettings();
    }, []);

    // Track if settings have been loaded at least once
    const [settingsHaveLoaded, setSettingsHaveLoaded] = useState(false);

    // Mark settings as loaded when loading completes
    useEffect(() => {
        if (!settingsLoading && !settingsHaveLoaded) {
            setSettingsHaveLoaded(true);
        }
    }, [settingsLoading, settingsHaveLoaded]);

    // First-run detection - show onboarding wizard if not completed
    useEffect(() => {
        if (settingsHaveLoaded && settings.onboardingCompleted === false) {
            setIsOnboardingWizardOpen(true);
        }
    }, [settingsHaveLoaded, settings.onboardingCompleted]);

    // Load tasks when project changes
    useEffect(() => {
        const currentProjectId = activeProjectId || selectedProjectId;
        if (currentProjectId) {
            loadTasks(currentProjectId);
            setSelectedTask(null);
        } else {
            useTaskStore.getState().clearTasks();
        }
    }, [activeProjectId, selectedProjectId]);

    // Apply theme on load
    useEffect(() => {
        const root = document.documentElement;

        const applyTheme = () => {
            if (settings.theme === 'dark') {
                root.classList.add('dark');
            } else if (settings.theme === 'light') {
                root.classList.remove('dark');
            } else {
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            }
        };

        applyTheme();
    }, [settings.theme, settings.colorTheme]);

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
    };

    const handleCloseTaskDetail = () => {
        setSelectedTask(null);
    };

    const handleAddProject = async () => {
        try {
            const path = await (window as any).electronAPI.selectDirectory();
            if (path) {
                const project = await addProject(path);
                if (project) {
                    openProjectTab(project.id);
                }
            }
        } catch (error) {
            console.error('Failed to add project:', error);
        }
    };

    const handleProjectTabSelect = (projectId: string) => {
        setActiveProject(projectId);
    };

    const handleProjectTabClose = (projectId: string) => {
        closeProjectTab(projectId);
    };

    const handleDragStart = (event: any) => {
        const { active } = event;
        const draggedProject = projectTabs.find(p => p.id === active.id);
        if (draggedProject) {
            setActiveDragProject(draggedProject);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragProject(null);

        if (!over) return;

        const oldIndex = projectTabs.findIndex(p => p.id === active.id);
        const newIndex = projectTabs.findIndex(p => p.id === over.id);

        if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
            reorderTabs(oldIndex, newIndex);
        }
    };

    const handleGoToTask = (taskId: string) => {
        setActiveView('kanban');
        const task = tasks.find((t) => t.id === taskId || t.specId === taskId);
        if (task) {
            setSelectedTask(task);
        }
    };

    return (
        <TooltipProvider>
            <div className="flex h-screen bg-background text-foreground">
                {/* Sidebar */}
                <Sidebar
                    onSettingsClick={() => setIsSettingsDialogOpen(true)}
                    onNewTaskClick={() => setIsNewTaskDialogOpen(true)}
                    activeView={activeView}
                    onViewChange={setActiveView}
                />

                {/* Main content */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Project Tabs */}
                    {projectTabs.length > 0 && (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext items={projectTabs.map(p => p.id)} strategy={horizontalListSortingStrategy}>
                                <ProjectTabBar
                                    projects={projectTabs}
                                    activeProjectId={activeProjectId}
                                    onProjectSelect={handleProjectTabSelect}
                                    onProjectClose={handleProjectTabClose}
                                    onAddProject={handleAddProject}
                                />
                            </SortableContext>

                            <DragOverlay>
                                {activeDragProject && (
                                    <div className="flex items-center gap-2 bg-card border border-border rounded-md px-4 py-2.5 shadow-lg max-w-[200px]">
                                        <div className="w-1 h-4 bg-muted-foreground rounded-full" />
                                        <span className="truncate font-medium text-sm">
                                            {activeDragProject.name}
                                        </span>
                                    </div>
                                )}
                            </DragOverlay>
                        </DndContext>
                    )}

                    {/* Header */}
                    <header className="electron-drag flex h-14 items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-6">
                        <div className="electron-no-drag">
                            {selectedProject ? (
                                <h1 className="font-semibold text-foreground">{selectedProject.name}</h1>
                            ) : (
                                <div className="text-muted-foreground">
                                    Select a project to get started
                                </div>
                            )}
                        </div>
                        {selectedProject && (
                            <div className="electron-no-drag flex items-center gap-3">
                                <UsageIndicator />
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIsSettingsDialogOpen(true)}
                                        >
                                            <Settings2 className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Settings</TooltipContent>
                                </Tooltip>
                            </div>
                        )}
                    </header>

                    {/* Main content area */}
                    <main className="flex-1 overflow-hidden">
                        {selectedProject ? (
                            <>
                                {activeView === 'kanban' && (
                                    <KanbanBoard
                                        tasks={tasks}
                                        onTaskClick={handleTaskClick}
                                        onNewTaskClick={() => setIsNewTaskDialogOpen(true)}
                                    />
                                )}
                                <div className={activeView === 'terminals' ? 'h-full' : 'hidden'}>
                                    <TerminalGrid
                                        projectPath={selectedProject?.path}
                                        onNewTaskClick={() => setIsNewTaskDialogOpen(true)}
                                        isActive={activeView === 'terminals'}
                                    />
                                </div>
                                {activeView === 'roadmap' && (activeProjectId || selectedProjectId) && (
                                    <Roadmap projectId={activeProjectId || selectedProjectId!} onGoToTask={handleGoToTask} />
                                )}
                                {activeView === 'context' && (activeProjectId || selectedProjectId) && (
                                    <Context projectId={activeProjectId || selectedProjectId!} />
                                )}
                                {activeView === 'ideation' && (activeProjectId || selectedProjectId) && (
                                    <Ideation projectId={activeProjectId || selectedProjectId!} onGoToTask={handleGoToTask} />
                                )}
                                {activeView === 'insights' && (activeProjectId || selectedProjectId) && (
                                    <Insights projectId={activeProjectId || selectedProjectId!} />
                                )}
                                {activeView === 'github-issues' && (activeProjectId || selectedProjectId) && (
                                    <GitHubIssues
                                        onOpenSettings={() => setIsSettingsDialogOpen(true)}
                                        onNavigateToTask={handleGoToTask}
                                    />
                                )}
                                {activeView === 'changelog' && (activeProjectId || selectedProjectId) && (
                                    <Changelog />
                                )}
                                {activeView === 'worktrees' && (activeProjectId || selectedProjectId) && (
                                    <Worktrees projectId={activeProjectId || selectedProjectId!} />
                                )}
                            </>
                        ) : (
                            <WelcomeScreen
                                projects={projects}
                                onNewProject={handleAddProject}
                                onOpenProject={handleAddProject}
                                onSelectProject={(projectId) => {
                                    openProjectTab(projectId);
                                }}
                            />
                        )}
                    </main>
                </div>

                {/* Task detail modal */}
                <TaskDetailModal
                    open={!!selectedTask}
                    task={selectedTask}
                    onOpenChange={(open) => !open && handleCloseTaskDetail()}
                />

                {/* Dialogs */}
                {(activeProjectId || selectedProjectId) && (
                    <TaskCreationWizard
                        projectId={activeProjectId || selectedProjectId!}
                        open={isNewTaskDialogOpen}
                        onOpenChange={setIsNewTaskDialogOpen}
                    />
                )}

                {/* Onboarding Wizard */}
                <AppSettingsDialog
                    open={isSettingsDialogOpen}
                    onOpenChange={setIsSettingsDialogOpen}
                />
                <OnboardingWizard
                    open={isOnboardingWizardOpen}
                    onOpenChange={setIsOnboardingWizardOpen}
                    onOpenTaskCreator={() => {
                        setIsOnboardingWizardOpen(false);
                        setIsNewTaskDialogOpen(true);
                    }}
                    onOpenSettings={() => {
                        setIsOnboardingWizardOpen(false);
                        setIsSettingsDialogOpen(true);
                    }}
                />
            </div>
        </TooltipProvider>
    );
}

export default App;
