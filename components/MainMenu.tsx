import React, { useRef } from 'react';
import { initAudio } from '../services/audioService';

interface MainMenuProps {
  onStart: () => void;
  onUpload: (files: FileList) => void;
  customImageCount: number;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, onUpload, customImageCount }) => {
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
        {/* Title */}
        <h1 className="text-7xl font-fredoka font-bold text-transparent bg-clip-text bg-gradient-to-br from-pink-500 to-orange-400 mb-2 drop-shadow-md">
          Fruit Splash!
        </h1>
        <p className="text-slate-500 font-bold text-xl mb-12">
          Slice with your fingers! 🍉 
        </p>
      
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_10px_0_rgba(0,0,0,0.1)] max-w-sm w-full mx-auto border-4 border-slate-100">
          <p className="text-slate-500 mb-8 font-semibold">
            Point your camera, wave your hands, and make some juice!
          </p>

          <button
            onClick={handleStart}
            className="w-full bg-green-400 hover:bg-green-500 text-white font-fredoka font-bold py-4 px-8 rounded-full text-2xl transition-all transform active:scale-95 shadow-[0_6px_0_#15803d] active:shadow-none mb-6 border-2 border-green-500"
          >
            PLAY NOW! ▶
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
              <span>📸 Upload Photos</span>
            </button>
            {customImageCount > 0 && (
              <span className="block mt-2 text-xs text-green-500 font-bold bg-green-100 px-2 py-1 rounded-full inline-block">
                {customImageCount} custom fruits ready!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;