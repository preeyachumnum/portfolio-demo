"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Bot, RotateCcw, User, Users, Volume2, VolumeX } from 'lucide-react';

interface Point {
  x: number;
  y: number;
  r?: number;
}

interface TableRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

type GameMode = 'menu' | 'solo' | 'pvp' | 'pve';

interface UIState {
  mode: GameMode;
  turn: number;
  score: number;
  totalBalls: number;
  message: { title: string; desc: string; color: string } | null;
}

declare global {
  interface Window {
    startPoolGame?: (mode: GameMode) => void;
  }
}

const shadeColor = (color: string, percent: number) => {
  const red = Math.min(Math.round((parseInt(color.slice(1, 3), 16) * (100 + percent)) / 100), 255);
  const green = Math.min(Math.round((parseInt(color.slice(3, 5), 16) * (100 + percent)) / 100), 255);
  const blue = Math.min(Math.round((parseInt(color.slice(5, 7), 16) * (100 + percent)) / 100), 255);

  return `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
};

class PoolBall {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx = 0;
  vy = 0;
  mass = 1;
  isCue: boolean;
  is8Ball: boolean;
  active = true;

  constructor(x: number, y: number, radius: number, color: string, isCue = false, is8Ball = false) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.isCue = isCue;
    this.is8Ball = is8Ball;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;

    ctx.beginPath();
    ctx.arc(this.x + 3, this.y + 3, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(
      this.x - this.radius * 0.3,
      this.y - this.radius * 0.3,
      this.radius * 0.1,
      this.x,
      this.y,
      this.radius
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.2, this.color);
    gradient.addColorStop(1, shadeColor(this.color, -30));
    ctx.fillStyle = gradient;
    ctx.fill();

    if (this.is8Ball) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.font = `bold ${this.radius * 0.7}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('8', this.x, this.y + 1);
    }
  }

  update(
    table: TableRect,
    physics: { friction: number; minVelocity: number; restitution: number }
  ) {
    if (!this.active) return;

    this.x += this.vx;
    this.y += this.vy;
    this.vx *= physics.friction;
    this.vy *= physics.friction;

    if (Math.abs(this.vx) < physics.minVelocity) this.vx = 0;
    if (Math.abs(this.vy) < physics.minVelocity) this.vy = 0;

    if (this.x - this.radius < table.left) {
      this.x = table.left + this.radius;
      this.vx *= -physics.restitution;
    } else if (this.x + this.radius > table.right) {
      this.x = table.right - this.radius;
      this.vx *= -physics.restitution;
    }

    if (this.y - this.radius < table.top) {
      this.y = table.top + this.radius;
      this.vy *= -physics.restitution;
    } else if (this.y + this.radius > table.bottom) {
      this.y = table.bottom - this.radius;
      this.vy *= -physics.restitution;
    }
  }
}

