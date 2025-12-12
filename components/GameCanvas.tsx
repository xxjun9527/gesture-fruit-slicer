import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, Entity, Particle, HandTrail, FruitConfig, Splatter, FloatingText } from '../types';
import { initializeVision, getLandmarker } from '../services/visionService';
import { playSwipe, playSlice, playExplosion } from '../services/audioService';
import { 
  GRAVITY, FRICTION, INITIAL_SPAWN_RATE, MIN_SPAWN_RATE, FRUIT_RADIUS, MAX_LIVES, TRAIL_LENGTH, 
  BOMB_PROBABILITY, BOMB_IMAGE_SRC, BOMB_COLOR, PARTICLE_COUNT, DEFAULT_FRUITS, 
  TRAIL_COLOR_LEFT, TRAIL_COLOR_RIGHT, SPLATTER_PATH, COMBO_WINDOW, SHAKE_INTENSITY_BOMB, 
  SHAKE_INTENSITY_COMBO, SHAKE_DECAY 
} from '../constants';
import { randomRange, lineIntersectsCircle, getAngle, distance } from '../utils/math';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  customImages: string[];
  onScoreUpdate: (score: number) => void;
  onLivesUpdate: (lives: number) => void;
  onGameOver: (finalScore: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  setGameState,
  customImages,
  onScoreUpdate,
  onLivesUpdate,
  onGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestRef = useRef<number>(0);
  
  // Timing
  const lastTimeRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef<number>(0);
  const spawnRateRef = useRef<number>(INITIAL_SPAWN_RATE);
  
  // Game State Refs (Mutable for performance in RAF)
  const fruitsRef = useRef<Entity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const trailsRef = useRef<Map<string, HandTrail>>(new Map());
  const splattersRef = useRef<Splatter[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  
  // Juice State
  const shakeIntensityRef = useRef<number>(0);
  const comboCountRef = useRef<number>(0);
  const lastSliceTimeRef = useRef<number>(0);

  // Stats
  const scoreRef = useRef<number>(0);
  const livesRef = useRef<number>(MAX_LIVES);
  const gameStartTimeRef = useRef<number>(0);
  
  // Assets
  const loadedImagesRef = useRef<FruitConfig[]>([]);
  const bombImageRef = useRef<HTMLImageElement | null>(null);
  
  // Audio throttling
  const lastSwipeSoundRef = useRef<number>(0);

  // Load assets helper
  const loadAssets = useCallback(async () => {
    // Load Bomb
    const bombImg = new Image();
    bombImg.src = BOMB_IMAGE_SRC;
    bombImageRef.current = bombImg;

    // Load Default Fruits
    const defaultPromises = DEFAULT_FRUITS.map(f => {
      return new Promise<FruitConfig>((resolve) => {
        const img = new Image();
        img.src = f.src;
        img.onload = () => resolve({ id: f.id, image: img, color: f.color });
      });
    });

    // Load Custom Fruits
    const customPromises = customImages.map((src, idx) => {
      return new Promise<FruitConfig>((resolve) => {
        const img = new Image();
        img.src = src;
        // Generate a random bright color for particles since we don't analyze the image
        const randomColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
        img.onload = () => resolve({ id: `custom-${idx}`, image: img, color: randomColor });
        img.onerror = () => resolve({ id: 'fallback', image: bombImg, color: '#ccc' }); // Fallback
      });
    });

    const loadedDefaults = await Promise.all(defaultPromises);
    const loadedCustoms = await Promise.all(customPromises);
    
    loadedImagesRef.current = [...loadedDefaults, ...loadedCustoms];
  }, [customImages]);

  // --- Spawning Logic ---
  
  const spawnEntity = (width: number, height: number) => {
    const isBomb = Math.random() < BOMB_PROBABILITY;
    const x = randomRange(width * 0.1, width * 0.9);
    const y = height + FRUIT_RADIUS; // Start below screen
    
    // Calculate velocity to throw it towards the center-ish, but with randomness
    const targetX = randomRange(width * 0.2, width * 0.8);
    const targetHeight = randomRange(height * 0.2, height * 0.5); // Top of arc
    
    // v^2 = u^2 + 2as. At top v=0. u = sqrt(-2as) -> vy
    const vy = -Math.sqrt(2 * GRAVITY * (height - targetHeight));
    
    // Time to reach top: t = -vy / a
    const t = -vy / GRAVITY;
    const vx = (targetX - x) / t;

    const entity: Entity = {
      id: Date.now() + Math.random(),
      x,
      y,
      vx,
      vy,
      rotation: 0,
      rotationSpeed: randomRange(-0.05, 0.05),
      radius: FRUIT_RADIUS,
      type: isBomb ? 'bomb' : 'fruit',
      isSliced: false,
      lifeTime: 0,
      config: !isBomb ? loadedImagesRef.current[Math.floor(Math.random() * loadedImagesRef.current.length)] : undefined
    };

    fruitsRef.current.push(entity);
  };

  const createConfetti = (x: number, y: number, baseColor: string) => {
    const palette = [baseColor, '#fbbf24', '#f472b6', '#38bdf8', '#a3e635']; 
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomRange(5, 12); // Faster particles
      particlesRef.current.push({
        id: Math.random(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color: palette[Math.floor(Math.random() * palette.length)],
        size: randomRange(4, 10)
      });
    }
  };

  const spawnFloatingText = (x: number, y: number, text: string, color: string, scale: number = 1.0) => {
    floatingTextsRef.current.push({
      id: Math.random(),
      x,
      y,
      text,
      color,
      life: 1.0,
      scale: 0.5, // Start small and pop up
      velocity: { x: randomRange(-1, 1), y: -3 }
    });
  };

  const spawnSplatter = (x: number, y: number, color: string) => {
    splattersRef.current.push({
      id: Math.random(),
      x,
      y,
      color,
      rotation: Math.random() * Math.PI * 2,
      scale: randomRange(1.5, 2.5),
      opacity: 0.8
    });
  };

  // --- Interaction Logic ---

  const handleSlice = (entity: Entity, angle: number) => {
    if (entity.isSliced) return;
    entity.isSliced = true;
    
    const now = performance.now();
    
    if (entity.type === 'bomb') {
      // BOMB HIT!
      playExplosion();
      livesRef.current = 0; 
      onLivesUpdate(0);
      createConfetti(entity.x, entity.y, '#374151');
      spawnFloatingText(entity.x, entity.y, "BOOM!", "#ef4444", 2.0);
      shakeIntensityRef.current = SHAKE_INTENSITY_BOMB;
    } else {
      // Fruit Hit
      playSlice();
      createConfetti(entity.x, entity.y, entity.config?.color || '#fff');
      spawnSplatter(entity.x, entity.y, entity.config?.color || '#f00');
      
      // Combo Logic
      if (now - lastSliceTimeRef.current < COMBO_WINDOW) {
        comboCountRef.current += 1;
      } else {
        comboCountRef.current = 1;
      }
      lastSliceTimeRef.current = now;

      // Base Score
      let points = 1;
      spawnFloatingText(entity.x, entity.y - 20, "+1", "#fbbf24");
      
      // Combo Bonus
      if (comboCountRef.current > 1) {
        points += comboCountRef.current;
        spawnFloatingText(entity.x, entity.y - 60, `${comboCountRef.current}x COMBO!`, "#c084fc", 1.5);
        shakeIntensityRef.current = Math.min(SHAKE_INTENSITY_COMBO, comboCountRef.current * 2);
      }

      scoreRef.current += points;
      onScoreUpdate(scoreRef.current);

      // Spawn Debris (Two halves)
      const separationSpeed = 4;
      
      const debris1: Entity = {
        ...entity,
        id: Date.now() + Math.random(),
        type: 'debris',
        isSliced: true,
        vx: entity.vx + Math.cos(angle - Math.PI/2) * separationSpeed,
        vy: entity.vy + Math.sin(angle - Math.PI/2) * separationSpeed,
        rotationSpeed: entity.rotationSpeed - 0.1,
        debrisData: { cutAngle: angle, side: -1 }
      };

      const debris2: Entity = {
        ...entity,
        id: Date.now() + Math.random() + 1,
        type: 'debris',
        isSliced: true,
        vx: entity.vx + Math.cos(angle + Math.PI/2) * separationSpeed,
        vy: entity.vy + Math.sin(angle + Math.PI/2) * separationSpeed,
        rotationSpeed: entity.rotationSpeed + 0.1,
        debrisData: { cutAngle: angle, side: 1 }
      };

      fruitsRef.current.push(debris1, debris2);
    }
    
    // Remove original immediately
    const idx = fruitsRef.current.indexOf(entity);
    if (idx !== -1) fruitsRef.current.splice(idx, 1);
  };

  // --- Update Loop ---

  const update = (timestamp: number, width: number, height: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    
    // Spawner
    if (timestamp - lastSpawnTimeRef.current > spawnRateRef.current) {
      for (let i = 0; i < 3; i++) {
        spawnEntity(width, height);
      }
      lastSpawnTimeRef.current = timestamp;
      const elapsed = timestamp - gameStartTimeRef.current;
      spawnRateRef.current = Math.max(MIN_SPAWN_RATE, INITIAL_SPAWN_RATE - (elapsed / 100));
    }

    // Shake Decay
    if (shakeIntensityRef.current > 0.5) {
      shakeIntensityRef.current *= SHAKE_DECAY;
    } else {
      shakeIntensityRef.current = 0;
    }

    // Update Entities
    for (let i = fruitsRef.current.length - 1; i >= 0; i--) {
      const f = fruitsRef.current[i];
      f.x += f.vx;
      f.y += f.vy;
      f.vy += GRAVITY;
      f.rotation += f.rotationSpeed;

      if (f.y > height + 200) {
        if (!f.isSliced && f.type === 'fruit') {
          livesRef.current -= 1;
          onLivesUpdate(livesRef.current);
          spawnFloatingText(f.x, height - 50, "MISS", "#94a3b8");
          // Reset combo on miss
          comboCountRef.current = 0; 
        }
        fruitsRef.current.splice(i, 1);
        continue;
      }
    }

    // Update Particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += GRAVITY * 0.5;
      p.life -= 0.02;
      if (p.life <= 0) {
        particlesRef.current.splice(i, 1);
      }
    }

    // Update Splatters
    for (let i = splattersRef.current.length - 1; i >= 0; i--) {
      const s = splattersRef.current[i];
      s.opacity -= 0.005; // Fade out slowly
      if (s.opacity <= 0) {
        splattersRef.current.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
      const ft = floatingTextsRef.current[i];
      ft.x += ft.velocity.x;
      ft.y += ft.velocity.y;
      ft.life -= 0.02;
      // Pop in effect
      if (ft.life > 0.8) {
          ft.scale += 0.1;
      } else {
          ft.scale -= 0.005;
      }
      
      if (ft.life <= 0) {
        floatingTextsRef.current.splice(i, 1);
      }
    }

    // Check Game Over
    if (livesRef.current <= 0) {
      setGameState(GameState.GAME_OVER);
      onGameOver(scoreRef.current);
    }
    
    lastTimeRef.current = timestamp;
  };

  // --- Draw Loop ---

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    
    // Apply Screen Shake
    if (shakeIntensityRef.current > 0) {
      const dx = (Math.random() - 0.5) * shakeIntensityRef.current;
      const dy = (Math.random() - 0.5) * shakeIntensityRef.current;
      ctx.translate(dx, dy);
    }

    // 1. Draw Splatters (Background Layer)
    splattersRef.current.forEach(s => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation);
      ctx.scale(s.scale, s.scale);
      ctx.globalAlpha = s.opacity;
      ctx.fillStyle = s.color;
      // Draw SVG path for splatter
      ctx.beginPath();
      const path = new Path2D(SPLATTER_PATH);
      // Center the path (approximate center of 100x100 bounding box of path)
      ctx.translate(-50, -50); 
      ctx.fill(path);
      ctx.restore();
    });
    
    // 2. Draw Fruits
    fruitsRef.current.forEach(f => {
      ctx.save();
      ctx.translate(f.x, f.y);
      
      const img = f.type === 'bomb' ? bombImageRef.current : f.config?.image;
      
      // Debris Rendering Logic
      if (f.type === 'debris' && f.debrisData) {
        ctx.rotate(f.debrisData.cutAngle);
        ctx.beginPath();
        if (f.debrisData.side === 1) {
             ctx.rect(-f.radius * 2, 0, f.radius * 4, f.radius * 2);
        } else {
             ctx.rect(-f.radius * 2, -f.radius * 2, f.radius * 4, f.radius * 2);
        }
        ctx.clip();
        ctx.rotate(-f.debrisData.cutAngle);
        ctx.rotate(f.rotation);
        
        if (img) {
          ctx.drawImage(img, -f.radius, -f.radius, f.radius * 2, f.radius * 2);
        }
      } else {
        // Normal Entity Rendering
        ctx.rotate(f.rotation);
        if (img) {
          // Add a white outline for cartoon effect
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(0,0, f.radius + 3, 0, Math.PI * 2);
          ctx.fillStyle = 'white';
          ctx.fill();
          ctx.drawImage(img, -f.radius, -f.radius, f.radius * 2, f.radius * 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
          ctx.fillStyle = f.type === 'bomb' ? BOMB_COLOR : f.config?.color || 'red';
          ctx.fill();
        }
      }
      ctx.restore();
    });

    // 3. Draw Confetti Particles
    particlesRef.current.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 4. Draw Hand Trails & Cursors
    trailsRef.current.forEach((trail) => {
      if (trail.points.length < 1) return;
      
      // Draw Trail
      if (trail.points.length >= 2) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = trail.color;
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(trail.points[0].x, trail.points[0].y);
        for (let i = 1; i < trail.points.length - 1; i++) {
          const xc = (trail.points[i].x + trail.points[i + 1].x) / 2;
          const yc = (trail.points[i].y + trail.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(trail.points[i].x, trail.points[i].y, xc, yc);
        }
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.restore();
      }

      // Draw Cursor
      const last = trail.points[trail.points.length - 1];
      ctx.save();
      ctx.translate(last.x, last.y);
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fillStyle = trail.color;
      ctx.globalAlpha = 0.5;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = trail.color;
      ctx.stroke();
      ctx.restore();
    });

    // 5. Draw Floating Texts (UI Layer)
    floatingTextsRef.current.forEach(ft => {
      ctx.save();
      ctx.translate(ft.x, ft.y);
      ctx.scale(ft.scale, ft.scale);
      
      ctx.font = "900 40px 'Fredoka', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Shadow / Outline
      ctx.lineWidth = 6;
      ctx.strokeStyle = "white";
      ctx.strokeText(ft.text, 0, 0);
      
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);
      
      ctx.restore();
    });

    ctx.restore(); // Restore shake
  };

  const processVision = (width: number, height: number, now: number) => {
    const landmarker = getLandmarker();
    if (!landmarker || !videoRef.current || videoRef.current.readyState < 2) return;

    // Detect
    const results = landmarker.detectForVideo(videoRef.current, now);

    if (results.landmarks) {
      results.landmarks.forEach((landmarks, index) => {
        const handedness = results.handedness[index]?.[0]?.categoryName || `Hand-${index}`;
        const indexTip = landmarks[8];
        
        // IMPORTANT: Directly use x, y without 1-x. Canvas CSS is mirrored.
        const x = indexTip.x * width; 
        const y = indexTip.y * height;
        
        const point = { x, y };
        
        let trail = trailsRef.current.get(handedness);
        if (!trail) {
          trail = { 
              id: handedness, 
              points: [], 
              color: handedness === 'Left' ? TRAIL_COLOR_LEFT : TRAIL_COLOR_RIGHT 
          };
          trailsRef.current.set(handedness, trail);
        }

        // Add point
        trail.points.push(point);
        if (trail.points.length > TRAIL_LENGTH) {
          trail.points.shift();
        }

        // Check Collision and Movement for Sound
        if (trail.points.length >= 2) {
          const prev = trail.points[trail.points.length - 2];
          const curr = trail.points[trail.points.length - 1];
          
          // Sound: Check speed
          const dist = distance(prev, curr);
          if (dist > 15 && now - lastSwipeSoundRef.current > 150) {
             playSwipe();
             lastSwipeSoundRef.current = now;
          }
          
          fruitsRef.current.forEach(fruit => {
             // Collision check only for intact fruits or bombs
             if (fruit.type !== 'debris' && !fruit.isSliced && lineIntersectsCircle(prev, curr, fruit)) {
               const angle = getAngle(prev, curr);
               handleSlice(fruit, angle);
             }
          });
        }
      });

      // Clear old trails
      const foundHands = new Set(results.landmarks.map((_, i) => results.handedness[i]?.[0]?.categoryName || `Hand-${i}`));
      trailsRef.current.forEach((_, key) => {
        if (!foundHands.has(key)) {
           trailsRef.current.delete(key);
        }
      });
    }
  };

  // Main Loop
  const loop = (timestamp: number) => {
    if (gameState !== GameState.PLAYING) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    update(timestamp, canvas.width, canvas.height);
    processVision(canvas.width, canvas.height, timestamp);
    draw(ctx, canvas.width, canvas.height);

    requestRef.current = requestAnimationFrame(loop);
  };

  // Setup Video & Vision
  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 1280, 
            height: 720,
            frameRate: { ideal: 60 }
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', async () => {
             setGameState(GameState.LOADING_VISION);
             await initializeVision();
             await loadAssets();
             // Assets loaded, vision ready
             gameStartTimeRef.current = performance.now();
             setGameState(GameState.PLAYING);
          });
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        alert("Camera permission is required to play.");
      }
    };

    // Initial setup on mount if we transition to loading
    if (gameState === GameState.LOADING_VISION && !videoRef.current?.srcObject) {
       setupCamera();
    } else if (gameState === GameState.PLAYING) {
        // Start loop
        requestRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  // Resize Handler
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clean up loop on unmount
  useEffect(() => {
     return () => {
        if(requestRef.current) cancelAnimationFrame(requestRef.current);
     }
  }, []);

  // Reset Game Logic
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      fruitsRef.current = [];
      particlesRef.current = [];
      splattersRef.current = [];
      floatingTextsRef.current = [];
      scoreRef.current = 0;
      livesRef.current = MAX_LIVES;
      lastSpawnTimeRef.current = 0;
      spawnRateRef.current = INITIAL_SPAWN_RATE;
      shakeIntensityRef.current = 0;
      onScoreUpdate(0);
      onLivesUpdate(MAX_LIVES);
    }
  }, [gameState, onScoreUpdate, onLivesUpdate]);

  return (
    <div className="relative w-full h-full">
      {/* Natural Video Feed - Faded for Shadow Effect */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-0 left-0 w-full h-full object-cover video-mirror opacity-10 grayscale pointer-events-none"
      />
      
      {/* Game Overlay Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-10 block video-mirror"
      />
      
      {/* Loading Overlay */}
      {gameState === GameState.LOADING_VISION && (
         <div className="absolute inset-0 flex items-center justify-center z-50 bg-amber-50 bg-opacity-95">
            <div className="text-center">
              <div className="animate-bounce text-6xl mb-4">🖐️</div>
              <h2 className="text-3xl text-slate-700 font-fredoka font-bold mb-2">Getting Ready...</h2>
              <p className="text-slate-500">Warming up the kitchen!</p>
            </div>
         </div>
      )}
    </div>
  );
};

export default GameCanvas;
