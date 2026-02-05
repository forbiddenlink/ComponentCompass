// Custom Cartographic-Themed Icon Components for ComponentCompass
// All icons follow a vintage nautical chart / explorer's map aesthetic

interface IconProps {
  className?: string;
  strokeWidth?: number;
}

// ============================================================
// COMPASS & NAVIGATION
// ============================================================

/** Ornate compass rose with cardinal points and decorative fleur-de-lis north marker */
export const CompassIcon = ({ className = "w-6 h-6" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer ring with tick marks */}
    <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 2.35" />
    {/* Cardinal direction ticks */}
    <line x1="12" y1="1.5" x2="12" y2="3.5" stroke="currentColor" strokeWidth="1.5" />
    <line x1="12" y1="20.5" x2="12" y2="22.5" stroke="currentColor" strokeWidth="1.5" />
    <line x1="1.5" y1="12" x2="3.5" y2="12" stroke="currentColor" strokeWidth="1.5" />
    <line x1="20.5" y1="12" x2="22.5" y2="12" stroke="currentColor" strokeWidth="1.5" />
    {/* Compass rose - North pointer (filled) */}
    <path d="M12 4L13.8 11L12 9.5L10.2 11L12 4Z" fill="currentColor" />
    {/* South pointer (outline) */}
    <path d="M12 20L13.8 13L12 14.5L10.2 13L12 20Z" stroke="currentColor" strokeWidth="0.75" fill="none" />
    {/* East pointer */}
    <path d="M20 12L13 10.2L14.5 12L13 13.8L20 12Z" stroke="currentColor" strokeWidth="0.75" fill="none" />
    {/* West pointer */}
    <path d="M4 12L11 10.2L9.5 12L11 13.8L4 12Z" stroke="currentColor" strokeWidth="0.75" fill="none" />
    {/* Center ornament */}
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="0.5" />
    {/* Fleur-de-lis north marker */}
    <path d="M12 2L12.4 3L12 2.5L11.6 3L12 2Z" fill="currentColor" />
  </svg>
);

/** Navigation arrow styled as a vintage wind rose pointer */
export const NavigationIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Main directional arrow - elongated compass needle */}
    <path d="M12 2L16 14L12 12L8 14L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    {/* Tail end */}
    <path d="M12 12L16 14L12 22L8 14L12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
    {/* Center pivot */}
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

/** Vintage nautical chart / treasure map icon */
export const MapIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Scroll/parchment shape */}
    <path d="M3 5C3 3.89 3.89 3 5 3H19C20.11 3 21 3.89 21 5V19C21 20.11 20.11 21 19 21H5C3.89 21 3 20.11 3 19V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Folded corner */}
    <path d="M15 3V7C15 7.55 15.45 8 16 8H21" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Topographic contour lines */}
    <path d="M6 13C8 11 10 12 12 11C14 10 16 13 18 12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <path d="M6 16C8 14.5 9 15.5 11 14.5C13 13.5 15 16 18 15" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    {/* Map pin / X marks the spot */}
    <path d="M8 8L10 10M10 8L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Small compass indicator */}
    <circle cx="17" cy="17" r="1.5" stroke="currentColor" strokeWidth="1" />
    <line x1="17" y1="15.5" x2="17" y2="16" stroke="currentColor" strokeWidth="0.75" />
  </svg>
);

// ============================================================
// MESSAGING & INPUT
// ============================================================

/** Quill pen dipped in ink - for send/submit actions */
export const SendIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Compass arrow / directional send */}
    <path d="M3 12L21 3L12 21L10 14L3 12Z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M10 14L21 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** Image / landscape icon for screenshot upload */
export const ImageIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Frame */}
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    {/* Mountain landscape */}
    <path d="M3 17L8 12L12 16L16 11L21 17" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Sun */}
    <circle cx="8" cy="9" r="2" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1" />
  </svg>
);

/** Image upload with arrow indicator */
export const ImageUploadIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Frame */}
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    {/* Mountain landscape */}
    <path d="M3 17L8 12L12 16L16 11L21 17" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Upload arrow */}
    <path d="M12 6V12M12 6L9 9M12 6L15 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Wax-sealed scroll - for paperclip/attachment */
export const PaperclipIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Rolled scroll shape */}
    <path d="M8 3H16C17.1 3 18 3.9 18 5V19C18 20.66 16.66 22 15 22H9C7.34 22 6 20.66 6 19V5C6 3.9 6.9 3 8 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Scroll curl top */}
    <path d="M6 5C6 3.9 6.9 3 8 3C6.9 3 6 3.9 6 5C6 6.1 6.9 7 8 7H16C17.1 7 18 6.1 18 5" stroke="currentColor" strokeWidth="1.5" />
    {/* Wax seal */}
    <circle cx="12" cy="14" r="2.5" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1.5" />
    {/* Seal detail */}
    <path d="M11 14L12 13L13 14L12 15L11 14Z" fill="currentColor" />
    {/* Ribbon */}
    <path d="M10.5 16.5L9 19M13.5 16.5L15 19" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

// ============================================================
// COPY, CHECK & STATUS
// ============================================================

