
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import PromptGenerator from './components/PromptGenerator';
import TemplateLibrary from './components/TemplateLibrary';
import ImageAnalyzer from './components/ImageAnalyzer';
import { ViewType } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('generator');

  const renderView = () => {
    switch (currentView) {
      case 'generator': return <PromptGenerator />;
      case 'library': return <TemplateLibrary />;
      case 'analyzer': return <ImageAnalyzer />;
      default: return <PromptGenerator />;
    }
  };

  const getTitle = () => {
    switch (currentView) {
      case 'generator': return '프롬프트 빌더(Prompt Builder)';
      case 'library': return '템플릿 라이브러리(Template Library)';
      case 'analyzer': return '이미지 분석(Image to Prompt)';
      default: return '';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      
      <main className="flex-1 ml-64 p-8 lg:p-12">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              <span>스튜디오(Studio)</span>
              <i className="fa-solid fa-chevron-right text-[8px]"></i>
              <span className="text-indigo-400">{getTitle()}</span>
            </nav>
            <h1 className="text-4xl font-black text-white tracking-tighter">
              {currentView === 'generator' && "시네마틱 BTS 제작(Cinematic BTS)"}
              {currentView === 'library' && "프롬프트 템플릿(Prompt Templates)"}
              {currentView === 'analyzer' && "비전 분석(Vision Analysis)"}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-colors border border-slate-700 uppercase tracking-wider">
               설정(Settings)
             </button>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {renderView()}
        </div>
      </main>

      <div className="fixed bottom-6 right-6 bg-slate-900/90 backdrop-blur-xl border border-slate-800 px-5 py-2.5 rounded-full flex items-center gap-4 shadow-2xl z-50">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase">모델(Model):</span>
          <span className="text-xs text-indigo-400 font-black">GEMINI 3 PRO</span>
        </div>
        <div className="w-px h-3 bg-slate-800"></div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase">상태(Status):</span>
          <span className="text-xs text-emerald-400 font-black">READY</span>
        </div>
      </div>
    </div>
  );
};

export default App;
