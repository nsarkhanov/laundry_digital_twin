import React from 'react';
import { Activity, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * AnalysisPlaceholder Component
 * 
 * Animated placeholder for the Real-time Analysis page.
 * Features pulsing icons, floating particles, and smooth CSS animations.
 */
export default function AnalysisPlaceholder({ onBack }) {
    return (
        <div className="relative min-h-[calc(100vh-200px)] flex flex-col items-center justify-center overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber/5 via-transparent to-cyan/5 animate-gradient" />

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute w-2 h-2 rounded-full animate-float-${i % 4}`}
                        style={{
                            left: `${10 + (i * 7)}%`,
                            top: `${20 + (i % 3) * 25}%`,
                            backgroundColor: i % 2 === 0 ? 'rgb(0, 212, 255)' : 'rgb(245, 158, 11)',
                            opacity: 0.4,
                            animationDelay: `${i * 0.3}s`,
                        }}
                    />
                ))}
            </div>

            {/* Main content */}
            <div className="relative z-10 text-center">
                {/* Pulsing icon */}
                <div className="relative inline-flex mb-8">
                    <div className="absolute inset-0 bg-amber/20 rounded-full animate-ping" />
                    <div className="relative p-6 bg-gradient-to-br from-amber/20 to-cyan/20 rounded-full border border-amber/30">
                        <Activity className="w-16 h-16 text-amber animate-pulse" />
                    </div>
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-cyan animate-bounce" />
                </div>

                {/* Title */}
                <h2 className="text-3xl font-heading font-bold text-white mb-3">
                    Real-time <span className="text-amber">Analysis</span>
                </h2>
                <p className="text-gray-400 mb-2 max-w-md mx-auto">
                    Advanced analytics and insights coming soon
                </p>
                <p className="text-sm text-gray-500 mb-8">
                    We're building powerful real-time analysis tools for your laundry operations
                </p>

                {/* Animated loading dots */}
                <div className="flex justify-center gap-2 mb-8">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-3 h-3 rounded-full bg-cyan animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                        />
                    ))}
                </div>

                {/* Back button */}
                <Button
                    onClick={onBack}
                    className="bg-cyan text-black font-bold hover:bg-cyan/90 rounded-full px-8 py-6 btn-glow"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
            </div>

            {/* Custom animations */}
            <style jsx>{`
                @keyframes gradient {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
                .animate-gradient {
                    animation: gradient 4s ease-in-out infinite;
                }
                @keyframes float-0 {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    50% { transform: translateY(-20px) translateX(10px); }
                }
                @keyframes float-1 {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    50% { transform: translateY(-15px) translateX(-10px); }
                }
                @keyframes float-2 {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    50% { transform: translateY(-25px) translateX(5px); }
                }
                @keyframes float-3 {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    50% { transform: translateY(-10px) translateX(-5px); }
                }
                .animate-float-0 { animation: float-0 3s ease-in-out infinite; }
                .animate-float-1 { animation: float-1 4s ease-in-out infinite; }
                .animate-float-2 { animation: float-2 3.5s ease-in-out infinite; }
                .animate-float-3 { animation: float-3 4.5s ease-in-out infinite; }
            `}</style>
        </div>
    );
}
