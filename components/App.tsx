import React, { useState, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import MainMenu from './components/MainMenu';
import GameOver from './components/GameOver';
import { GameState } from './types';
import { MAX_LIVES } from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [customImages, setCustomImages] = useState<string[]>([]);
  const [finalScore, setFinalScore] = useState(0);

  const handleStartGame = () => {
    setGameState(GameState.LOADING_VISION);
  };

  const handleUpload = (files: FileList) => {
    const newImages: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          newImages.push(e.target.result);
          if (newImages.length === files.length) {
            setCustomImages(prev => [...prev, ...newImages]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleGameOver = (score: number) => {
    setFinalScore(score);
  };

  const handleRestart = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
    setLives(MAX_LIVES);
  };

  const handleMenu = () => {
    setGameState(GameState.MENU);
  };

  return (
    <div className="relative w-full h-full overflow-hidden font-sans">
      {/* HUD (Heads Up Display) - Only visible when playing */}
      {gameState === GameState.PLAYING && (
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-30 pointer-events-none">
          {/* Score Bubble */}
          <div className="bg-white border-4 border-yellow-400 rounded-full px-6 py-2 shadow-[0_4px_0_rgba(0,0,0,0.1)] flex flex-col items-center animate-bounce-in">
            <span className="text-yellow-500 text-xs font-bold uppercase tracking-wider">Score</span>
            <span className="text-slate-700 font-fredoka font-bold text-3xl leading-none">
              {score}
            </span>
          </div>

          {/* Lives Hearts */}
          <div className="flex gap-2 p-2 bg-white bg-opacity-50 backdrop-blur-sm rounded-full border-2 border-white">
              {Array.from({ length: MAX_LIVES }).map((_, i) => (
                <span 
                  key={i} 
                  className={`text-3xl transition-all duration-300 transform ${i < lives ? 'scale-100 text-red-500 drop-shadow-sm' : 'scale-75 opacity-30 text-slate-400 grayscale'}`}
                >
                  ❤️
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Game Layer */}
      <GameCanvas 
        gameState={gameState} 
        setGameState={setGameState}
        customImages={customImages}
        onScoreUpdate={setScore}
        onLivesUpdate={setLives}
        onGameOver={handleGameOver}
      />

      {/* UI Layer */}
      {gameState === GameState.MENU && (
        <MainMenu 
          onStart={handleStartGame} 
          onUpload={handleUpload} 
          customImageCount={customImages.length} 
        />
      )}

      {gameState === GameState.GAME_OVER && (
        <GameOver 
          score={finalScore} 
          onRestart={handleRestart} 
          onMenu={handleMenu} 
        />
      )}
    </div>
  );
};

export default App;