import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    zIndex?: number;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, zIndex }) => {
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const backdropStyle = zIndex ? { zIndex } : undefined;
    const modalStyle = zIndex ? { zIndex: zIndex + 1 } : undefined;

    return createPortal(
        <div className="modal-backdrop" style={backdropStyle} onClick={onClose}>
            <div className="modal" style={modalStyle} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">{title}</span>
                    <button className="modal-close" onClick={onClose} aria-label="Close">
                        &#10005;
                    </button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;