
import React, { useState, useRef } from 'react';
import { MOCK_TEMPLATES, EMPTY_PROMPT } from '../constants';
import { Template, PromptSection } from '../types';
import { parseStructuredPrompt } from '../geminiService';

const TemplateLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  
  // Contribution Form State
  const [newTitle, setNewTitle] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);
  const [fullPromptInput, setFullPromptInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [newPrompt, setNewPrompt] = useState<PromptSection>({...EMPTY_PROMPT});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFullPrompt = (p: PromptSection) => {
    return `[1. Purpose] ${p.purpose}\n\n[2. Characters]\n2.1 User: ${p.userPerson}\n2.2 Target: ${p.targetCharacter}\n2.3 Interaction: ${p.interaction}\n\n[3. Environment] ${p.environment}\n\n[4. Lighting] ${p.lighting}\n\n[5. Style] ${p.style}\n\n[6. Negative] ${p.negative}`;
  };

  const copyPrompt = (p: PromptSection, title: string) => {
    const full = formatFullPrompt(p);
    navigator.clipboard.writeText(full);
    alert(`${title} 프롬프트가 복사되었습니다!`);
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setNewImage(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      alert("이미지 파일만 업로드 가능합니다.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCover(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCover(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCover(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleAutoFill = async () => {
    if (!fullPromptInput.trim()) {
      alert("분석할 전체 프롬프트를 입력해주세요.");
      return;
    }
    setIsParsing(true);
    try {
      const result = await parseStructuredPrompt(fullPromptInput);
      setNewPrompt(result.prompt);
      // Auto-set title if it's empty or the user hasn't changed it significantly
      if (!newTitle || newTitle.length < 3) {
        setNewTitle(result.title);
      }
    } catch (error) {
      console.error("Parsing failed:", error);
      alert("프롬프트 분석에 실패했습니다.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleSaveTemplate = () => {
    if (!newTitle || !newImage || !newPrompt.purpose) {
      alert("제목, 이미지, 그리고 분석된 프롬프트 구성 내용이 필요합니다.");
      return;
    }

    const tpl: Template = {
      id: Date.now().toString(),
      title: newTitle,
      imageUrl: newImage,
      prompt: newPrompt,
      fullPrompt: formatFullPrompt(newPrompt)
    };

    setTemplates([tpl, ...templates]);
    setIsContributeOpen(false);
    // Reset
    setNewTitle('');
    setNewImage(null);
    setFullPromptInput('');
    setNewPrompt({...EMPTY_PROMPT});
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <div key={tpl.id} className="group bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 shadow-lg hover:shadow-indigo-500/10">
            <div className="relative h-48 overflow-hidden">
              <img src={tpl.imageUrl} alt={tpl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <h3 className="text-white font-bold text-lg">{tpl.title}</h3>
              </div>
            </div>
            <div className="p-5">
              <p className="text-slate-400 text-sm line-clamp-2 mb-6 italic text-center">"{tpl.prompt.purpose}"</p>
              <div className="flex items-center justify-between gap-4">
                <button 
                  onClick={() => setSelectedTemplate(tpl)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded-lg text-xs font-medium transition-colors"
                >
                  상세 정보(Details)
                </button>
                <button 
                  onClick={() => copyPrompt(tpl.prompt, tpl.title)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-copy"></i>
                  복사(Copy)
                </button>
              </div>
            </div>
          </div>
        ))}
        
        <div 
          onClick={() => setIsContributeOpen(true)}
          className="border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all cursor-pointer min-h-[300px] group"
        >
          <div className="w-12 h-12 bg-slate-800 group-hover:bg-indigo-600/20 rounded-full flex items-center justify-center mb-4 transition-colors">
            <i className="fa-solid fa-plus text-slate-400 group-hover:text-indigo-400"></i>
          </div>
          <p className="text-slate-500 group-hover:text-slate-300 font-medium text-sm transition-colors">템플릿 기여하기(Contribute)</p>
        </div>
      </div>

      {/* Template Details Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-circle-info text-indigo-400"></i>
                {selectedTemplate.title}
              </h2>
              <button onClick={() => setSelectedTemplate(null)} className="text-slate-500 hover:text-white transition-colors p-2">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-950/20">
              <div className="space-y-6">
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900">
                  <img src={selectedTemplate.imageUrl} alt={selectedTemplate.title} className="w-full object-contain" />
                </div>
                
                <div className="bg-slate-800/20 p-5 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                  <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest block mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-diagram-project"></i>
                    구조적 요약(Structural Summary)
                  </span>
                  <div className="space-y-3">
                    {Object.entries(selectedTemplate.prompt).map(([key, value]) => (
                      <div key={key} className="flex flex-col sm:flex-row sm:gap-4 pb-3 border-b border-slate-800 last:border-0 last:pb-0">
                        <span className="text-[9px] text-slate-500 font-black uppercase w-28 shrink-0 py-0.5 tracking-tighter">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed break-words">
                          {value || <span className="text-slate-700 italic">내용 없음</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <i className="fa-solid fa-terminal"></i>
                     최종 프롬프트(Final Prompt)
                   </span>
                   <button 
                    onClick={() => copyPrompt(selectedTemplate.prompt, selectedTemplate.title)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95"
                   >
                     <i className="fa-solid fa-copy"></i>
                     복사하기
                   </button>
                </div>
                <div className="flex-1 bg-slate-950/80 rounded-2xl p-6 border border-slate-800 font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap overflow-y-auto custom-scrollbar shadow-inner">
                  {formatFullPrompt(selectedTemplate.prompt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {isContributeOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-plus-circle text-indigo-400"></i>
                템플릿 추가하기
              </h2>
              <button onClick={() => setIsContributeOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              {/* Step 1: Input Raw Prompt and Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-10 border-b border-slate-800">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">1. 기초 정보 및 이미지</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="템플릿 제목 (예: 블레이드 러너 스타일)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`aspect-video w-full bg-slate-800/40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${
                      isDraggingCover 
                        ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]' 
                        : 'border-slate-700 hover:border-indigo-500/50'
                    }`}
                  >
                    {newImage ? (
                      <>
                        <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                        {isDraggingCover && (
                          <div className="absolute inset-0 bg-indigo-600/40 backdrop-blur-sm flex items-center justify-center">
                             <div className="text-white font-bold flex flex-col items-center gap-1">
                                <i className="fa-solid fa-plus-circle text-2xl"></i>
                                <span className="text-[10px]">이미지 교체</span>
                             </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center p-4 pointer-events-none">
                        <div className={`w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-2 transition-all ${isDraggingCover ? 'scale-110 bg-indigo-600/20' : ''}`}>
                          <i className={`fa-solid fa-cloud-arrow-up text-xl transition-colors ${isDraggingCover ? 'text-indigo-400' : 'text-slate-600'}`}></i>
                        </div>
                        <p className={`text-[10px] font-bold transition-colors ${isDraggingCover ? 'text-indigo-300' : 'text-slate-500'}`}>
                          {isDraggingCover ? "여기에 드롭하세요" : "대표 이미지 업로드"}
                        </p>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">2. 전체 프롬프트 입력 (자동 분석)</label>
                  <textarea 
                    value={fullPromptInput}
                    onChange={(e) => setFullPromptInput(e.target.value)}
                    placeholder="여기에 전체 프롬프트를 붙여넣으세요. Gemini AI가 8단계 구조를 분석하고 제목을 제안합니다."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:ring-1 focus:ring-indigo-500 outline-none h-[180px] placeholder:text-slate-700 transition-all"
                  />
                  <button 
                    onClick={handleAutoFill}
                    disabled={isParsing || !fullPromptInput.trim()}
                    className="w-full bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isParsing ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                    {isParsing ? "AI 분석 중..." : "프롬프트 분석 & 제목 자동 생성"}
                  </button>
                </div>
              </div>

              {/* Step 2: Review and Fine-tune parsed sections */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">3. 분석된 프롬프트 구성 확인 및 수정</label>
                  <div className="flex-1 h-px bg-slate-800"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Column 1 */}
                  <div className="space-y-4">
                    {['purpose', 'userPerson', 'targetCharacter', 'interaction'].map((field) => (
                      <div key={field}>
                        <label className="text-[9px] text-slate-600 uppercase font-bold mb-1 block">{field}</label>
                        <textarea 
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none h-16 transition-all"
                          value={(newPrompt as any)[field]}
                          onChange={(e) => setNewPrompt({...newPrompt, [field]: e.target.value})}
                        />
                      </div>
                    ))}
                  </div>
                  {/* Column 2 */}
                  <div className="space-y-4">
                    {['environment', 'lighting', 'style', 'negative'].map((field) => (
                      <div key={field}>
                        <label className="text-[9px] text-slate-600 uppercase font-bold mb-1 block">{field}</label>
                        <textarea 
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none h-16 transition-all"
                          value={(newPrompt as any)[field]}
                          onChange={(e) => setNewPrompt({...newPrompt, [field]: e.target.value})}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end gap-4 bg-slate-900/50 backdrop-blur-md">
              <button 
                onClick={() => setIsContributeOpen(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white transition-colors"
              >
                취소
              </button>
              <button 
                onClick={handleSaveTemplate}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
              >
                템플릿 저장하기(Save Template)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateLibrary;
