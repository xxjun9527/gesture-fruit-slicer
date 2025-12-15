import React from 'react';

interface GameOverProps {
  score: number;
  onRestart: () => void;
  onMenu: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, onRestart, onMenu }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-slate-900 bg-opacity-50 backdrop-blur-md animate-fade-in">
      <div className="relative bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-sm w-full border-8 border-pink-200 transform hover:scale-105 transition duration-500">
        
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-6xl">
          🥺
        </div>

        <h2 className="text-5xl font-fredoka font-bold text-slate-700 mt-6 mb-2">糟糕！</h2>
        <p className="text-xl text-slate-400 font-medium mb-6">水果掉了！</p>
        
        <div className="bg-yellow-50 rounded-2xl p-4 mb-8 border-2 border-yellow-200 border-dashed">
          <p className="text-yellow-600 font-bold uppercase text-xs mb-1">总得分</p>
          <p className="text-4xl font-black text-yellow-500">{score}</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={onRestart}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-fredoka font-bold py-3 px-6 rounded-full text-xl shadow-[0_4px_0_#be185d] active:shadow-none active:translate-y-1 transition-all"
          >
            再来一次 🔄
          </button>
          <button
            onClick={onMenu}
            className="w-full bg-white hover:bg-slate-50 text-slate-500 font-bold py-3 px-6 rounded-full border-2 border-slate-200 transition-colors"
          >
            返回菜单
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