/** Vintage rubber stamp - for copy action */
export const CopyIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Stamp handle */}
    <path d="M8 3H16V7H8V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Handle grip */}
    <path d="M10 3V1.5H14V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Stamp neck */}
    <path d="M10 7V10H14V7" stroke="currentColor" strokeWidth="1.5" />
    {/* Stamp base */}
    <path d="M6 10H18V13H6V10Z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Stamp impression on paper */}
    <rect x="5" y="16" width="14" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
    {/* Impression lines */}
    <line x1="8" y1="18" x2="16" y2="18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <line x1="8" y1="20" x2="13" y2="20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

/** Wax seal with checkmark - for check/success/copied state */
export const CheckIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Wax seal outer */}
    <path d="M12 2L14 5L17.5 4L16.5 7.5L20 9L17.5 11L19 14L15.5 14L15 17.5L12 16L9 17.5L8.5 14L5 14L6.5 11L4 9L7.5 7.5L6.5 4L10 5L12 2Z"
      fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Checkmark carved into seal */}
    <path d="M8.5 12L11 14.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Ornate wax seal with checkmark - for circled check/success */
export const CheckCircleIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Wax seal blob */}
    <path d="M12 2L14.5 4.5L18 3.5L17 7L20.5 9L18 11.5L19.5 15L16 14.5L14.5 18L12 16L9.5 18L8 14.5L4.5 15L6 11.5L3.5 9L7 7L6 3.5L9.5 4.5L12 2Z"
      fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Inner ring */}
    <circle cx="12" cy="10.5" r="5" stroke="currentColor" strokeWidth="1" />
    {/* Checkmark */}
    <path d="M9 10.5L11 12.5L15.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Warning beacon / alert lantern - for error/alert */
export const AlertCircleIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Lighthouse / beacon shape */}
    <path d="M12 2L14.5 4.5L18 3.5L17 7L20.5 9L18 11.5L19.5 15L16 14.5L14.5 18L12 16L9.5 18L8 14.5L4.5 15L6 11.5L3.5 9L7 7L6 3.5L9.5 4.5L12 2Z"
      fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Exclamation mark */}
    <line x1="12" y1="7" x2="12" y2="11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="14" r="1" fill="currentColor" />
  </svg>
);

// ============================================================
// ACTIONS
// ============================================================

/** Crossed anchors - for close/dismiss */
export const CloseIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Two crossed anchor shanks */}
    <path d="M5 5L19 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Anchor flukes on each end */}
    <path d="M5 5C4 4 3 5.5 4.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M19 5C20 4 21 5.5 19.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5 19C4 20 5.5 21 6 19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M19 19C20 20 18.5 21 18 19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Center ring */}
    <circle cx="12" cy="12" r="1.5" stroke="currentColor" strokeWidth="1" />
  </svg>
);

/** Alias for CloseIcon - used as X in some imports */
export const XIcon = CloseIcon;

/** Ship's wheel turning - for rotate/new conversation */
export const RotateCwIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Ship wheel outer ring */}
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
    {/* Center hub */}
    <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    {/* Spokes (8 handles of wheel) */}
    <line x1="12" y1="4" x2="12" y2="9.5" stroke="currentColor" strokeWidth="1.5" />
    <line x1="12" y1="14.5" x2="12" y2="20" stroke="currentColor" strokeWidth="1.5" />
    <line x1="4" y1="12" x2="9.5" y2="12" stroke="currentColor" strokeWidth="1.5" />
    <line x1="14.5" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.5" />
    {/* Diagonal spokes */}
    <line x1="6.34" y1="6.34" x2="10.23" y2="10.23" stroke="currentColor" strokeWidth="1" />
    <line x1="13.77" y1="13.77" x2="17.66" y2="17.66" stroke="currentColor" strokeWidth="1" />
    <line x1="17.66" y1="6.34" x2="13.77" y2="10.23" stroke="currentColor" strokeWidth="1" />
    <line x1="10.23" y1="13.77" x2="6.34" y2="17.66" stroke="currentColor" strokeWidth="1" />
    {/* Rotation arrow */}
    <path d="M20 4V8H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 8C18.5 5 15.5 3 12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** Rolled chart / scroll download */
export const DownloadIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Scroll body */}
    <path d="M6 3C4.9 3 4 3.9 4 5V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V5C20 3.9 19.1 3 18 3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Top scroll curl */}
    <path d="M6 3H18C18 3 19 3 19 4C19 5 18 5 18 5H6C6 5 5 5 5 4C5 3 6 3 6 3Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.1" />
    {/* Download arrow */}
    <path d="M12 8V16M12 16L9 13M12 16L15 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {/* Bottom line */}
    <line x1="8" y1="19" x2="16" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** Map revision mark / eraser - for trash/clear */
export const TrashIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Scratched-out map area */}
    <rect x="5" y="6" width="14" height="15" rx="1" stroke="currentColor" strokeWidth="1.5" />
    {/* Cross-out lines (revision marks) */}
    <path d="M8 9L16 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 9L8 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Top bar */}
    <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Tab */}
    <path d="M9 6V4C9 3.45 9.45 3 10 3H14C14.55 3 15 3.45 15 4V6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

