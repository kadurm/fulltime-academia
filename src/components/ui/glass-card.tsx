// src/components/ui/glass-card.tsx
import React from 'react';
import { cn } from '../../lib/utils'; // Utilitário para merge de classes Tailwind
import { VariantProps, cva } from "class-variance-authority";

const glassCardVariants = cva(
    // Base styles: relative, overflow hidden for shine, transition for 3D hover
    "glass-card-3d relative overflow-hidden group transition-all duration-500 ease-out flex flex-col",
    {
        variants: {
            variant: {
                dark: "bg-gray-800/40 backdrop-blur-xl border border-t-white/30 border-l-white/20 border-b-black/50 border-r-black/50 shadow-[0_15px_35px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]",
                light: "bg-white/10 backdrop-blur-xl border border-white/40 shadow-xl",
            },
            hoverEffect: {
                float: "hover:-translate-y-3 hover:shadow-[0_30px_60px_rgba(0,0,0,0.4),inset_0_2px_0_rgba(255,255,255,0.2)] cursor-pointer",
                none: "",
            },
            radius: {
                default: "rounded-2xl",
                lg: "rounded-3xl",
                sm: "rounded-xl",
            },
        },
        defaultVariants: {
            variant: "dark",
            hoverEffect: "float",
            radius: "default",
        },
    }
);

export interface GlassCardProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof glassCardVariants> {
    animatedShine?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ className, animatedShine = true, variant, hoverEffect, radius, children, ...props }, ref) => {
        return (
            <div
                className={cn(glassCardVariants({ variant, hoverEffect, radius }), className)}
                ref={ref}
                {...props}
            >
                {/* Elemento de brilho simulando reflexo de luz no vidro */}
                <span 
                    className={cn(
                        "absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-[25deg] pointer-events-none z-0", 
                        animatedShine && "animate-shine-glass"
                    )} 
                />
                
                {/* O conteúdo do card fica acima do brilho para garantir legibilidade */}
                <div className="relative z-10 flex flex-col h-full w-full">
                    {children}
                </div>
            </div>
        );
    }
);

GlassCard.displayName = "GlassCard";

export { GlassCard, glassCardVariants };
