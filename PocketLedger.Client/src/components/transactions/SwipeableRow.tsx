import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

interface SwipeableRowProps {
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

const SWIPE_THRESHOLD = 80;
const REVEAL_WIDTH = 160;

export default function SwipeableRow({ children, onEdit, onDelete, className }: SwipeableRowProps) {
  const [swiping, setSwiping] = useState(false);
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const editOpacity = useTransform(x, [-REVEAL_WIDTH, -SWIPE_THRESHOLD, 0], [1, 0.6, 0]);
  const deleteOpacity = useTransform(x, [-REVEAL_WIDTH * 2, -REVEAL_WIDTH - SWIPE_THRESHOLD, -REVEAL_WIDTH], [1, 0.6, 0]);
  const editScale = useTransform(x, [-REVEAL_WIDTH, -SWIPE_THRESHOLD, 0], [1, 0.8, 0.5]);
  const deleteScale = useTransform(x, [-REVEAL_WIDTH * 2, -REVEAL_WIDTH - SWIPE_THRESHOLD, -REVEAL_WIDTH], [1, 0.8, 0.5]);

  const flashColor = useTransform(
    x,
    [-(SWIPE_THRESHOLD + 20), -SWIPE_THRESHOLD, 0],
    ['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0)', 'rgba(0, 0, 0, 0)']
  );

  const handleDragEnd = () => {
    const currentX = x.get();
    setSwiping(false);

    if (currentX < -SWIPE_THRESHOLD - 40) {
      animate(x, -REVEAL_WIDTH, { type: 'spring', stiffness: 400, damping: 30 });
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
    }
  };

  const handleAction = (action: () => void) => {
    animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
    action();
  };

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      <motion.div
        className="absolute inset-y-0 right-0 flex"
        style={{ width: REVEAL_WIDTH }}
      >
        <motion.button
          onClick={() => handleAction(onEdit)}
          className="flex-1 flex flex-col items-center justify-center gap-1 bg-blue-500 text-white"
          style={{ opacity: editOpacity, scale: editScale }}
        >
          <PencilIcon className="h-5 w-5" />
          <span className="text-[10px] font-medium">Edit</span>
        </motion.button>
        <motion.button
          onClick={() => handleAction(onDelete)}
          className="flex-1 flex flex-col items-center justify-center gap-1 bg-red-500 text-white"
          style={{ opacity: deleteOpacity, scale: deleteScale }}
        >
          <TrashIcon className="h-5 w-5" />
          <span className="text-[10px] font-medium">Delete</span>
        </motion.button>
      </motion.div>

      <motion.div
        className="relative bg-card"
        style={{ x, backgroundColor: flashColor }}
        drag="x"
        dragConstraints={{ left: -REVEAL_WIDTH, right: 0 }}
        dragElastic={0}
        onDragStart={() => setSwiping(true)}
        onDragEnd={handleDragEnd}
        whileTap={swiping ? undefined : undefined}
      >
        {children}
      </motion.div>
    </div>
  );
}
