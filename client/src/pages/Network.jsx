import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useScroll, motion } from 'framer-motion';
import PinCard from '../components/PinCard';

const generateMockData = (startIndex, count) => {
    const ww = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const cardWidth = 320;
    
    // Increased density: reduced vertical spacing
    const spacingY = 300;
    
    // Minimum 30vw gap between the left cards and right cards
    const gap = ww * 0.1; // 30vw
    const center = ww / 2;
    // Left zone ends before the gap starts 
    // Right zone starts after the gap ends
    const maxLeftX = center - (gap / 2) - cardWidth;
    const minRightX = center + (gap / 2);
    
    const maxBoundary = ww - cardWidth - 20;

    const items = [];
    for (let i = 0; i < count; i++) {
        const id = startIndex + i;
        const isLeftTendency = id % 2 === 0;
        
        let x = 20;
        if (isLeftTendency) {
            // Pick an X between 20 and maxLeftX
            const safeMaxLeft = Math.max(20, maxLeftX);
            x = 20 + Math.random() * (safeMaxLeft - 20);
        } else {
            // Pick an X between minRightX and maxBoundary
            const safeMinRight = Math.min(minRightX, maxBoundary);
            const range = Math.max(0, maxBoundary - safeMinRight);
            x = safeMinRight + Math.random() * range;
        }

        // Failsafe clamp
        x = Math.min(Math.max(x, 10), maxBoundary);
        
        const y = id * spacingY + 120 + (Math.random() * 60 - 30); 
        const rotation = (Math.random() - 0.5) * 35; 
        
        items.push({
            id,
            title: `Intel Node [${id + 1}]`,
            content: "Surveillance footage recovered. Persons of interest identified in target sector. Awaiting further instruction. Connection secured.",
            image_url: Math.random() > 0.3 ? `https://picsum.photos/seed/hacknite${id}/400/300` : null,
            created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
            author: "Fixer_01",
            position: { x, y },
            rotation,
            pinPos: { x: x + 160, y: y - 10 } 
        });
    }
    return items;
};

const AnimatedLine = ({ prevPos, currPos, index, drawSequenceLimit, onFullyDrawn, cardsInCenter }) => {
    // Only attempt to draw if the previous line has finished Drawing
    // AND if the destination card has reached the center of the viewport
    const canDraw = index <= drawSequenceLimit && index <= cardsInCenter;
    const [hasDrawn, setHasDrawn] = useState(false);

    const dx = currPos.x - prevPos.x;
    const dy = currPos.y - prevPos.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const onComplete = () => {
        if (!hasDrawn && canDraw) {
            setHasDrawn(true);
            onFullyDrawn(index + 1); 
        }
    };

    return (
        <g>
            <defs>
                <pattern 
                    id={`ropePattern-${index}`} 
                    patternUnits="userSpaceOnUse" 
                    width="100" 
                    height="10" 
                    patternTransform={`rotate(${angle})`}
                >
                    <rect width="100" height="10" fill="#a02020" />
                    <image href="/assets/rope.png" x="0" y="0" width="100" height="10" preserveAspectRatio="none" />
                    <path d="M0,0 L100,10" stroke="#600f0f" strokeWidth="2" strokeDasharray="4,2" />
                </pattern>
            </defs>

            <motion.line
                x1={prevPos.x} y1={prevPos.y}
                x2={currPos.x} y2={currPos.y}
                stroke="rgba(0,0,0,0.8)" strokeWidth="3" transform="translate(2, 3)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={canDraw ? "visible" : "hidden"}
                variants={{
                    visible: { pathLength: 1, opacity: 1 },
                    hidden: { pathLength: 0, opacity: 0 }
                }}
                transition={{ duration: 0.8, ease: "linear" }}
            />
            <motion.line
                x1={prevPos.x} y1={prevPos.y}
                x2={currPos.x} y2={currPos.y}
                stroke={`url(#ropePattern-${index})`} strokeWidth="5" strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={canDraw ? "visible" : "hidden"}
                variants={{
                    visible: { pathLength: 1, opacity: 1 },
                    hidden: { pathLength: 0, opacity: 0 }
                }}
                transition={{ duration: 0.8, ease: "linear" }}
                onAnimationComplete={onComplete}
            />
        </g>
    );
};

