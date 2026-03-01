import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Resizable, Enable } from 're-resizable';
import { GripVertical, Maximize2 } from 'lucide-react';

export interface Position {
  x: number;
  y: number;
}

export interface PanelSize {
  width: number | 'auto';
  height: number | 'auto';
}

interface DraggablePanelProps {
  id: string;
  children: React.ReactNode;
  position: Position;
  onPositionChange: (id: string, pos: Position) => void;
  size: PanelSize;
  onSizeChange: (id: string, size: PanelSize) => void;
  zIndex: number;
  onBringToFront: (id: string) => void;
  isLocked: boolean;
  minWidth?: number;
  minHeight?: number;
  className?: string;
}

// Custom resize corner handle component
const ResizeHandle = ({ direction }: { direction: string }) => (
  <div
    className="absolute flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
    style={{
      ...(direction === 'bottomRight' && { bottom: 0, right: 0, width: 20, height: 20, cursor: 'nwse-resize' }),
      ...(direction === 'right' && { top: '50%', right: -4, transform: 'translateY(-50%)', width: 8, height: 40, cursor: 'ew-resize' }),
      ...(direction === 'bottom' && { bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 40, height: 8, cursor: 'ns-resize' }),
    }}
  >
    {direction === 'bottomRight' && (
      <Maximize2 className="w-3 h-3 text-cyan-400 rotate-90" />
    )}
    {direction === 'right' && (
      <div className="w-1 h-6 rounded-full bg-cyan-500/60" />
    )}
    {direction === 'bottom' && (
      <div className="h-1 w-6 rounded-full bg-cyan-500/60" />
    )}
  </div>
);

