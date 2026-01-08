
import React, { useState, useRef } from 'react';
import { PromptSection } from '../types';
import { EMPTY_PROMPT, EXAMPLE_PROMPT, KEYWORD_PRESETS } from '../constants';
import { optimizePrompt } from '../geminiService';

const PromptGenerator: React.FC = () => {
  const [formData, setFormData] = useState<PromptSection>(EMPTY_PROMPT);
  const [finalPrompt, setFinalPrompt] = useState<string>('');
  const [refImage, setRefImage] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [strictIdentity, setStrictIdentity] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof PromptSection, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addKeyword = (field: keyof PromptSection, keyword: string) => {
    setFormData(prev => {
      const current = prev[field].trim();
      if (!current) return { ...prev, [field]: keyword };
      if (current.toLowerCase().includes(keyword.toLowerCase())) return prev;
      return { ...prev, [field]: `${current}, ${keyword}` };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRefImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const constructFullPrompt = (data: PromptSection) => {
    const { purpose, userPerson, targetCharacter, interaction, environment, lighting, style, negative } = data;
    
    // Identity Preservation logic
    const identityConstraint = strictIdentity 
      ? `[CRITICAL CONSTRAINT: Maintain absolute pixel-perfect identity of Subject A from the reference image. NO facial modification, NO skin smoothing, NO age changes, and NO AI distortion of their unique features.] `
      : "";

    return `[1. Purpose & Shot Type] ${purpose || EXAMPLE_PROMPT.purpose}\n\n[2. Characters]\n2.1 User Control (Subject A): ${identityConstraint}${userPerson || "Maintain identity from reference image"}\n2.2 Target Character (Subject B): ${targetCharacter || EXAMPLE_PROMPT.targetCharacter}\n2.3 Interaction: ${interaction || EXAMPLE_PROMPT.interaction}\n\n[3. Environment & Setting] ${environment || EXAMPLE_PROMPT.environment}\n\n[4. Lighting & Atmosphere] ${lighting || EXAMPLE_PROMPT.lighting}\n\n[5. Style & Quality] ${style || EXAMPLE_PROMPT.style}\n\n[6. Negative Constraints] ${negative || EXAMPLE_PROMPT.negative}`;
  };

  const handleGenerate = () => {
    const result = constructFullPrompt(formData);
    setFinalPrompt(result);
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const optimized = await optimizePrompt(formData);
      setFormData(optimized);
      setFinalPrompt(constructFullPrompt(optimized));
    } catch (error) {
      console.error("Optimization failed:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const copyToClipboard = () => {
    if (!finalPrompt) {
      alert("먼저 프롬프트를 생성해주세요!");
      return;
    }
    navigator.clipboard.writeText(finalPrompt);
    alert("프롬프트가 복사되었습니다!");
  };

  const KeywordSelector = ({ field }: { field: keyof PromptSection }) => (
    <div className="mt-2 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar p-1">
      {KEYWORD_PRESETS[field].map((kw) => (
        <button
          key={kw}
          onClick={() => addKeyword(field, kw)}
          className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-400 hover:bg-indigo-600/40 hover:text-indigo-200 transition-all border border-slate-700 hover:border-indigo-500/50"
        >
          {kw}
        </button>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Reference and Results (Col Span 5) */}
      <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
        {/* Character Reference Section */}
        <section className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
              <i className="fa-solid fa-user-check text-indigo-400"></i>
              캐릭터 참조(Character Reference)
            </h2>
            {refImage && (
              <button 
                onClick={() => setRefImage(null)}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                삭제(Remove)
              </button>
            )}
          </div>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative h-[450px] w-full border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all overflow-hidden bg-slate-900/50 shadow-inner"
          >
            {refImage ? (
              <div className="w-full h-full p-2 flex items-center justify-center bg-slate-950/50">
                <img src={refImage} alt="Ref" className="max-w-full max-h-full object-contain drop-shadow-2xl" />
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-slate-700 group-hover:border-indigo-500/50">
                  <i className="fa-solid fa-id-card text-4xl text-slate-600 group-hover:text-indigo-400"></i>
                </div>
                <h3 className="text-slate-300 font-bold mb-2">참조 이미지 업로드</h3>
                <p className="text-slate-500 text-sm max-w-[200px] mx-auto">이미지의 일관성을 유지하기 위해 캐릭터의 정면 사진을 권장합니다.</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>
        </section>

        {/* Generation Results Section */}
        <section className="bg-indigo-900/10 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-sm flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-indigo-100 flex items-center gap-2">
              <i className="fa-solid fa-paper-plane"></i>
              생성 결과(Generation Output)
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {isOptimizing ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-sparkles"></i>}
                AI 최적화(Optimize)
              </button>
              <button 
                onClick={copyToClipboard}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-copy"></i>
                복사(Copy)
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {finalPrompt ? (
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 font-mono text-sm leading-relaxed text-slate-300 custom-scrollbar max-h-[600px] overflow-y-auto whitespace-pre-wrap animate-in fade-in zoom-in duration-300">
                {finalPrompt}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 italic text-sm text-center px-12 py-10 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                <i className="fa-solid fa-terminal text-4xl mb-6 opacity-20"></i>
                <p className="leading-relaxed">
                  우측 구성 요소를 작성하거나 <br/>
                  제안된 전문 키워드를 선택한 후 <br/>
                  <span className="text-indigo-400 font-bold">'최종 프롬프트 생성'</span> 버튼을 눌러주세요.
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-[11px] text-slate-400 flex items-start gap-3">
             <i className="fa-solid fa-circle-info text-indigo-400 mt-0.5"></i>
             <p>생성된 프롬프트는 Flux.1, Midjourney v6, SDXL 등 최신 시네마틱 모델에 최적화된 8단계 구조를 따릅니다.</p>
          </div>
        </section>
      </div>

      {/* Right Column: Prompt Construction (Col Span 7) */}
      <div className="lg:col-span-7">
        <section className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 space-y-6 shadow-xl relative pb-24">
          <div className="flex justify-between items-center border-b border-slate-700/50 pb-2 mb-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <i className="fa-solid fa-list-check text-indigo-400"></i>
              프롬프트 구성(Prompt Construction)
            </h2>
          </div>
          
          <div className="space-y-8">
            {/* 1. Format & Composition */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">1. 이미지 형식 및 구도(Format & Composition)</label>
              <textarea 
                value={formData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-all h-20 placeholder-slate-700"
                placeholder={`예시: ${EXAMPLE_PROMPT.purpose}`}
              />
              <KeywordSelector field="purpose" />
            </div>

            {/* 2.1 Subject A Control with Strict Toggle */}
            <div className="grid grid-cols-2 gap-4">
               <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">2.1 레퍼런스 인물 제어(Subject A)</label>
                  <button 
                    onClick={() => setStrictIdentity(!strictIdentity)}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] transition-all ${
                      strictIdentity 
                        ? 'bg-indigo-600/20 border-indigo-400 text-indigo-300 shadow-[0_0_10px_rgba(129,140,248,0.2)]' 
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                  >
                    <i className={`fa-solid ${strictIdentity ? 'fa-lock' : 'fa-lock-open'}`}></i>
                    {strictIdentity ? '엄격 모드(Strict)' : '일반(Normal)'}
                  </button>
                </div>
                <div className="relative">
                  <textarea 
                    value={formData.userPerson}
                    onChange={(e) => handleInputChange('userPerson', e.target.value)}
                    className={`w-full bg-slate-900/50 border rounded-lg p-3 text-sm focus:ring-1 outline-none h-24 transition-all placeholder-slate-700 ${
                      strictIdentity ? 'border-indigo-500/50 ring-1 ring-indigo-500/20' : 'border-slate-700 focus:ring-indigo-500'
                    }`}
                    placeholder={`예시: ${EXAMPLE_PROMPT.userPerson}`}
                  />
                  {strictIdentity && (
                    <div className="absolute top-2 right-2 text-indigo-400/30">
                      <i className="fa-solid fa-shield-halved text-lg"></i>
                    </div>
                  )}
                </div>
                <KeywordSelector field="userPerson" />
              </div>

              {/* 2.2 Subject B Character */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">2.2 캐릭터/배우(Subject B - Character)</label>
                <textarea 
                  value={formData.targetCharacter}
                  onChange={(e) => handleInputChange('targetCharacter', e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none h-24 placeholder-slate-700"
                  placeholder={`예시: ${EXAMPLE_PROMPT.targetCharacter}`}
                />
                <KeywordSelector field="targetCharacter" />
              </div>
            </div>

            {/* 2.3 Interaction */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">2.3 행동 및 상호작용(Interaction & Pose)</label>
              <textarea 
                value={formData.interaction}
                onChange={(e) => handleInputChange('interaction', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none placeholder-slate-700 h-16"
                placeholder={`예시: ${EXAMPLE_PROMPT.interaction}`}
              />
              <KeywordSelector field="interaction" />
            </div>

            {/* 3. Environment */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">3. 배경 및 설정(Context & Setting)</label>
              <textarea 
                value={formData.environment}
                onChange={(e) => handleInputChange('environment', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none h-20 placeholder-slate-700"
                placeholder={`예시: ${EXAMPLE_PROMPT.environment}`}
              />
              <KeywordSelector field="environment" />
            </div>

            {/* 4 & 5 Lighting and Style */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">4. 조명 및 분위기(Lighting & Atmosphere)</label>
                <textarea 
                  value={formData.lighting}
                  onChange={(e) => handleInputChange('lighting', e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none placeholder-slate-700 h-20"
                  placeholder={`예시: ${EXAMPLE_PROMPT.lighting}`}
                />
                <KeywordSelector field="lighting" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">5. 스타일 및 품질(Style & Quality)</label>
                <textarea 
                  value={formData.style}
                  onChange={(e) => handleInputChange('style', e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none placeholder-slate-700 h-20"
                  placeholder={`예시: ${EXAMPLE_PROMPT.style}`}
                />
                <KeywordSelector field="style" />
              </div>
            </div>

            {/* 6. Negative */}
            <div>
              <label className="text-[11px] font-bold text-red-400/70 uppercase tracking-widest mb-2 block">6. 부정 프롬프트(Negative Prompt)</label>
              <textarea 
                value={formData.negative}
                onChange={(e) => handleInputChange('negative', e.target.value)}
                className="w-full bg-slate-900/50 border border-red-900/30 rounded-lg p-3 text-sm focus:ring-1 focus:ring-red-500/50 outline-none h-20 placeholder-slate-700"
                placeholder={`예시: ${EXAMPLE_PROMPT.negative}`}
              />
              <KeywordSelector field="negative" />
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <button 
              onClick={handleGenerate}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              최종 프롬프트 생성(Generate Prompt)
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PromptGenerator;
