'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useDisclosure } from '@heroui/react';
import { Modal, ModalContent, ModalBody, Button, Tooltip } from '@heroui/react';
import { ZoomIn, ZoomOut, RotateCw, X, Maximize2 } from 'lucide-react';

interface ImageViewerProps {
    src: string;
    alt: string;
    className?: string;
    thumbnailClassName?: string;
    width?: number;
    height?: number;
}

export function ImageViewer({
    src,
    alt,
    className,
    thumbnailClassName,
    width,
    height,
}: ImageViewerProps) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);

    // 重置状态
    const resetImageState = useCallback(() => {
        setScale(1);
        setRotation(0);
    }, []);

    // 快捷键处理
    const handleKeyPress = useCallback(
        (event: KeyboardEvent) => {
            if (!isOpen) return;

            switch (event.key) {
                case 'Escape':
                    onClose();
                    break;
                case '+':
                case '=':
                    event.preventDefault();
                    setScale((prev) => Math.min(prev * 1.2, 5));
                    break;
                case '-':
                    event.preventDefault();
                    setScale((prev) => Math.max(prev / 1.2, 0.2));
                    break;
                case 'r':
                case 'R':
                    event.preventDefault();
                    setRotation((prev) => (prev + 90) % 360);
                    break;
                case '0':
                    event.preventDefault();
                    resetImageState();
                    break;
            }
        },
        [isOpen, onClose, resetImageState]
    );

    // 监听键盘事件
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyPress);
            return () => document.removeEventListener('keydown', handleKeyPress);
        }
    }, [isOpen, handleKeyPress]);

    // 关闭时重置状态
    useEffect(() => {
        if (!isOpen) {
            resetImageState();
        }
    }, [isOpen, resetImageState]);

    // 放大缩小函数
    const zoomIn = () => setScale((prev) => Math.min(prev * 1.2, 5));
    const zoomOut = () => setScale((prev) => Math.max(prev / 1.2, 0.2));
    const rotate = () => setRotation((prev) => (prev + 90) % 360);

    return (
        <>
            {/* 缩略图 */}
            <div
                className={`relative cursor-pointer group overflow-hidden ${thumbnailClassName}`}
                onClick={onOpen}
            >
                <Image
                    src={src}
                    alt={alt}
                    width={width || 300}
                    height={height || 200}
                    className={`w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 ${className}`}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    onLoad={(e) => {
                        const img = e.target as HTMLImageElement;
                        console.log(`缩略图尺寸: ${img.naturalWidth} x ${img.naturalHeight}`);
                    }}
                />
                {/* 放大图标遮罩 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                    <ZoomIn
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        size={20}
                    />
                </div>
            </div>

            {/* 全屏模态框 */}
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                size="full"
                backdrop="blur"
                isDismissable={true}
                hideCloseButton={true}
                placement="center"
                classNames={{
                    wrapper: 'z-[9999]',
                    backdrop: 'bg-black/70 backdrop-blur-sm',
                    base: 'bg-transparent shadow-none m-0',
                    body: 'p-0',
                }}
                motionProps={{
                    variants: {
                        enter: {
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            transition: {
                                duration: 0.3,
                                ease: 'easeOut',
                            },
                        },
                        exit: {
                            y: -20,
                            opacity: 0,
                            scale: 0.95,
                            transition: {
                                duration: 0.2,
                                ease: 'easeIn',
                            },
                        },
                    },
                }}
            >
                <ModalContent className="h-full max-h-full">
                    {(onModalClose) => (
                        <>
                            {/* 工具栏 */}
                            <div className="absolute top-4 right-4 z-50 flex gap-2">
                                <Tooltip content="放大 (+)" placement="bottom">
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="solid"
                                        color="default"
                                        className="bg-black/50 text-white hover:bg-black/70"
                                        onPress={zoomIn}
                                    >
                                        <ZoomIn size={16} />
                                    </Button>
                                </Tooltip>

                                <Tooltip content="缩小 (-)" placement="bottom">
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="solid"
                                        color="default"
                                        className="bg-black/50 text-white hover:bg-black/70"
                                        onPress={zoomOut}
                                    >
                                        <ZoomOut size={16} />
                                    </Button>
                                </Tooltip>

                                <Tooltip content="旋转 (R)" placement="bottom">
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="solid"
                                        color="default"
                                        className="bg-black/50 text-white hover:bg-black/70"
                                        onPress={rotate}
                                    >
                                        <RotateCw size={16} />
                                    </Button>
                                </Tooltip>

                                <Tooltip content="重置 (0)" placement="bottom">
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="solid"
                                        color="default"
                                        className="bg-black/50 text-white hover:bg-black/70"
                                        onPress={resetImageState}
                                    >
                                        <Maximize2 size={16} />
                                    </Button>
                                </Tooltip>

                                <Tooltip content="关闭 (ESC)" placement="bottom">
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="solid"
                                        color="danger"
                                        className="bg-red-500/80 hover:bg-red-600/90"
                                        onPress={onModalClose}
                                    >
                                        <X size={16} />
                                    </Button>
                                </Tooltip>
                            </div>

                            {/* 快捷键提示 */}
                            <div className="absolute bottom-4 left-4 z-50 bg-black/50 text-white text-xs px-3 py-2 rounded-lg">
                                <div className="flex flex-col gap-1">
                                    <div>ESC: 关闭 | +/-: 缩放 | R: 旋转 | 0: 重置</div>
                                    <div>点击空白处关闭</div>
                                </div>
                            </div>

                            <ModalBody className="flex items-center justify-center h-full overflow-hidden">
                                {/* 点击背景关闭的区域 */}
                                <div className="absolute inset-0 z-10" onClick={onModalClose} />

                                {/* 图片容器 */}
                                <div
                                    className="relative z-20 flex items-center justify-center h-full w-full"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div
                                        className="max-w-none h-auto transition-transform duration-300 ease-out select-none relative"
                                        style={{
                                            transform: `scale(${scale}) rotate(${rotation}deg)`,
                                            maxHeight: '90vh',
                                            maxWidth: '90vw',
                                        }}
                                    >
                                        <Image
                                            src={src}
                                            alt={alt}
                                            width={width || 800}
                                            height={height || 600}
                                            className="max-h-[90vh] max-w-[90vw] w-auto h-auto"
                                            sizes="90vw"
                                            priority
                                            draggable={false}
                                            onLoad={(e) => {
                                                const img = e.target as HTMLImageElement;
                                                console.log(
                                                    `全屏图片尺寸: ${img.naturalWidth} x ${img.naturalHeight}`
                                                );
                                            }}
                                        />
                                    </div>
                                </div>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
