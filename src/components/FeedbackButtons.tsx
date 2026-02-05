import { useState } from 'react';
import { cn } from '../lib/utils';
import { ThumbUpIcon, ThumbDownIcon } from './Icons';
import { trackFeedback } from '../services/insights';

interface FeedbackButtonsProps {
  messageId: string;
}

export function FeedbackButtons({ messageId }: FeedbackButtonsProps) {
  // Initialize state from localStorage to avoid setState in effect
  const [feedback, setFeedback] = useState<'helpful' | 'unhelpful' | null>(() => {
    const stored = localStorage.getItem(`feedback-${messageId}`);
    return (stored === 'helpful' || stored === 'unhelpful') ? stored : null;
  });

  const handleFeedback = (type: 'helpful' | 'unhelpful') => {
    const newValue = feedback === type ? null : type;
    setFeedback(newValue);
    if (newValue) {
      localStorage.setItem(`feedback-${messageId}`, newValue);
      trackFeedback(messageId, newValue === 'helpful');
    } else {
      localStorage.removeItem(`feedback-${messageId}`);
    }
  };

  return (
    <div className="flex items-center gap-1 mt-2">
      <button
        onClick={() => handleFeedback('helpful')}
        className={cn(
          'p-1.5 rounded-lg transition-all duration-200 border',
          feedback === 'helpful'
            ? 'bg-terrain/20 border-terrain text-terrain'
            : 'border-transparent text-ink/30 hover:text-ink/50 hover:bg-parchment/50'
        )}
        title="Helpful"
        aria-label="Mark as helpful"
      >
        <ThumbUpIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleFeedback('unhelpful')}
        className={cn(
          'p-1.5 rounded-lg transition-all duration-200 border',
          feedback === 'unhelpful'
            ? 'bg-compass/10 border-compass text-compass'
            : 'border-transparent text-ink/30 hover:text-ink/50 hover:bg-parchment/50'
        )}
        title="Not helpful"
        aria-label="Mark as not helpful"
      >
        <ThumbDownIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
