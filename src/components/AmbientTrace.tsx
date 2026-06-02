/**
 * AmbientTrace — the looping micro-demonstration of the product, shown beside the
 * dropzone in the empty state. It dramatizes the core magic: a faint sample UI
 * screenshot with a reticle "scanning" it, vermilion construction trace-lines
 * drawing from detected regions out to floating detection labels, then resetting
 * and replaying. This is "show, don't tell" — the product's signature interaction
 * rendered ambiently so a first-time visitor SEES what tracing means.
 *
 * Pure SVG + framer-motion. The whole thing is decorative (`aria-hidden`); a
 * static, fully-drawn fallback is shown under prefers-reduced-motion.
 */
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/** True when the user asked for reduced motion. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}

/**
 * Each detected region on the faux screenshot: a box on the "screenshot" (left),
 * a trace elbow out to a label dot (right), and the label text. Coordinates are in
 * the 0–400 (w) × 0–300 (h) viewBox space.
 */
interface DemoDetection {
  /** Region on the faux screenshot. */
  box: { x: number; y: number; w: number; h: number };
  /** Label anchor on the right rail. */
  label: { x: number; y: number; text: string; comp: string };
}

const SCREEN = { x: 24, y: 40, w: 224, h: 224 };

const DETECTIONS: DemoDetection[] = [
  {
    box: { x: 44, y: 62, w: 184, h: 26 },
    label: { x: 300, y: 70, text: 'Heading', comp: 'Text' },
  },
  {
    box: { x: 44, y: 104, w: 184, h: 22 },
    label: { x: 300, y: 128, text: 'Input', comp: 'TextField' },
  },
  {
    box: { x: 44, y: 140, w: 184, h: 22 },
    label: { x: 300, y: 186, text: 'Input', comp: 'TextField' },
  },
  {
    box: { x: 44, y: 182, w: 86, h: 28 },
    label: { x: 300, y: 244, text: 'Submit', comp: 'Button' },
  },
];

/** Orthogonal draftsman's elbow from a box's right edge out to a label dot. */
function elbow(box: DemoDetection['box'], label: DemoDetection['label']): string {
  const x1 = box.x + box.w;
  const y1 = box.y + box.h / 2;
  const x2 = label.x - 6;
  const y2 = label.y;
  const mid = (x1 + x2) / 2;
  return `M ${x1} ${y1} H ${mid} V ${y2} H ${x2}`;
}

export function AmbientTrace({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  // Loop cycle key: bump every ~6.4s to replay the whole sequence.
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setCycle((c) => c + 1), 6400);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <div className={className} aria-hidden="true">
      <svg
        viewBox="0 0 400 300"
        className="w-full h-full"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
      >
        {/* faint frame around the whole stage */}
        <rect
          x={SCREEN.x}
          y={SCREEN.y}
          width={SCREEN.w}
          height={SCREEN.h}
          rx={3}
          fill="#FBFAF5"
          stroke="rgba(31,41,51,0.12)"
          strokeWidth={1}
        />

        {/* faux UI inside the "screenshot": a login-ish form, very faint */}
        <g opacity={0.5}>
          <rect x={44} y={64} width={120} height={12} rx={2} fill="rgba(31,41,51,0.32)" />
          <rect x={44} y={106} width={184} height={18} rx={2} fill="#fff" stroke="rgba(31,41,51,0.16)" />
          <rect x={44} y={142} width={184} height={18} rx={2} fill="#fff" stroke="rgba(31,41,51,0.16)" />
          <rect x={44} y={184} width={86} height={24} rx={2} fill="#C5482E" opacity={0.85} />
        </g>

        {/* scanning reticle sweep — a faint horizontal line that travels top→bottom */}
        {!reduced && (
          <motion.g
            key={`scan-${cycle}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0.9, 0] }}
            transition={{ duration: 1.4, times: [0, 0.1, 0.9, 1], ease: 'linear' }}
          >
            <motion.line
              x1={SCREEN.x}
              x2={SCREEN.x + SCREEN.w}
              stroke="#27496D"
              strokeWidth={1}
              strokeDasharray="3 3"
              initial={{ y1: SCREEN.y, y2: SCREEN.y }}
              animate={{ y1: SCREEN.y + SCREEN.h, y2: SCREEN.y + SCREEN.h }}
              transition={{ duration: 1.4, ease: 'linear' }}
            />
          </motion.g>
        )}

        {/* per-detection: box highlight → trace elbow → label, staggered after the scan */}
        {DETECTIONS.map((d, i) => {
          const delay = reduced ? 0 : 1.4 + i * 0.42;
          const path = elbow(d.box, d.label);
          return (
            <g key={`${cycle}-${i}`}>
              {/* detected region box */}
              <motion.rect
                x={d.box.x}
                y={d.box.y}
                width={d.box.w}
                height={d.box.h}
                rx={2}
                fill="none"
                stroke="#C5482E"
                strokeWidth={1}
                initial={reduced ? { opacity: 0.9 } : { opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ duration: 0.3, delay }}
              />
              {/* index chip */}
              <motion.g
                initial={reduced ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay }}
              >
                <rect x={d.box.x} y={d.box.y - 11} width={16} height={11} fill="#C5482E" />
                <text
                  x={d.box.x + 8}
                  y={d.box.y - 2.5}
                  textAnchor="middle"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize={7.5}
                  fill="#fff"
                >
                  {String(i + 1).padStart(2, '0')}
                </text>
              </motion.g>
              {/* construction trace elbow */}
              <motion.path
                d={path}
                stroke="#C5482E"
                strokeWidth={1}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduced ? { pathLength: 1, opacity: 0.8 } : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.8 }}
                transition={{ duration: 0.5, delay: delay + 0.15, ease: 'easeInOut' }}
              />
              {/* terminal node dot at the label */}
              <motion.circle
                cx={d.label.x - 6}
                cy={d.label.y}
                r={2.5}
                fill="#FBFAF5"
                stroke="#C5482E"
                strokeWidth={1.2}
                initial={reduced ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: delay + 0.6 }}
              />
              {/* detection label — component name in mono */}
              <motion.text
                x={d.label.x + 2}
                y={d.label.y - 4}
                fontFamily="'JetBrains Mono', monospace"
                fontSize={8}
                letterSpacing="0.06em"
                fill="#27496D"
                initial={reduced ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: delay + 0.6 }}
              >
                {d.label.comp.toUpperCase()}
              </motion.text>
              <motion.text
                x={d.label.x + 2}
                y={d.label.y + 6}
                fontFamily="'Public Sans', sans-serif"
                fontSize={7.5}
                fill="rgba(31,41,51,0.55)"
                initial={reduced ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: delay + 0.65 }}
              >
                {d.label.text}
              </motion.text>
            </g>
          );
        })}

        {/* corner reticle ticks on the screenshot frame (static, part of identity) */}
        <g stroke="#27496D" strokeWidth={1}>
          <path d={`M ${SCREEN.x} ${SCREEN.y + 8} V ${SCREEN.y} H ${SCREEN.x + 8}`} fill="none" />
          <path
            d={`M ${SCREEN.x + SCREEN.w - 8} ${SCREEN.y + SCREEN.h} H ${SCREEN.x + SCREEN.w} V ${SCREEN.y + SCREEN.h - 8}`}
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}