export const DraggablePanel: React.FC<DraggablePanelProps> = ({
  id,
  children,
  position,
  onPositionChange,
  size,
  onSizeChange,
  zIndex,
  onBringToFront,
  isLocked,
  minWidth = 200,
  minHeight = 80,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [liveSize, setLiveSize] = useState<{ w: number; h: number } | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isLocked) return;
      e.preventDefault();
      e.stopPropagation();

      onBringToFront(id);

      dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        posX: position.x,
        posY: position.y,
      };

      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [id, isLocked, onBringToFront, position]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !dragStartRef.current) return;
      e.preventDefault();

      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;

      onPositionChange(id, {
        x: dragStartRef.current.posX + deltaX,
        y: dragStartRef.current.posY + deltaY,
      });
    },
    [id, isDragging, onPositionChange]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      setIsDragging(false);
      dragStartRef.current = null;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    },
    [isDragging]
  );

  const resizableEnable: Enable = isLocked
    ? {}
    : {
        top: false,
        topRight: false,
        topLeft: false,
        left: false,
        right: true,
        bottom: true,
        bottomRight: true,
        bottomLeft: false,
      };

  const resizableSize = {
    width: size.width === 'auto' ? '100%' : size.width,
    height: size.height === 'auto' ? 'auto' : size.height,
  };

  return (
    <div
      ref={panelRef}
      className={`relative group ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        zIndex: isDragging || isResizing ? 9999 : zIndex,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: isDragging ? 'transform' : 'auto',
      }}
    >
      {/* Drag Handle */}
      {!isLocked && (
        <div
          className={`absolute -top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-3 py-1 rounded-full cursor-grab select-none transition-all duration-200
            ${isDragging
              ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] scale-110'
              : 'bg-slate-800/90 text-slate-400 hover:bg-cyan-900/80 hover:text-cyan-300 border border-slate-700/50 hover:border-cyan-500/50 opacity-0 group-hover:opacity-100'
            }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ touchAction: 'none' }}
        >
          <GripVertical className="w-3 h-3" />
          <span className="text-[9px] font-mono uppercase tracking-wider">
            {isDragging ? 'DROP' : 'DRAG'}
          </span>
          <GripVertical className="w-3 h-3" />
        </div>
      )}

      {/* Active border glow for drag or resize */}
      {(isDragging || isResizing) && (
        <div className="absolute inset-0 rounded-xl border-2 border-cyan-500/60 pointer-events-none shadow-[0_0_40px_rgba(6,182,212,0.2)]" style={{ zIndex: 51 }} />
      )}

      {/* Live size readout during resize */}
      {isResizing && liveSize && (
        <div className="absolute -bottom-7 right-0 z-[60] bg-cyan-900/90 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500/40 shadow-lg whitespace-nowrap">
          {liveSize.w} × {liveSize.h} px
        </div>
      )}

      <Resizable
        size={resizableSize}
        enable={resizableEnable}
        minWidth={minWidth}
        minHeight={minHeight}
        onResizeStart={() => {
          setIsResizing(true);
          onBringToFront(id);
        }}
        onResize={(_e, _dir, ref) => {
          setLiveSize({ w: ref.offsetWidth, h: ref.offsetHeight });
        }}
        onResizeStop={(_e, _dir, ref) => {
          setIsResizing(false);
          setLiveSize(null);
          onSizeChange(id, {
            width: ref.offsetWidth,
            height: ref.offsetHeight,
          });
        }}
        handleStyles={{
          right: { right: -6, width: 12, top: 0, bottom: 0, cursor: 'ew-resize', zIndex: 40 },
          bottom: { bottom: -6, height: 12, left: 0, right: 0, cursor: 'ns-resize', zIndex: 40 },
          bottomRight: { right: -4, bottom: -4, width: 16, height: 16, cursor: 'nwse-resize', zIndex: 40 },
        }}
        handleComponent={{
          right: !isLocked ? <ResizeHandle direction="right" /> : undefined,
          bottom: !isLocked ? <ResizeHandle direction="bottom" /> : undefined,
          bottomRight: !isLocked ? <ResizeHandle direction="bottomRight" /> : undefined,
        }}
        style={{ overflow: 'hidden', borderRadius: '0.75rem' }}
      >
        {/* Panel content with overflow auto */}
        <div
          className={`h-full w-full transition-transform duration-200 ${isDragging ? 'scale-[1.005]' : ''}`}
          style={{
            overflow: size.height !== 'auto' ? 'auto' : 'visible',
            transition: isDragging ? 'none' : undefined,
          }}
        >
          {children}
        </div>
      </Resizable>

      {/* Resize affordance indicators (corner + edge lines) - only visible on hover when unlocked */}
      {!isLocked && !isDragging && !isResizing && (
        <>
          {/* Bottom-right corner triangle */}
          <div className="absolute bottom-0 right-0 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-40">
            <svg viewBox="0 0 16 16" className="w-full h-full">
              <path d="M16,0 L16,16 L0,16 Z" fill="rgba(6,182,212,0.3)" />
              <line x1="16" y1="4" x2="4" y2="16" stroke="rgba(6,182,212,0.5)" strokeWidth="1" />
              <line x1="16" y1="8" x2="8" y2="16" stroke="rgba(6,182,212,0.5)" strokeWidth="1" />
              <line x1="16" y1="12" x2="12" y2="16" stroke="rgba(6,182,212,0.5)" strokeWidth="1" />
            </svg>
          </div>
          {/* Right edge bar */}
          <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-[3px] h-8 rounded-full bg-cyan-500/0 group-hover:bg-cyan-500/40 transition-all duration-200 pointer-events-none z-40" />
          {/* Bottom edge bar */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 h-[3px] w-8 rounded-full bg-cyan-500/0 group-hover:bg-cyan-500/40 transition-all duration-200 pointer-events-none z-40" />
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Hook: manages positions AND sizes for all draggable panels
// ─────────────────────────────────────────────────────────────
export function useDraggablePanels(panelIds: string[]) {
  const POS_KEY = 'overwatch3-panel-positions';
  const SIZE_KEY = 'overwatch3-panel-sizes';

  // ── Default factories ──
  const getDefaultPositions = useCallback((): Record<string, Position> => {
    const positions: Record<string, Position> = {};
    panelIds.forEach((id) => {
      positions[id] = { x: 0, y: 0 };
    });
    return positions;
  }, [panelIds]);

  const getDefaultSizes = useCallback((): Record<string, PanelSize> => {
    const sizes: Record<string, PanelSize> = {};
    panelIds.forEach((id) => {
      sizes[id] = { width: 'auto', height: 'auto' };
    });
    return sizes;
  }, [panelIds]);

  // ── State: positions ──
  const [positions, setPositions] = useState<Record<string, Position>>(() => {
    try {
      const stored = localStorage.getItem(POS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...getDefaultPositions(), ...parsed };
      }
    } catch { }
    return getDefaultPositions();
  });

  // ── State: sizes ──
  const [sizes, setSizes] = useState<Record<string, PanelSize>>(() => {
    try {
      const stored = localStorage.getItem(SIZE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...getDefaultSizes(), ...parsed };
      }
    } catch { }
    return getDefaultSizes();
  });

  // ── State: z-indices ──
  const [zIndices, setZIndices] = useState<Record<string, number>>(() => {
    const indices: Record<string, number> = {};
    panelIds.forEach((id, i) => {
      indices[id] = i + 1;
    });
    return indices;
  });

  const [isLocked, setIsLocked] = useState(false);
  const maxZRef = useRef(panelIds.length);

  // ── Persist ──
  useEffect(() => {
    try { localStorage.setItem(POS_KEY, JSON.stringify(positions)); } catch { }
  }, [positions]);

  useEffect(() => {
    try { localStorage.setItem(SIZE_KEY, JSON.stringify(sizes)); } catch { }
  }, [sizes]);

  // ── Actions ──
  const updatePosition = useCallback((id: string, pos: Position) => {
    setPositions((prev) => ({ ...prev, [id]: pos }));
  }, []);

  const updateSize = useCallback((id: string, size: PanelSize) => {
    setSizes((prev) => ({ ...prev, [id]: size }));
  }, []);

  const bringToFront = useCallback((id: string) => {
    maxZRef.current += 1;
    setZIndices((prev) => ({ ...prev, [id]: maxZRef.current }));
  }, []);

  const resetLayout = useCallback(() => {
    setPositions(getDefaultPositions());
    setSizes(getDefaultSizes());
    localStorage.removeItem(POS_KEY);
    localStorage.removeItem(SIZE_KEY);
  }, [getDefaultPositions, getDefaultSizes]);

  const toggleLock = useCallback(() => {
    setIsLocked((prev) => !prev);
  }, []);

  const hasCustomLayout =
    Object.values(positions).some((p) => p.x !== 0 || p.y !== 0) ||
    Object.values(sizes).some((s) => s.width !== 'auto' || s.height !== 'auto');

  return {
    positions,
    sizes,
    zIndices,
    isLocked,
    hasCustomLayout,
    updatePosition,
    updateSize,
    bringToFront,
    resetLayout,
    toggleLock,
  };
}
