import React from 'react'

export const TeamBlue = ({ className, style }) => (
    <svg viewBox="0 0 240 200" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(0, 10)">
            {/* Kid 2 (Back) - Offset X */}
            <g transform="translate(0, 0)">
                <KidColor color="#3B82F6" flip />
            </g>
            {/* Kid 1 (Front/Center) - Offset X */}
            <g transform="translate(90, 0)">
                <KidColor color="#2563EB" flip />
            </g>

            {/* Rope Segment: Matches hands height approx y=100.
          Input (Flip) makes hands around x=60-90. 
      */}
            <path d="M60 100 L240 100" stroke="#333" strokeWidth="6" strokeLinecap="round" />
        </g>
    </svg>
)

export const TeamRed = ({ className, style }) => (
    <svg viewBox="0 0 240 200" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(0, 10)">
            {/* Kid 1 (Front/Center) */}
            <g transform="translate(50, 0)">
                <KidColor color="#EF4444" />
            </g>
            {/* Kid 2 (Back) */}
            <g transform="translate(140, 0)">
                <KidColor color="#DC2626" />
            </g>

            {/* Rope Segment */}
            <path d="M0 100 L180 100" stroke="#333" strokeWidth="6" strokeLinecap="round" />
        </g>
    </svg>
)

// Kid Component - Drawn facing LEFT by default
const KidColor = ({ color, flip }) => (
    <g transform={flip ? "scale(-1, 1) translate(-100, 0)" : ""}>
        {/* Feet/Legs */}
        <path d="M30 140 L20 185 L40 185 L45 140" fill="#111" /> {/* Leg 1 */}
        <path d="M70 140 L80 185 L60 185 L55 140" fill="#111" /> {/* Leg 2 */}

        {/* Adras Shirt (Body) */}
        <path d="M25 60 L75 60 L85 140 L15 140 Z" fill={color} />

        {/* Ikat Pattern (Simple Zigzags) */}
        <path d="M25 70 L35 85 L45 70 L55 85 L65 70 L75 85" stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" />
        <path d="M20 100 L30 115 L40 100 L50 115 L60 100 L70 115" stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" />
        <path d="M15 130 L25 140 L35 130 L45 140 L55 130 L65 140" stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" />

        {/* Arms Pulling (Straight line to rope) */}
        <line x1="30" y1="70" x2="10" y2="100" stroke="#FCD34D" strokeWidth="8" strokeLinecap="round" />
        <line x1="70" y1="70" x2="40" y2="100" stroke="#FCD34D" strokeWidth="8" strokeLinecap="round" />

        {/* Head */}
        <circle cx="50" cy="40" r="22" fill="#FCD34D" />

        {/* Doppa (Skullcap) - Black square-ish */}
        <path d="M28 30 Q50 15 72 30 V20 Q50 5 28 20 Z" fill="#000" />
        {/* White Doppa patterns */}
        <path d="M35 25 Q50 18 65 25" stroke="white" strokeWidth="2" fill="none" />
        <path d="M40 22 Q50 18 60 22" stroke="white" strokeWidth="2" fill="none" />

        {/* Face Profile (Simple) */}
        <circle cx="40" cy="38" r="2" fill="#333" /> {/* Eye */}
        <path d="M35 50 Q45 55 50 50" stroke="#333" strokeWidth="2" fill="none" /> {/* Mouth */}
    </g>
)
