'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button, Card, CardBody, Progress } from '@heroui/react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface UploadedImage {
    filename: string;
    url: string;
    size: number;
    originalSize: number;
    compressionRatio: number;
    width?: number;
    height?: number;
}

interface ImageUploadProps {
    value?: string; // 当前图片URL
    onChange?: (url: string) => void; // 上传成功回调
    onError?: (error: string) => void; // 上传失败回调
    maxSize?: number; // 最大文件大小(MB)
    accept?: string; // 接受的文件类型
    placeholder?: string; // 占位文本
    className?: string;
}

export function ImageUpload({
    value,
    onChange,
    onError,
    maxSize = 20,
    accept = 'image/*',
    placeholder = '点击上传图片',
    className = '',
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [preview, setPreview] = useState<string | null>(value || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            onError?.('请选择图片文件');
            return;
        }

        // 验证文件大小
        if (file.size > maxSize * 1024 * 1024) {
            onError?.(`文件大小不能超过${maxSize}MB`);
            return;
        }

        // 显示预览
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // 上传文件
        await uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        setUploading(true);
        setProgress(0);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

            const response = await fetch(`${API_BASE_URL}/upload/image`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`上传失败: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.status === 'success') {
                const uploadedImage: UploadedImage = result.data;
                const fullUrl = uploadedImage.url;
                onChange?.(fullUrl);
                setProgress(100);
            } else {
                throw new Error(result.message || '上传失败');
            }
        } catch (error) {
            console.error('上传失败:', error);
            onError?.(error instanceof Error ? error.message : '上传失败');
            setPreview(value || null); // 恢复原始预览
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemove = () => {
        setPreview(null);
        onChange?.('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={className}>
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
            />

            <Card
                className={`relative overflow-hidden ${!preview ? 'border-2 border-dashed border-default-300 hover:border-primary cursor-pointer' : ''} transition-all duration-200`}
                isPressable={false}
            >
                <CardBody className="p-0">
                    {preview ? (
                        <div className="relative">
                            <div className="aspect-video bg-default-100 flex items-center justify-center overflow-hidden relative">
                                <Image
                                    src={preview}
                                    alt="预览图片"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    onLoad={(e) => {
                                        const img = e.target as HTMLImageElement;
                                        console.log(
                                            `图片尺寸: ${img.naturalWidth} x ${img.naturalHeight}`
                                        );
                                    }}
                                />
                            </div>

                            {!uploading && (
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="solid"
                                        color="primary"
                                        className="bg-black/50 hover:bg-black/70"
                                        onPress={handleClick}
                                    >
                                        <Upload size={14} />
                                    </Button>
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="solid"
                                        color="danger"
                                        className="bg-black/50 hover:bg-black/70"
                                        onPress={handleRemove}
                                    >
                                        <X size={14} />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div
                            className="aspect-video bg-default-50 flex flex-col items-center justify-center p-4 text-center cursor-pointer"
                            onClick={handleClick}
                        >
                            <ImageIcon size={32} className="text-default-400 mb-2" />
                            <p className="text-sm text-default-600 mb-1">{placeholder}</p>
                            <p className="text-xs text-default-400">
                                支持JPG、PNG、GIF、WebP格式，最大{maxSize}MB
                            </p>
                        </div>
                    )}

                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                            <div className="bg-white rounded-lg p-4 shadow-lg">
                                <p className="text-sm font-medium mb-2">上传中...</p>
                                <Progress
                                    size="sm"
                                    value={progress}
                                    color="primary"
                                    className="w-32"
                                />
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}

// 图片数据结构
interface ImageItem {
    url: string;
    isCover?: boolean;
}

// 多图片上传组件
interface MultiImageUploadProps {
    value?: ImageItem[]; // 当前图片数组
    onChange?: (images: ImageItem[]) => void; // 上传成功回调
    onError?: (error: string) => void; // 上传失败回调
    maxCount?: number; // 最大图片数量
    maxSize?: number; // 最大文件大小(MB)
    enableCover?: boolean; // 是否启用封面选择
    className?: string;
}

export function MultiImageUpload({
    value = [],
    onChange,
    onError,
    maxCount = 10,
    maxSize = 20,
    enableCover = false,
    className = '',
}: MultiImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [_uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        // 检查数量限制
        if (value.length + files.length > maxCount) {
            onError?.(`最多只能上传${maxCount}张图片`);
            return;
        }

        setUploading(true);

        const newImages: ImageItem[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileId = `${Date.now()}_${i}`;

            // 验证文件
            if (!file.type.startsWith('image/')) {
                onError?.(`文件 ${file.name} 不是图片格式`);
                continue;
            }

            if (file.size > maxSize * 1024 * 1024) {
                onError?.(`文件 ${file.name} 大小超过${maxSize}MB`);
                continue;
            }

            try {
                setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

                const formData = new FormData();
                formData.append('image', file);

                const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

                const response = await fetch(`${API_BASE_URL}/upload/image`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`上传失败: ${response.statusText}`);
                }

                const result = await response.json();

                if (result.status === 'success') {
                    const uploadedImage: UploadedImage = result.data;
                    const fullUrl = uploadedImage.url;
                    newImages.push({
                        url: fullUrl,
                        isCover: enableCover && value.length === 0 && i === 0, // 第一张图设为封面
                    });
                    setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));
                } else {
                    throw new Error(result.message || '上传失败');
                }
            } catch (error) {
                console.error(`上传文件 ${file.name} 失败:`, error);
                onError?.(error instanceof Error ? error.message : `上传文件 ${file.name} 失败`);
            } finally {
                setUploadProgress((prev) => {
                    const updated = { ...prev };
                    delete updated[fileId];
                    return updated;
                });
            }
        }

        if (newImages.length > 0) {
            onChange?.([...value, ...newImages]);
        }

        setUploading(false);

        // 清空文件输入
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemove = (index: number) => {
        const newImages = [...value];
        newImages.splice(index, 1);
        onChange?.(newImages);
    };

    const handleSetCover = (index: number) => {
        if (!enableCover) return;

        const newImages = value.map((img, i) => ({
            ...img,
            isCover: i === index,
        }));
        onChange?.(newImages);
    };

    const handleClick = () => {
        if (value.length >= maxCount) {
            onError?.(`最多只能上传${maxCount}张图片`);
            return;
        }
        fileInputRef.current?.click();
    };

    return (
        <div className={className}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />

            <div className="grid grid-cols-2 gap-2">
                {/* 已上传的图片 */}
                {value.map((image, index) => (
                    <Card
                        key={index}
                        className={`relative ${image.isCover && enableCover ? 'ring-2 ring-primary' : ''}`}
                    >
                        <CardBody className="p-0">
                            <div className="aspect-square bg-default-100 overflow-hidden relative">
                                <Image
                                    src={image.url}
                                    alt={`图片 ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    onLoad={(e) => {
                                        const img = e.target as HTMLImageElement;
                                        console.log(
                                            `图片${index + 1}尺寸: ${img.naturalWidth} x ${img.naturalHeight}`
                                        );
                                    }}
                                />
                            </div>

                            {/* 封面标识 */}
                            {image.isCover && enableCover && (
                                <div className="absolute top-1 left-1">
                                    <div className="bg-primary text-white text-xs px-1.5 py-0.5 rounded">
                                        封面
                                    </div>
                                </div>
                            )}

                            {/* 操作按钮 */}
                            <div className="absolute top-1 right-1 flex gap-1">
                                {enableCover && !image.isCover && (
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="solid"
                                        color="primary"
                                        className="bg-black/50 hover:bg-black/70"
                                        onPress={() => handleSetCover(index)}
                                        title="设为封面"
                                    >
                                        <ImageIcon size={12} />
                                    </Button>
                                )}
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="solid"
                                    color="danger"
                                    className="bg-black/50 hover:bg-black/70"
                                    onPress={() => handleRemove(index)}
                                >
                                    <X size={12} />
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                ))}

                {/* 上传按钮 */}
                {value.length < maxCount && (
                    <Card
                        className="border-2 border-dashed border-default-300 hover:border-primary"
                        isPressable={false}
                    >
                        <CardBody className="p-0">
                            <div
                                className="aspect-square bg-default-50 flex flex-col items-center justify-center cursor-pointer"
                                onClick={handleClick}
                            >
                                {uploading ? (
                                    <div className="text-center">
                                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
                                        <p className="text-xs text-default-600">上传中...</p>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={20} className="text-default-400 mb-1" />
                                        <p className="text-xs text-default-600">添加图片</p>
                                        <p className="text-xs text-default-400">
                                            {value.length}/{maxCount}
                                        </p>
                                    </>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                )}
            </div>
        </div>
    );
}

// 便捷的工具函数
export const imageUtils = {
    // 获取封面图片
    getCoverImage: (images: ImageItem[]): ImageItem | null => {
        return images.find((img) => img.isCover) || images[0] || null;
    },

    // 获取封面图片URL
    getCoverImageUrl: (images: ImageItem[]): string => {
        const cover = images.find((img) => img.isCover) || images[0];
        return cover?.url || '';
    },

    // 获取所有图片URL数组
    getImageUrls: (images: ImageItem[]): string[] => {
        return images.map((img) => img.url);
    },

    // 从URL数组创建ImageItem数组
    createFromUrls: (urls: string[], coverIndex = 0): ImageItem[] => {
        return urls.map((url, index) => ({
            url,
            isCover: index === coverIndex,
        }));
    },

    // 设置新的封面
    setCover: (images: ImageItem[], coverIndex: number): ImageItem[] => {
        return images.map((img, index) => ({
            ...img,
            isCover: index === coverIndex,
        }));
    },
};

// 类型导出
export type { ImageItem, ImageUploadProps, MultiImageUploadProps };
