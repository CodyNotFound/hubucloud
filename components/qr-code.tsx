'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeComponentProps {
    text: string;
    size?: number;
    className?: string;
}

export const QRCodeComponent = ({ text, size = 200, className = '' }: QRCodeComponentProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const generateQR = async () => {
            if (canvasRef.current) {
                try {
                    await QRCode.toCanvas(canvasRef.current, text, {
                        width: size,
                        margin: 2,
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF',
                        },
                    });
                } catch (error) {
                    console.error('生成二维码失败:', error);
                }
            }
        };

        generateQR();
    }, [text, size]);

    return (
        <canvas
            ref={canvasRef}
            className={`rounded-lg ${className}`}
            style={{ maxWidth: '100%', height: 'auto' }}
        />
    );
};
