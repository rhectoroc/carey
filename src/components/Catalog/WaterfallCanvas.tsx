"use client";

import React, { useEffect, useRef } from 'react';

const WaterfallCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Dot[] = [];

        // Configuration
        const particleCount = 200; // Reduced specific density for performance/aesthetics adaptation
        // The user snippet had 600 per frame which is very dense "rain".
        // I will stick closer to their logic but use a managed array.

        const resize = () => {
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        };

        window.addEventListener('resize', resize);
        resize();

        class Dot {
            x: number;
            y: number;
            width: number;
            height: number;
            life: number;
            maxlife: number;
            alpha: number;

            constructor(w: number, h: number) {
                this.x = Math.random() * canvas!.width * 2 - canvas!.width / 2;
                this.y = Math.random() * canvas!.height;
                this.width = w;
                this.height = h;
                this.life = 0;
                this.maxlife = Math.random() * 2 + 1; // 1 to 3
                this.alpha = Math.random() * 0.15 + 0.05; // 0.05 to 0.2
            }

            draw(ctx: CanvasRenderingContext2D) {
                // Using bright teal/cyan for contrast against dark background
                // r=34, g=211, b=238 (Cyan-400)
                ctx.strokeStyle = `rgba(34, 211, 238, ${this.alpha * 2})`; // Increased brightness and alpha
                ctx.beginPath();
                ctx.moveTo(this.x + this.x / 2, this.y + this.y / 2);
                ctx.lineTo(this.x + this.x / 2 + this.width / 2, this.y + this.y / 2 + this.height);
                ctx.closePath();
                ctx.stroke();
                this.life++;
            }
        }

        const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

        const loop = () => {
            // Clear usually needs to be consistent
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Create new particles every frame
            for (let i = 0; i < 150; i++) { // Adjusted count to be performant
                particles.push(new Dot(getRandom(-15, 15), getRandom(50, 120)));
            }

            // Draw and filter dead particles
            // Filter in place or create new array? New array is safer for React state but here we are in a loop.
            // Performance wise, filtering a growing array is bad. 
            // Since maxlife is small (1-3 frames), we can just rebuild the array easily.

            const aliveParticles: Dot[] = [];
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.draw(ctx);
                if (p.life < p.maxlife) {
                    aliveParticles.push(p);
                }
            }
            particles = aliveParticles;

            animationFrameId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                background: 'linear-gradient(to bottom, #0f172a, #1e293b)', // Dark slate background
                opacity: 1,
                zIndex: 0
            }}
        />
    );
};

export default WaterfallCanvas;