const Network = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sensitivity, setSensitivity] = useState(0.5); 
    const [drawSequenceLimit, setDrawSequenceLimit] = useState(1);
    
    // Tracks which cards have reached the center of the viewport
    const [cardsInCenter, setCardsInCenter] = useState(1);
    
    const observerRef = useRef();
    const scrollContainerRef = useRef(null);
    const { scrollY } = useScroll({ container: scrollContainerRef });

    useEffect(() => {
        const el = scrollContainerRef.current;
        const handleWheel = (e) => {
            e.preventDefault();
            el.scrollTop += e.deltaY * sensitivity;
        };
        if (el) {
            el.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => el && el.removeEventListener('wheel', handleWheel);
    }, [sensitivity]);

    useEffect(() => {
        setItems(generateMockData(0, 5));
    }, []);

    const lastItemRef = useCallback(node => {
        if (loading) return;
        if (observerRef.current) observerRef.current.disconnect();
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setLoading(true);
                setTimeout(() => {
                    setItems(prev => {
                        const newItems = generateMockData(prev.length, 5);
                        return [...prev, ...newItems];
                    });
                    setLoading(false);
                }, 800);
            }
        });
        if (node) observerRef.current.observe(node);
    }, [loading]);

    const handleFullyDrawn = useCallback((nextIndex) => {
        setDrawSequenceLimit(prev => Math.max(prev, nextIndex));
    }, []);

    const handleCardCenterInView = useCallback((index) => {
        setCardsInCenter(prev => Math.max(prev, index));
    }, []);

    const totalHeight = items.length > 0 ? items[items.length - 1].position.y + 800 : '100vh';

    return (
        <div 
            ref={scrollContainerRef}
            className="relative h-screen w-full font-mono overflow-y-auto overflow-x-hidden bg-black"
        >
            <div 
                className="relative w-full" 
                style={{ 
                    height: totalHeight, 
                    background: '#111',
                    backgroundImage: 'radial-gradient(#333 1px, transparent 1px)',
                    backgroundSize: '20px 20px' 
                }}
            >
                <h1 className="fixed top-6 left-6 text-red-500 text-3xl font-bold tracking-widest z-50 mix-blend-screen opacity-60 pointer-events-none">
                    // NETWORK_SURVEILLANCE
                </h1>

                <div className="absolute top-0 left-0 w-full h-full z-10">
                    {items.map((item, index) => {
                        const isLast = items.length === index + 1;
                        return (
                            <PinCard 
                                ref={isLast ? lastItemRef : null} 
                                key={item.id} 
                                index={index}
                                item={item} 
                                scrollY={scrollY} 
                                scrollRef={scrollContainerRef}
                                onCenterInView={handleCardCenterInView}
                            />
                        );
                    })}
                </div>

                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-30">
                    {items.map((item, i) => {
                        if (i === 0) return null;
                        const prev = items[i - 1];
                        return (
                            <AnimatedLine 
                                key={`anim-line-${item.id}`} 
                                index={i}
                                prevPos={prev.pinPos} 
                                currPos={item.pinPos} 
                                drawSequenceLimit={drawSequenceLimit}
                                cardsInCenter={cardsInCenter}
                                onFullyDrawn={handleFullyDrawn} 
                            />
                        );
                    })}
                </svg>
                
                {loading && (
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 text-red-500 font-mono tracking-widest animate-pulse bg-black/80 px-4 py-2 border border-red-500/50 rounded z-50">
                        [&gt;] TRACING_SIGNAL...
                    </div>
                )}
                <div className="fixed bottom-6 right-6 bg-[#1a1816]/90 border border-red-900/50 p-3 rounded-lg z-50 flex items-center space-x-3 drop-shadow-xl backdrop-blur-md">
                    <span className="text-red-500 text-xs font-bold uppercase tracking-wider">Scroll Sens</span>
                    <input 
                        type="range" 
                        min="0.2" 
                        max="3.0" 
                        step="0.1" 
                        value={sensitivity} 
                        onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                        className="w-24 accent-red-600 outline-none"
                    />
                    <span className="text-red-300 text-xs w-6">{sensitivity.toFixed(1)}x</span>
                </div>
            </div>
        </div>
    );
};

export default Network;
