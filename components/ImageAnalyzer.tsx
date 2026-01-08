
import React, { useState, useRef } from 'react';
import { analyzeImageForPrompt } from '../geminiService';
import { PromptSection } from '../types';

const ImageAnalyzer: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzedPrompt, setAnalyzedPrompt] = useState<PromptSection | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalyzedPrompt(null);
      };
      reader.readAsDataURL(file);
    } else {
      alert("이미지 파일만 업로드 가능합니다.");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const runAnalysis = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    try {
      const base64 = selectedImage.split(',')[1];
      const result = await analyzeImageForPrompt(base64);
      setAnalyzedPrompt(result);
    } catch (err) {
      console.error("Analysis failed", err);
      alert("분석에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = () => {
    if (!analyzedPrompt) return;
    const full = `[1. Purpose] ${analyzedPrompt.purpose}\n\n[2. Characters]\n2.1 User: ${analyzedPrompt.userPerson}\n2.2 Target: ${analyzedPrompt.targetCharacter}\n2.3 Interaction: ${analyzedPrompt.interaction}\n\n[3. Environment] ${analyzedPrompt.environment}\n\n[4. Lighting] ${analyzedPrompt.lighting}\n\n[5. Style] ${analyzedPrompt.style}\n\n[6. Negative] ${analyzedPrompt.negative}`;
    navigator.clipboard.writeText(full);
    alert("추출된 프롬프트가 복사되었습니다!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">이미지 분석(Image to Prompt)</h2>
        <p className="text-slate-400">시네마틱 이미지를 업로드하여 구조적 프롬프트를 역설계합니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`aspect-square w-full bg-slate-800/40 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group shadow-xl ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
                : 'border-slate-700 hover:border-indigo-500/50'
            }`}
          >
            {selectedImage ? (
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6 pointer-events-none">
                <div className={`w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${isDragging ? 'scale-110 bg-indigo-600/20' : ''}`}>
                  <i className={`fa-solid fa-cloud-arrow-up text-3xl transition-colors ${isDragging ? 'text-indigo-400' : 'text-slate-600'}`}></i>
                </div>
                <p className={`font-bold transition-colors ${isDragging ? 'text-indigo-300' : 'text-slate-400'}`}>
                  {isDragging ? "여기에 놓으세요" : "이미지 업로드(Upload)"}
                </p>
                <p className="text-xs text-slate-500 mt-2">클릭하거나 파일을 드래그하여 놓으세요</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
            
            {/* Visual overlay for dragging state when image is already selected */}
            {isDragging && selectedImage && (
              <div className="absolute inset-0 bg-indigo-600/40 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-white font-bold flex flex-col items-center gap-2">
                  <i className="fa-solid fa-plus-circle text-4xl"></i>
                  새 이미지 교체
                </div>
              </div>
            )}
          </div>
          
          <button 
            disabled={!selectedImage || isAnalyzing}
            onClick={runAnalysis}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-xl transition-all ${
              !selectedImage || isAnalyzing ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
            }`}
          >
            {isAnalyzing ? (
              <>
                <i className="fa-solid fa-spinner animate-spin"></i>
                AI 분석 중(Analyzing...)
              </>
            ) : (
              <>
                <i className="fa-solid fa-magnifying-glass-chart"></i>
                구조적 프롬프트 생성(Analyze)
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 min-h-[400px] relative shadow-xl">
          {!analyzedPrompt ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50 space-y-4">
              <i className="fa-solid fa-microscope text-5xl"></i>
              <p>분석 결과가 여기에 표시됩니다</p>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-indigo-400 uppercase tracking-widest text-xs">추출된 구조(Structure)</h3>
                <button 
                  onClick={copyToClipboard} 
                  className="bg-slate-700 hover:bg-slate-600 p-2.5 rounded-xl text-slate-300 transition-colors flex items-center gap-2 text-xs font-bold"
                >
                  <i className="fa-solid fa-copy"></i>
                  복사(Copy)
                </button>
              </div>
              <div className="space-y-4 text-sm flex-1 custom-scrollbar overflow-y-auto pr-2">
                {Object.entries(analyzedPrompt).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1 tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <p className="text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-xs leading-relaxed">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;
