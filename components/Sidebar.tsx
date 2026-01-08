
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'generator', label: '프롬프트 빌더(Prompt Builder)', icon: 'fa-wand-magic-sparkles' },
    { id: 'library', label: '템플릿 라이브러리(Template Library)', icon: 'fa-images' },
    { id: 'analyzer', label: '이미지 분석(Image to Prompt)', icon: 'fa-magnifying-glass' },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <i className="fa-solid fa-camera-retro text-xl"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">UNFRAMER StudioPrompt</h1>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                currentView === item.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5`}></i>
              <span className="font-medium text-sm leading-tight">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-semibold">상태(Status)</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300">Gemini 활성화</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