export default function PoolGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(true);

  const [uiState, setUiState] = useState<UIState>({
    mode: 'menu',
    turn: 1,
    score: 0,
    totalBalls: 7,
    message: null,
  });
  const [soundEnabled, setSoundEnabled] = useState(true);

  const gameRef = useRef({
    mode: 'menu' as GameMode,
    turn: 1,
    score: 0,
    totalBalls: 7,
    isMoving: false,
    hasPottedThisTurn: false,
    scratchThisTurn: false,
    botActionTimer: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const FRICTION = 0.988;
    const MIN_VELOCITY = 0.02;
    const RESTITUTION = 0.85;
    const MAX_PULL = 200;
    const POWER_MULTIPLIER = 0.22;
    const BALL_RADIUS_MULT = 0.035;
    const physics = {
      friction: FRICTION,
      minVelocity: MIN_VELOCITY,
      restitution: RESTITUTION,
    };

    let animationFrameId = 0;
    let balls: PoolBall[] = [];
    let pockets: Point[] = [];
    let table: TableRect = { left: 0, right: 0, top: 0, bottom: 0 };
    let isAiming = false;
    let dragStart: Point = { x: 0, y: 0 };
    let dragCurrent: Point = { x: 0, y: 0 };
    let lastCollisionSoundAt = 0;

    const ensureAudioContext = () => {
      if (!soundEnabledRef.current) return null;
      if (!audioContextRef.current) {
        audioContextRef.current = new window.AudioContext();
      }

      if (audioContextRef.current.state === 'suspended') {
        void audioContextRef.current.resume();
      }

      return audioContextRef.current;
    };

    const playTone = ({
      frequency,
      endFrequency,
      duration,
      volume,
      type = 'sine',
      when = 0,
    }: {
      frequency: number;
      endFrequency?: number;
      duration: number;
      volume: number;
      type?: OscillatorType;
      when?: number;
    }) => {
      const audioContext = ensureAudioContext();
      if (!audioContext || audioContext.state !== 'running') return;

      const startAt = audioContext.currentTime + when;
      const stopAt = startAt + duration;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startAt);
      if (endFrequency && endFrequency > 0) {
        oscillator.frequency.exponentialRampToValueAtTime(endFrequency, stopAt);
      }

      gainNode.gain.setValueAtTime(0.0001, startAt);
      gainNode.gain.linearRampToValueAtTime(volume, startAt + Math.min(0.01, duration / 3));
      gainNode.gain.exponentialRampToValueAtTime(0.0001, stopAt);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start(startAt);
      oscillator.stop(stopAt + 0.01);
    };

    const playCueShotSound = (strength: number) => {
      const normalizedStrength = Math.max(0.15, Math.min(strength, 1));
      playTone({
        frequency: 190 + normalizedStrength * 80,
        endFrequency: 90 + normalizedStrength * 30,
        duration: 0.09 + normalizedStrength * 0.04,
        volume: 0.04 + normalizedStrength * 0.05,
        type: 'triangle',
      });
    };

    const playCollisionSound = (strength: number) => {
      const now = performance.now();
      if (now - lastCollisionSoundAt < 45) return;
      lastCollisionSoundAt = now;

      const normalizedStrength = Math.max(0.1, Math.min(strength, 1));
      playTone({
        frequency: 500 + normalizedStrength * 180,
        endFrequency: 220 + normalizedStrength * 120,
        duration: 0.04 + normalizedStrength * 0.03,
        volume: 0.02 + normalizedStrength * 0.03,
        type: 'square',
      });
    };

    const playPocketSound = (isScratch: boolean) => {
      if (isScratch) {
        playTone({
          frequency: 240,
          endFrequency: 120,
          duration: 0.18,
          volume: 0.06,
          type: 'sawtooth',
        });
        return;
      }

      playTone({
        frequency: 640,
        endFrequency: 280,
        duration: 0.16,
        volume: 0.05,
        type: 'triangle',
      });
      playTone({
        frequency: 860,
        endFrequency: 520,
        duration: 0.1,
        volume: 0.025,
        type: 'sine',
        when: 0.02,
      });
    };

    const playOutcomeSound = (result: 'win' | 'lose') => {
      if (result === 'win') {
        playTone({ frequency: 523.25, duration: 0.12, volume: 0.05, type: 'triangle' });
        playTone({ frequency: 659.25, duration: 0.12, volume: 0.055, type: 'triangle', when: 0.08 });
        playTone({ frequency: 783.99, duration: 0.2, volume: 0.06, type: 'triangle', when: 0.16 });
        return;
      }

      playTone({ frequency: 320, endFrequency: 220, duration: 0.18, volume: 0.055, type: 'sawtooth' });
      playTone({ frequency: 240, endFrequency: 140, duration: 0.26, volume: 0.05, type: 'sawtooth', when: 0.08 });
    };

    const syncUI = () => {
      setUiState((prev) => {
        if (
          prev.score === gameRef.current.score &&
          prev.turn === gameRef.current.turn &&
          prev.mode === gameRef.current.mode &&
          prev.totalBalls === gameRef.current.totalBalls
        ) {
          return prev;
        }

        return {
          ...prev,
          score: gameRef.current.score,
          turn: gameRef.current.turn,
          totalBalls: gameRef.current.totalBalls,
          mode: gameRef.current.mode,
        };
      });
    };

    const gameOver = (title: string, desc: string, color: string, result: 'win' | 'lose') => {
      playOutcomeSound(result);
      setUiState((prev) => ({ ...prev, message: { title, desc, color } }));
      gameRef.current.mode = 'menu';
      gameRef.current.isMoving = false;
      gameRef.current.botActionTimer = 0;
      isAiming = false;
    };

    const resize = () => {
      const stageRect = stageRef.current?.getBoundingClientRect();
      const availableWidth = Math.max((stageRect?.width ?? window.innerWidth) - 16, 320);
      const viewportHeight = stageRect?.height ?? window.innerHeight;
      const reservedHeight = window.innerWidth < 768 ? 120 : 96;
      const availableHeight = Math.max(viewportHeight - reservedHeight, 320);
      const isPortraitViewport = availableHeight > availableWidth * 1.05;
      const prevWidth = canvas.width || availableWidth;
      const prevHeight = canvas.height || availableHeight;

      let width = availableWidth;
      let height = isPortraitViewport ? width * 1.45 : width / 2;

      if (height > availableHeight) {
        height = availableHeight;
        width = isPortraitViewport ? height / 1.45 : height * 2;
      }

      canvas.width = Math.floor(Math.max(width, 320));
      canvas.height = Math.floor(Math.max(height, isPortraitViewport ? 420 : 240));

      if (balls.length > 0) {
        const scaleX = canvas.width / prevWidth;
        const scaleY = canvas.height / prevHeight;
        const scaleRadius = Math.min(scaleX, scaleY);

        balls.forEach((ball) => {
          ball.x *= scaleX;
          ball.y *= scaleY;
          ball.radius *= scaleRadius;
          ball.vx *= scaleX;
          ball.vy *= scaleY;
        });
      }

      const paddingX = canvas.width * 0.05;
      const paddingY = canvas.height * 0.05;
      table = {
        left: paddingX,
        right: canvas.width - paddingX,
        top: paddingY,
        bottom: canvas.height - paddingY,
      };

      const pocketRadius = Math.min(canvas.width, canvas.height) * 0.06;
      pockets = [
        { x: table.left, y: table.top, r: pocketRadius },
        { x: table.right, y: table.top, r: pocketRadius },
        { x: table.left, y: table.bottom, r: pocketRadius },
        { x: table.right, y: table.bottom, r: pocketRadius },
        { x: table.left + (table.right - table.left) / 2, y: table.top, r: pocketRadius },
        { x: table.left + (table.right - table.left) / 2, y: table.bottom, r: pocketRadius },
      ];

      if (canvas.height > canvas.width) {
        pockets[4] = { x: table.left, y: table.top + (table.bottom - table.top) / 2, r: pocketRadius };
        pockets[5] = { x: table.right, y: table.top + (table.bottom - table.top) / 2, r: pocketRadius };
      }
    };

    const handleResize = () => {
      resize();

      if (gameRef.current.mode === 'menu') {
        drawTable();
      }
    };

    const drawTable = () => {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cushion = 12;
      ctx.fillStyle = '#0f766e';
      ctx.fillRect(
        table.left - cushion,
        table.top - cushion,
        table.right - table.left + cushion * 2,
        table.bottom - table.top + cushion * 2
      );

      ctx.fillStyle = '#115e59';
      ctx.fillRect(table.left, table.top, table.right - table.left, table.bottom - table.top);

      pockets.forEach((pocket) => {
        if (!pocket.r) return;
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, pocket.r, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, pocket.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 4;
        ctx.stroke();
      });
    };

    const spawnBalls = () => {
      balls = [];

      const ballRadius = Math.min(canvas.width, canvas.height) * BALL_RADIUS_MULT;
      const isPortrait = canvas.height > canvas.width;
      const cueX = isPortrait ? canvas.width / 2 : table.left + (table.right - table.left) * 0.25;
      const cueY = isPortrait ? table.top + (table.bottom - table.top) * 0.25 : canvas.height / 2;
      balls.push(new PoolBall(cueX, cueY, ballRadius, '#ffffff', true));

      const startX = isPortrait ? canvas.width / 2 : table.left + (table.right - table.left) * 0.75;
      const startY = isPortrait ? table.top + (table.bottom - table.top) * 0.75 : canvas.height / 2;
      const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#f43f5e'];
      const direction = isPortrait ? -1 : 1;

      let colorIndex = 0;
      for (let col = 0; col < 3; col++) {
        for (let row = 0; row <= col; row++) {
          const ballX = isPortrait
            ? startX + (row - col / 2) * ballRadius * 2.1
            : startX + col * ballRadius * 1.8 * direction;
          const ballY = isPortrait
            ? startY + col * ballRadius * 1.8 * -direction
            : startY + (row - col / 2) * ballRadius * 2.1;
          const is8Ball = col === 2 && row === 1;

          balls.push(new PoolBall(ballX, ballY, ballRadius, is8Ball ? '#111111' : colors[colorIndex % colors.length], false, is8Ball));
          if (!is8Ball) colorIndex++;
        }
      }

      gameRef.current.score = 0;
      gameRef.current.totalBalls = colorIndex;
      gameRef.current.turn = 1;
      gameRef.current.isMoving = false;
      gameRef.current.hasPottedThisTurn = false;
      gameRef.current.scratchThisTurn = false;
      gameRef.current.botActionTimer = 0;
      syncUI();
    };

    const resolveCollisions = () => {
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const first = balls[i];
          const second = balls[j];
          if (!first.active || !second.active) continue;

          const dx = second.x - first.x;
          const dy = second.y - first.y;
          const distance = Math.hypot(dx, dy);
          const minDistance = first.radius + second.radius;

          if (distance <= 0 || distance >= minDistance) continue;

          const overlap = minDistance - distance;
          const nx = dx / distance;
          const ny = dy / distance;

          first.x -= (nx * overlap) / 2;
          first.y -= (ny * overlap) / 2;
          second.x += (nx * overlap) / 2;
          second.y += (ny * overlap) / 2;

          const relVx = first.vx - second.vx;
          const relVy = first.vy - second.vy;
          const impactSpeed = Math.abs(nx * relVx + ny * relVy);
          if (impactSpeed > 0.45) {
            playCollisionSound(Math.min(impactSpeed / 10, 1));
          }
          const impulse = (2 * (nx * relVx + ny * relVy)) / (first.mass + second.mass);

          first.vx -= impulse * second.mass * nx;
          first.vy -= impulse * second.mass * ny;
          second.vx += impulse * first.mass * nx;
          second.vy += impulse * first.mass * ny;
        }
      }
    };

    const checkPockets = () => {
      for (const ball of balls) {
        if (!ball.active) continue;

        for (const pocket of pockets) {
          if (!pocket.r) continue;
          if (Math.hypot(ball.x - pocket.x, ball.y - pocket.y) >= pocket.r * 1.2) continue;

          ball.active = false;
          ball.vx = 0;
          ball.vy = 0;

          if (ball.isCue) {
            playPocketSound(true);
            gameRef.current.scratchThisTurn = true;

            setTimeout(() => {
              const isPortrait = canvas.height > canvas.width;
              ball.x = isPortrait ? canvas.width / 2 : table.left + (table.right - table.left) * 0.25;
              ball.y = isPortrait ? table.top + (table.bottom - table.top) * 0.25 : canvas.height / 2;
              ball.active = true;
            }, 500);
          } else if (ball.is8Ball) {
            if (gameRef.current.mode === 'solo') {
              if (gameRef.current.score === gameRef.current.totalBalls) {
                gameOver('คุณชนะ!', 'ยิงลูก 8 ลงหลุมสำเร็จ', 'text-green-400', 'win');
              } else {
                gameOver('จบเกม!', 'คุณยิงลูก 8 ลงหลุมก่อนเก็บลูกสีหมด', 'text-red-500', 'lose');
              }
            } else {
              const playerName = gameRef.current.turn === 1
                ? 'ผู้เล่น 1'
                : gameRef.current.mode === 'pve'
                  ? 'Bot'
                  : 'ผู้เล่น 2';

              if (gameRef.current.score === gameRef.current.totalBalls) {
                gameOver(`${playerName} ชนะ!`, 'ยิงลูก 8 ลงหลุมสำเร็จ', 'text-green-400', 'win');
              } else {
                const winnerName = gameRef.current.turn === 1
                  ? gameRef.current.mode === 'pve' ? 'Bot' : 'ผู้เล่น 2'
                  : 'ผู้เล่น 1';

                gameOver(`${winnerName} ชนะ!`, `${playerName} ยิงลูก 8 ลงหลุมก่อนเก็บลูกสีหมด`, 'text-amber-400', 'lose');
              }
            }
          } else {
            playPocketSound(false);
            gameRef.current.score++;
            gameRef.current.hasPottedThisTurn = true;
            syncUI();
          }

          break;
        }
      }
    };

    const drawAimLines = (cueBall: PoolBall, dirX: number, dirY: number) => {
      let minT = Infinity;
      let hitBallIndex = -1;

      balls.forEach((ball, index) => {
        if (ball.isCue || !ball.active) return;

        const vx = cueBall.x - ball.x;
        const vy = cueBall.y - ball.y;
        const bCoeff = 2 * (vx * dirX + vy * dirY);
        const cCoeff = vx * vx + vy * vy - (ball.radius + cueBall.radius) ** 2;
        const discriminant = bCoeff * bCoeff - 4 * cCoeff;

        if (discriminant < 0) return;

        const t = (-bCoeff - Math.sqrt(discriminant)) / 2;
        if (t > 0 && t < minT) {
          minT = t;
          hitBallIndex = index;
        }
      });

      let wallT = Infinity;
      if (dirX > 0) wallT = Math.min(wallT, (table.right - cueBall.radius - cueBall.x) / dirX);
      if (dirX < 0) wallT = Math.min(wallT, (table.left + cueBall.radius - cueBall.x) / dirX);
      if (dirY > 0) wallT = Math.min(wallT, (table.bottom - cueBall.radius - cueBall.y) / dirY);
      if (dirY < 0) wallT = Math.min(wallT, (table.top + cueBall.radius - cueBall.y) / dirY);

      const impactT = Math.min(minT, wallT);
      const impactX = cueBall.x + dirX * impactT;
      const impactY = cueBall.y + dirY * impactT;
      const angle = Math.atan2(dirY, dirX);
      const perpendicular = angle + Math.PI / 2;
      const offsetX = Math.cos(perpendicular) * cueBall.radius;
      const offsetY = Math.sin(perpendicular) * cueBall.radius;

      ctx.beginPath();
      ctx.moveTo(cueBall.x + offsetX, cueBall.y + offsetY);
      ctx.lineTo(impactX + offsetX, impactY + offsetY);
      ctx.moveTo(cueBall.x - offsetX, cueBall.y - offsetY);
      ctx.lineTo(impactX - offsetX, impactY - offsetY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const hitBall = hitBallIndex >= 0 ? balls[hitBallIndex] : null;

      if (hitBall && minT < wallT) {
        ctx.beginPath();
        ctx.arc(impactX, impactY, cueBall.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const objectDirX = hitBall.x - impactX;
        const objectDirY = hitBall.y - impactY;
        const objectDistance = Math.hypot(objectDirX, objectDirY);

        if (objectDistance > 0) {
          ctx.beginPath();
          ctx.moveTo(hitBall.x, hitBall.y);
          ctx.lineTo(
            hitBall.x + (objectDirX / objectDistance) * 50,
            hitBall.y + (objectDirY / objectDistance) * 50
          );
          ctx.strokeStyle = 'rgba(74, 222, 128, 0.8)';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      }
    };

    const drawCueAndAim = () => {
      const cueBall = balls.find((ball) => ball.isCue && ball.active);
      if (!isAiming || !cueBall || gameRef.current.isMoving) return;

      let dx = dragStart.x - dragCurrent.x;
      let dy = dragStart.y - dragCurrent.y;
      let distance = Math.hypot(dx, dy);

      if (distance > MAX_PULL) {
        dx = (dx / distance) * MAX_PULL;
        dy = (dy / distance) * MAX_PULL;
        distance = MAX_PULL;
      }

      const aimAngle = Math.atan2(dy, dx);
      const dirX = Math.cos(aimAngle);
      const dirY = Math.sin(aimAngle);

      drawAimLines(cueBall, dirX, dirY);

      const cueLength = 200;
      const cueDistance = cueBall.radius + 15 + distance;

      ctx.save();
      ctx.translate(cueBall.x, cueBall.y);
      ctx.rotate(aimAngle + Math.PI);
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(cueDistance, -3, 8, 6);
      ctx.fillStyle = '#d4a373';
      ctx.fillRect(cueDistance + 8, -3.5, cueLength * 0.4, 7);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cueDistance + 8 + cueLength * 0.4, -4.5, cueLength * 0.6, 9);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(cueDistance + 8 + cueLength * 0.7, -4.5, 10, 9);
      ctx.restore();
    };

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

    const distanceToSegment = (point: Point, start: Point, end: Point) => {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const lengthSquared = dx * dx + dy * dy;

      if (lengthSquared === 0) {
        return Math.hypot(point.x - start.x, point.y - start.y);
      }

      const t = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared, 0, 1);
      const projX = start.x + dx * t;
      const projY = start.y + dy * t;
      return Math.hypot(point.x - projX, point.y - projY);
    };

    const isLaneClear = (
      start: Point,
      end: Point,
      ignoredBalls: PoolBall[],
      clearanceRadius: number
    ) => {
      const ignored = new Set(ignoredBalls);

      return !balls.some((ball) => {
        if (!ball.active || ignored.has(ball)) return false;
        return distanceToSegment(ball, start, end) < clearanceRadius;
      });
    };

    const isInsidePlayableArea = (x: number, y: number, radius: number) =>
      x > table.left + radius &&
      x < table.right - radius &&
      y > table.top + radius &&
      y < table.bottom - radius;

    const executeBotTurn = () => {
      const cueBall = balls.find((ball) => ball.isCue && ball.active);
      if (!cueBall) return;

      let bestShot:
        | {
            targetBall: PoolBall;
            ghostX: number;
            ghostY: number;
            shotScore: number;
            cueDistance: number;
            pocketDistance: number;
            aimAngle: number;
          }
        | null = null;
      let fallbackTarget: PoolBall | null = null;
      let fallbackDistance = Infinity;

      const targetBalls = balls.filter(
        (ball) => !ball.isCue && ball.active && (!ball.is8Ball || gameRef.current.score === gameRef.current.totalBalls)
      );

      for (const ball of targetBalls) {
        const directDistance = Math.hypot(ball.x - cueBall.x, ball.y - cueBall.y);
        if (directDistance < fallbackDistance) {
          fallbackDistance = directDistance;
          fallbackTarget = ball;
        }

        for (const pocket of pockets) {
          if (pocket.r === undefined) continue;

          const ballToPocketX = pocket.x - ball.x;
          const ballToPocketY = pocket.y - ball.y;
          const ballToPocketDistance = Math.hypot(ballToPocketX, ballToPocketY);
          if (ballToPocketDistance <= 0) continue;

          const unitBallToPocketX = ballToPocketX / ballToPocketDistance;
          const unitBallToPocketY = ballToPocketY / ballToPocketDistance;
          const ghostX = ball.x - unitBallToPocketX * (ball.radius * 2);
          const ghostY = ball.y - unitBallToPocketY * (ball.radius * 2);

          if (!isInsidePlayableArea(ghostX, ghostY, cueBall.radius)) continue;
          if (!isLaneClear(ball, pocket, [cueBall, ball], ball.radius * 2.05)) continue;
          if (!isLaneClear(cueBall, { x: ghostX, y: ghostY }, [cueBall, ball], cueBall.radius * 2.05)) continue;

          const cueToGhostX = ghostX - cueBall.x;
          const cueToGhostY = ghostY - cueBall.y;
          const cueDistance = Math.hypot(cueToGhostX, cueToGhostY);
          if (cueDistance <= 0) continue;

          const aimAngle = Math.atan2(cueToGhostY, cueToGhostX);
          const cueDirX = cueToGhostX / cueDistance;
          const cueDirY = cueToGhostY / cueDistance;
          const alignment = cueDirX * unitBallToPocketX + cueDirY * unitBallToPocketY;
          const shotScore =
            cueDistance * 0.72 +
            ballToPocketDistance * 0.5 +
            (1 - clamp(alignment, -1, 1)) * 140;

          if (!bestShot || shotScore < bestShot.shotScore) {
            bestShot = {
              targetBall: ball,
              ghostX,
              ghostY,
              shotScore,
              cueDistance,
              pocketDistance: ballToPocketDistance,
              aimAngle,
            };
          }
        }
      }

      if (bestShot) {
        const quality = clamp(1 - bestShot.shotScore / 260, 0.25, 0.95);
        const errorAngle = (Math.random() - 0.5) * (0.055 - quality * 0.03);
        const finalAimAngle = bestShot.aimAngle + errorAngle;
        const power = clamp(8.5 + bestShot.cueDistance * 0.026 + bestShot.pocketDistance * 0.018, 9, 18);

        cueBall.vx = Math.cos(finalAimAngle) * power;
        cueBall.vy = Math.sin(finalAimAngle) * power;
        playCueShotSound(Math.min(power / 20, 1));
      } else if (fallbackTarget) {
        const aimAngle = Math.atan2(fallbackTarget.y - cueBall.y, fallbackTarget.x - cueBall.x);
        const errorAngle = (Math.random() - 0.5) * 0.1;
        const finalAimAngle = aimAngle + errorAngle;
        const power = clamp(10 + fallbackDistance * 0.02, 10, 16);

        cueBall.vx = Math.cos(finalAimAngle) * power;
        cueBall.vy = Math.sin(finalAimAngle) * power;
        playCueShotSound(Math.min(power / 18, 1));
      } else {
        const angle = Math.random() * Math.PI * 2;
        cueBall.vx = Math.cos(angle) * 15;
        cueBall.vy = Math.sin(angle) * 15;
        playCueShotSound(0.6);
      }

      gameRef.current.botActionTimer = 0;
    };

    const gameLoop = () => {
      if (gameRef.current.mode === 'menu') return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawTable();

      const currentlyMoving = balls.some((ball) => ball.active && (Math.abs(ball.vx) > 0 || Math.abs(ball.vy) > 0));

      if (gameRef.current.isMoving && !currentlyMoving && gameRef.current.mode !== 'solo') {
        if (gameRef.current.scratchThisTurn || !gameRef.current.hasPottedThisTurn) {
          gameRef.current.turn = gameRef.current.turn === 1 ? 2 : 1;
        }

        if (gameRef.current.mode === 'pve' && gameRef.current.turn === 2) {
          gameRef.current.botActionTimer = Date.now() + 1500;
        }

        gameRef.current.scratchThisTurn = false;
        gameRef.current.hasPottedThisTurn = false;
        syncUI();
      }

      gameRef.current.isMoving = currentlyMoving;

      if (
        !currentlyMoving &&
        gameRef.current.mode === 'pve' &&
        gameRef.current.turn === 2 &&
        gameRef.current.botActionTimer > 0 &&
        Date.now() > gameRef.current.botActionTimer
      ) {
        executeBotTurn();
      }

      balls.forEach((ball) => ball.update(table, physics));
      resolveCollisions();
      checkPockets();

      const isHumanTurn =
        gameRef.current.mode === 'solo' ||
        gameRef.current.turn === 1 ||
        (gameRef.current.mode === 'pvp' && gameRef.current.turn === 2);

      if (isHumanTurn) drawCueAndAim();

      balls.forEach((ball) => ball.draw(ctx));
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const getPointerPos = (event: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      ensureAudioContext();
      if (event.cancelable) event.preventDefault();
      if (gameRef.current.isMoving) return;
      if (gameRef.current.mode === 'pve' && gameRef.current.turn === 2) return;

      isAiming = true;
      dragStart = getPointerPos(event);
      dragCurrent = dragStart;
    };

    const handlePointerMove = (event: MouseEvent | TouchEvent) => {
      if (!isAiming) return;
      if (event.cancelable) event.preventDefault();
      dragCurrent = getPointerPos(event);
    };

    const handlePointerUp = () => {
      if (!isAiming) return;
      isAiming = false;

      const cueBall = balls.find((ball) => ball.isCue && ball.active);
      if (!cueBall) return;

      let dx = dragStart.x - dragCurrent.x;
      let dy = dragStart.y - dragCurrent.y;
      const distance = Math.hypot(dx, dy);

      if (distance > MAX_PULL) {
        dx = (dx / distance) * MAX_PULL;
        dy = (dy / distance) * MAX_PULL;
      }

      const vx = dx * POWER_MULTIPLIER;
      const vy = dy * POWER_MULTIPLIER;
      const speed = Math.hypot(vx, vy);

      if (speed > 1) {
        cueBall.vx = vx;
        cueBall.vy = vy;
        gameRef.current.hasPottedThisTurn = false;
        playCueShotSound(Math.min(speed / (MAX_PULL * POWER_MULTIPLIER), 1));
      }
    };

    window.startPoolGame = (mode: GameMode) => {
      ensureAudioContext();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      gameRef.current.mode = mode;
      gameRef.current.botActionTimer = 0;
      gameRef.current.isMoving = false;
      gameRef.current.hasPottedThisTurn = false;
      gameRef.current.scratchThisTurn = false;

      syncUI();
      resize();

      if (mode === 'menu') {
        drawTable();
        return;
      }

      spawnBalls();
      gameLoop();
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    window.addEventListener('resize', handleResize);
    resize();
    drawTable();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      canvas.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      delete window.startPoolGame;
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        void audioContextRef.current.close();
      }
      audioContextRef.current = null;
    };
  }, []);

  const startGame = (mode: GameMode) => {
    setUiState((prev) => ({ ...prev, message: null }));
    window.startPoolGame?.(mode);
  };

  const toggleSound = () => {
    const nextSoundEnabled = !soundEnabledRef.current;
    soundEnabledRef.current = nextSoundEnabled;
    setSoundEnabled(nextSoundEnabled);

    if (!audioContextRef.current) return;

    if (nextSoundEnabled) {
      void audioContextRef.current.resume();
      return;
    }

    if (audioContextRef.current.state === 'running') {
      void audioContextRef.current.suspend();
    }
  };

  return (
    <div className="relative flex min-h-[calc(100dvh-3.5rem)] w-full flex-col overflow-x-hidden bg-slate-900 font-sans text-white touch-pan-y selection:bg-transparent">

      {uiState.mode === 'menu' && !uiState.message && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-800 p-8 text-center shadow-2xl">
            <h1 className="mb-2 text-4xl font-black text-sky-400">2D PRO POOL</h1>
            <p className="mb-5 font-medium text-slate-400">เลือกรูปแบบการเล่น</p>
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Mute sound' : 'Enable sound'}
              className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-700/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-600 active:scale-95"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span>{soundEnabled ? 'เสียง: เปิด' : 'เสียง: ปิด'}</span>
            </button>

            <div className="space-y-4">
              <button onClick={() => startGame('solo')} className="w-full rounded-2xl border border-slate-600 bg-slate-700 p-4 transition-transform active:scale-95 hover:bg-slate-600">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-sky-500/20 p-3">
                    <User className="text-sky-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold">เล่นคนเดียว</p>
                    <p className="text-xs text-slate-400">โหมดฝึกซ้อม ยิงให้เก็บลูกทั้งหมด</p>
                  </div>
                </div>
              </button>

              <button onClick={() => startGame('pvp')} className="w-full rounded-2xl border border-slate-600 bg-slate-700 p-4 transition-transform active:scale-95 hover:bg-slate-600">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-emerald-500/20 p-3">
                    <Users className="text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold">เล่น 2 คน (Pass & Play)</p>
                    <p className="text-xs text-slate-400">สลับกันยิงบนอุปกรณ์เครื่องเดียว</p>
                  </div>
                </div>
              </button>

              <button onClick={() => startGame('pve')} className="w-full rounded-2xl border border-slate-600 bg-slate-700 p-4 transition-transform active:scale-95 hover:bg-slate-600">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-purple-500/20 p-3">
                    <Bot className="text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold">แข่งกับ AI (Bot)</p>
                    <p className="text-xs text-slate-400">สลับเทิร์นเล่นกับบอทอัตโนมัติ</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {uiState.mode !== 'menu' && (
        <div className="absolute left-0 right-0 top-4 z-10 mx-auto flex w-full max-w-lg items-start justify-between px-4 pointer-events-none">
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-600 bg-slate-800/80 p-3 shadow-lg backdrop-blur-md">
            <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors ${uiState.turn === 1 ? 'bg-blue-600 font-bold text-white' : 'text-slate-400'}`}>
              <User className="h-4 w-4" />
              <span>P1 {uiState.turn === 1 && '(Your Turn)'}</span>
            </div>
            {uiState.mode !== 'solo' && (
              <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors ${uiState.turn === 2 ? 'bg-red-500 font-bold text-white' : 'text-slate-400'}`}>
                {uiState.mode === 'pvp' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                <span>{uiState.mode === 'pvp' ? 'P2' : 'BOT'} {uiState.turn === 2 && '(Playing...)'}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end text-right">
            <div className="mb-2 flex items-center gap-2">
              <button
                onClick={toggleSound}
                title={soundEnabled ? 'Mute sound' : 'Enable sound'}
                className="pointer-events-auto inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 active:scale-95"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span>{soundEnabled ? 'เสียงเปิด' : 'เสียงปิด'}</span>
              </button>
              <button onClick={() => startGame('menu')} className="pointer-events-auto rounded-xl border border-slate-600 bg-slate-800/80 p-2 text-slate-300 active:scale-95">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
            <div
              className={`
                rounded-2xl border px-4 py-2 text-sm font-bold shadow-lg backdrop-blur-md transition-colors duration-300 md:text-base
                ${uiState.score === uiState.totalBalls ? 'animate-pulse border-amber-400 bg-amber-500/20 text-amber-400' : 'border-slate-600 bg-slate-800/80 text-green-400'}
              `}
            >
              {uiState.score === uiState.totalBalls
                ? 'ยิงลูก 8 เพื่อชนะ!'
                : `ลงหลุม: ${uiState.score} / ${uiState.totalBalls}`}
            </div>
          </div>
        </div>
      )}

      <div ref={stageRef} className="flex flex-1 items-center justify-center px-2 pb-4 pt-24 md:px-6 md:pb-6 md:pt-28">
        <canvas
          ref={canvasRef}
          className="h-auto w-full max-w-[1100px] touch-none cursor-crosshair rounded-2xl border border-slate-800 shadow-[0_15px_40px_rgba(0,0,0,0.9)]"
        />
      </div>

      {uiState.message && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`mx-4 max-w-sm rounded-3xl border-2 bg-slate-900 p-8 text-center shadow-2xl md:p-10 ${uiState.message.color}`}>
            <h2 className="mb-3 text-4xl font-black">{uiState.message.title}</h2>
            <p className="mb-8 text-lg font-medium text-slate-300">{uiState.message.desc}</p>
            <div className="flex gap-3">
              <button onClick={() => startGame('menu')} className="flex-1 whitespace-nowrap rounded-xl bg-slate-800 px-4 py-4 font-bold text-white transition-all active:scale-95 hover:bg-slate-700">
                กลับเมนู
              </button>
              <button onClick={() => startGame(uiState.mode)} className="flex-1 whitespace-nowrap rounded-xl bg-blue-600 px-4 py-4 font-bold text-white shadow-lg shadow-blue-500/40 transition-all active:scale-95 hover:bg-blue-500">
                เล่นอีกครั้ง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
