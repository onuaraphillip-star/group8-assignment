import { ReactNode, useState } from 'react';
import { Github, BookOpen, Menu, X, Settings, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store';
import { LoginModal } from '../Auth/LoginModal';
import { RegisterModal } from '../Auth/RegisterModal';

interface LayoutProps {
  sidebar: ReactNode;
  main: ReactNode;
  rightPanel: ReactNode;
}

export function Layout({ sidebar, main, rightPanel }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const { user, isAuthenticated, logout } = useAuth();
  const { isLoginModalOpen, isRegisterModalOpen, setLoginModalOpen, setRegisterModalOpen, switchToRegister, switchToLogin } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Modals */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
        onSwitchToRegister={switchToRegister}
      />
      <RegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setRegisterModalOpen(false)} 
        onSwitchToLogin={switchToLogin}
      />

      {/* Modern Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="PlanLab" className="w-10 h-10 rounded-xl shadow-lg shadow-primary-500/30" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">PlanLab</h1>
              <p className="text-xs text-gray-500">Classical Planning Workbench</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/learn')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Learn</span>
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
          >
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <button
            onClick={() => navigate('/docs')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Docs</span>
          </button>
          
          {/* Auth Buttons */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div
                onClick={() => {
                  
                  window.location.href = '/profile';
                }}
                className="flex items-center gap-2 px-3 py-2 bg-primary-50 hover:bg-primary-100 rounded-lg transition-all cursor-pointer"
                title="My Profile"
              >
                <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-primary-700 hidden sm:inline">
                  {user?.username}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <button
                onClick={() => setLoginModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => setRegisterModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm hover:shadow transition-all"
              >
                <User className="w-4 h-4" />
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside 
          className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:relative z-30 w-72 h-full lg:h-auto lg:translate-x-0 bg-white border-r border-gray-200 overflow-hidden transition-transform duration-300 flex flex-col`}
        >
          <div className="flex-1 overflow-y-auto">
            {sidebar}
          </div>
        </aside>
        
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Center - Editor/Visualization */}
        <main className="flex-1 overflow-hidden bg-gray-50/50">
          {main}
        </main>

        {/* Right Panel */}
        <aside 
          className={`${rightPanelOpen ? 'w-80' : 'w-0'} hidden lg:flex bg-white border-l border-gray-200 overflow-hidden transition-all duration-300 flex-col`}
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Details</span>
            <button 
              onClick={() => setRightPanelOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {rightPanel}
          </div>
        </aside>
      </div>

      {/* Toggle buttons for collapsed panels */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-20 z-30 p-2 bg-white shadow-lg rounded-lg border border-gray-200 hover:shadow-xl transition-shadow"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      )}
      {!rightPanelOpen && (
        <button
          onClick={() => setRightPanelOpen(true)}
          className="fixed right-4 top-20 z-30 p-2 bg-white shadow-lg rounded-lg border border-gray-200 hover:shadow-xl transition-shadow"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      )}
    </div>
  );
}
