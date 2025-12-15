import React, { useRef } from 'react';
import { initAudio } from '../services/audioService';

interface MainMenuProps {
  onStart: () => void;
  onUpload: (files: FileList) => void;
  customImageCount: number;
  preferVision: boolean;
  onToggleVision: () => void;
  visionQuality: 'lite' | 'standard';
  onToggleVisionQuality: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, onUpload, customImageCount, preferVision, onToggleVision, visionQuality, onToggleVisionQuality }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStart = () => {
    initAudio(); 
    onStart();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-yellow-100 bg-opacity-80 backdrop-blur-sm">
      <div className="relative z-10 text-center animate-float">
        <h1 className="text-7xl font-fredoka font-bold text-transparent bg-clip-text bg-gradient-to-br from-pink-500 to-orange-400 mb-2 drop-shadow-md">
          切水果不止于水果
        </h1>
        <p className="text-slate-500 font-bold text-xl mb-12">
          🍉用手指来切水果🍉
        </p>
      
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_10px_0_rgba(0,0,0,0.1)] max-w-sm w-full mx-auto border-4 border-slate-100">
          <p className="text-slate-500 mb-8 font-semibold">
            打开摄像头，挥动你的手，榨点果汁吧！
          </p>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-600 font-semibold">摄像头手势识别</span>
            <button
              onClick={onToggleVision}
              className={`px-3 py-1 rounded-full text-sm font-bold ${preferVision ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}
            >
              {preferVision ? '已启用' : '已关闭'}
            </button>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-600 font-semibold">识别质量</span>
            <button
              onClick={onToggleVisionQuality}
              disabled={!preferVision}
              className={`px-3 py-1 rounded-full text-sm font-bold ${visionQuality === 'standard' ? 'bg-purple-100 text-purple-600 border border-purple-200' : 'bg-slate-100 text-slate-600 border border-slate-200'} ${!preferVision ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {visionQuality === 'standard' ? '标准' : '轻量'}
            </button>
          </div>

          <button
            onClick={handleStart}
            className="w-full bg-green-400 hover:bg-green-500 text-white font-fredoka font-bold py-4 px-8 rounded-full text-2xl transition-all transform active:scale-95 shadow-[0_6px_0_#15803d] active:shadow-none mb-6 border-2 border-green-500"
          >
            开始游戏 ▶
          </button>

          <div className="pt-4 border-t-2 border-slate-100 border-dashed">
            <input
              type="file"
              accept="image/png, image/jpeg"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-blue-100 hover:bg-blue-200 text-blue-500 font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm border-2 border-blue-200 border-dashed"
            >
              <span>📸 上传图片</span>
            </button>
            {customImageCount == 0 && (
              <span className="block mt-2 text-xs text-green-500 font-bold bg-green-100 px-2 py-1 rounded-full inline-block">
                上传的图片将会替换默认水果图片，最多上传3张
              </span>
            )}
            {customImageCount > 0 && (
              <span className="block mt-2 text-xs text-green-500 font-bold bg-green-100 px-2 py-1 rounded-full inline-block">
                {customImageCount} 个自定义水果已准备
              </span>
            )}
            <p className="mt-3 text-xs text-slate-500 leading-relaxed">
              免责声明：用户上传的内容仅在本地设备前端临时显示，平台不保存、不传播。禁止上传色情、暴力、违法、侵权等不良图片。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