// ============================================================
// DECORATIVE & STATUS
// ============================================================

/** Celestial navigation stars - for sparkles/magic/AI */
export const SparklesIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Main star - compass star shape */}
    <path d="M12 1L13.5 8.5L21 7L14.5 10.5L18 18L12 13L6 18L9.5 10.5L3 7L10.5 8.5L12 1Z"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" opacity="0.15" />
    {/* Small companion star */}
    <path d="M20 14L20.7 16.3L23 17L20.7 17.7L20 20L19.3 17.7L17 17L19.3 16.3L20 14Z"
      fill="currentColor" />
    {/* Tiny star */}
    <path d="M4 17L4.5 18.5L6 19L4.5 19.5L4 21L3.5 19.5L2 19L3.5 18.5L4 17Z"
      fill="currentColor" />
  </svg>
);

/** Spinning compass needle - for loading states */
export const LoadingIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Compass dial ring */}
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
    {/* Inner ring */}
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="0.75" />
    {/* Spinning needle - north */}
    <path d="M12 3L13.5 10.5L12 9L10.5 10.5L12 3Z" fill="currentColor" />
    {/* Spinning needle - south */}
    <path d="M12 21L13.5 13.5L12 15L10.5 13.5L12 21Z" stroke="currentColor" strokeWidth="0.75" />
    {/* Center */}
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

/** Cartographer's palette - for design/color related */
export const PaletteIcon = ({ className = "w-6 h-6" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Ink well / cartographer's palette */}
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C13.1 22 14 21.1 14 20C14 19.5 13.82 19.04 13.53 18.7C13.25 18.37 13.09 17.94 13.09 17.5C13.09 16.4 13.99 15.5 15.09 15.5H17C19.76 15.5 22 13.26 22 10.5C22 5.8 17.52 2 12 2Z"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Ink pools */}
    <circle cx="7.5" cy="10.5" r="1.5" fill="currentColor" opacity="0.8" />
    <circle cx="10.5" cy="7" r="1.5" fill="currentColor" opacity="0.6" />
    <circle cx="15" cy="7" r="1.5" fill="currentColor" opacity="0.4" />
    <circle cx="17.5" cy="10.5" r="1" fill="currentColor" opacity="0.6" />
    {/* Decorative cross-hatching */}
    <path d="M5 14L7 16" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" />
    <path d="M6 13L8 15" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" />
  </svg>
);

/** Vintage maritime document / chart */
export const DocumentIcon = ({ className = "w-6 h-6" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Parchment with rolled edges */}
    <path d="M6 2C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2H6Z"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Folded corner */}
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" opacity="0.1" />
    {/* Content lines styled as map notations */}
    <path d="M8 12H16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <path d="M8 15H14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <path d="M8 18H12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    {/* Compass rose watermark */}
    <circle cx="14" cy="16" r="2" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    <path d="M14 14.5V15.5M14 16.5V17.5M12.5 16H13.5M14.5 16H15.5" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
  </svg>
);

/** Ship's lantern / lighthouse light - for ideas/lightbulb */
export const LightbulbIcon = ({ className = "w-6 h-6" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Lantern body */}
    <path d="M9 18H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10 20H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Lantern glass */}
    <path d="M15 14C16.66 12.66 17.5 11 17.5 9C17.5 5.96 15.04 3.5 12 3.5C8.96 3.5 6.5 5.96 6.5 9C6.5 11 7.34 12.66 9 14V16C9 17.1 9.9 18 11 18H13C14.1 18 15 17.1 15 16V14Z"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Light rays */}
    <path d="M12 1V2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M19.07 4.93L18 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <path d="M4.93 4.93L6 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <path d="M21 10H19.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <path d="M3 10H4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    {/* Flame */}
    <path d="M12 7C12.8 7.5 13 8.5 12.5 9.5C12 10 11.5 9.5 12 8.5C12 8 12 7.5 12 7Z" fill="currentColor" opacity="0.4" />
  </svg>
);

/** Cartographer's info notation mark */
export const InfoIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Old map legend frame */}
    <rect x="4" y="3" width="16" height="18" rx="1" stroke="currentColor" strokeWidth="1.5" />
    {/* Decorative header line */}
    <path d="M4 7H20" stroke="currentColor" strokeWidth="1" />
    {/* "i" as a quill */}
    <circle cx="12" cy="5" r="0.75" fill="currentColor" />
    <line x1="12" y1="10" x2="12" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Decorative serifs */}
    <line x1="10" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="10" y1="17" x2="14" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** Sextant - for settings / tools */
export const SettingsIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Sextant arc */}
    <path d="M4 20C4 12 9 5 18 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Mirror arm */}
    <line x1="4" y1="20" x2="18" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Base arm */}
    <line x1="4" y1="20" x2="20" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Telescope tube */}
    <path d="M18 3L22 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Pivot */}
    <circle cx="4" cy="20" r="1.5" fill="currentColor" />
    {/* Scale marks on arc */}
    <path d="M7 18L7.5 17" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <path d="M10 15L10.5 14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <path d="M13 11L13.5 10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <path d="M16 7L16.5 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
);
