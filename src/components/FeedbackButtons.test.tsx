import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedbackButtons } from './FeedbackButtons';

describe('FeedbackButtons', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render helpful and unhelpful buttons', () => {
    render(<FeedbackButtons messageId="test-msg-1" />);
    
    expect(screen.getByLabelText(/mark as helpful/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mark as not helpful/i)).toBeInTheDocument();
  });

  it('should toggle helpful feedback on click', () => {
    render(<FeedbackButtons messageId="test-msg-1" />);
    
    const helpfulButton = screen.getByLabelText(/mark as helpful/i);
    fireEvent.click(helpfulButton);
    
    expect(localStorage.setItem).toHaveBeenCalledWith('feedback-test-msg-1', 'helpful');
  });

  it('should toggle unhelpful feedback on click', () => {
    render(<FeedbackButtons messageId="test-msg-1" />);
    
    const unhelpfulButton = screen.getByLabelText(/mark as not helpful/i);
    fireEvent.click(unhelpfulButton);
    
    expect(localStorage.setItem).toHaveBeenCalledWith('feedback-test-msg-1', 'unhelpful');
  });

  it('should remove feedback when clicking the same button twice', () => {
    render(<FeedbackButtons messageId="test-msg-1" />);
    
    const helpfulButton = screen.getByLabelText(/mark as helpful/i);
    fireEvent.click(helpfulButton);
    fireEvent.click(helpfulButton);
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('feedback-test-msg-1');
  });

  it('should load saved feedback from localStorage on mount', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('helpful');
    
    render(<FeedbackButtons messageId="test-msg-1" />);
    
    const helpfulButton = screen.getByLabelText(/mark as helpful/i);
    expect(helpfulButton).toHaveClass(/terrain/); // Active state styling
  });
});
