import React, { useState, useCallback, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import MainMenu from './components/MainMenu';
import GameOver from './components/GameOver';
import { GameState } from './types';
import { MAX_LIVES } from './constants';
import { startBGM, stopBGM } from './services/audioService';
import type { VisionQuality } from './services/visionService';
import { prefetchVisionAssets } from './services/prefetchService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [customImages, setCustomImages] = useState<string[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const [preferVision, setPreferVision] = useState<boolean>(!isMobile);
  const [visionQuality, setVisionQuality] = useState<VisionQuality>(isMobile ? 'lite' : 'standard');

  const handleStartGame = () => {
    // If we haven't loaded vision yet, it goes MENU -> LOADING -> PLAYING inside GameCanvas
    // If we restart, we go PLAYING -> GAMEOVER -> PLAYING (Vision is kept alive in service)
    setGameState(GameState.LOADING_VISION);
  };

  const handleUpload = (files: FileList) => {
    const newImages: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          newImages.push(e.target.result);
          // Only update state when last one is processed to avoid flicker
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

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      startBGM();
    } else {
      stopBGM();
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === GameState.MENU) {
      prefetchVisionAssets();
    }
  }, [gameState]);

  return (
    <div className="relative w-full h-full overflow-hidden font-sans">
      {/* HUD (Heads Up Display) - Only visible when playing */}
      {gameState === GameState.PLAYING && (
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-30 pointer-events-none">
          <div className="flex flex-col gap-1">
            <span className="text-yellow-400 font-bold text-3xl drop-shadow-md">得分：{score}</span>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <span 
                key={i} 
                className={`text-3xl transition-opacity duration-300 ${i < lives ? 'opacity-100 text-red-500' : 'opacity-20 text-gray-500'}`}
              >
                ♥
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Game Layer */}
      <GameCanvas 
        gameState={gameState} 
        setGameState={setGameState}
        preferVision={preferVision}
        visionQuality={visionQuality}
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
          preferVision={preferVision}
          onToggleVision={() => setPreferVision(v => !v)}
          visionQuality={visionQuality}
          onToggleVisionQuality={() => setVisionQuality(q => q === 'lite' ? 'standard' : 'lite')}
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
