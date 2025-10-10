// components/ui/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
    text?: string;
    size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    text = 'Loading...',
    size = 'medium'
}) => {
    const sizeClass = size === 'small' ? 'scale-75' : size === 'large' ? 'scale-125' : '';

    return (
        <div className="loading-state">
            <div className={`spinner ${sizeClass}`}></div>
            {text && <div className="loading-text">{text}</div>}
        </div>
    );
};

export default LoadingSpinner;