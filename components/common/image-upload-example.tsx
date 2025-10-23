'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';

import { MultiImageUpload, ImageItem, imageUtils } from './image-upload';

// 使用示例组件
export function ImageUploadExample() {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [error, setError] = useState<string>('');

    const handleImageChange = (newImages: ImageItem[]) => {
        setImages(newImages);
        setError('');
    };

    const handleError = (errorMessage: string) => {
        setError(errorMessage);
    };

    // 获取封面图片信息
    const coverImage = imageUtils.getCoverImage(images);
    const allUrls = imageUtils.getImageUrls(images);

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">多图片上传 (支持封面选择)</h3>
                </CardHeader>
                <CardBody>
                    <MultiImageUpload
                        value={images}
                        onChange={handleImageChange}
                        onError={handleError}
                        enableCover={true}
                        maxCount={6}
                        maxSize={10}
                        className="mb-4"
                    />

                    {error && <div className="text-danger text-sm mb-4">{error}</div>}

                    {images.length > 0 && (
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-medium mb-2">当前图片信息:</h4>
                                <p className="text-sm text-default-600">
                                    共 {images.length} 张图片
                                </p>
                                {coverImage && (
                                    <p className="text-sm text-primary">
                                        封面图片: {coverImage.url.split('/').pop()}
                                    </p>
                                )}
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">所有图片URL:</h4>
                                <div className="text-xs text-default-600 space-y-1">
                                    {allUrls.map((url, index) => (
                                        <div key={index} className="break-all">
                                            {index + 1}. {url}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">普通多图片上传 (无封面选择)</h3>
                </CardHeader>
                <CardBody>
                    <MultiImageUpload
                        value={images}
                        onChange={handleImageChange}
                        onError={handleError}
                        enableCover={false}
                        maxCount={4}
                        maxSize={5}
                    />
                </CardBody>
            </Card>
        </div>
    );
}

// 在表单中使用的示例
export function FormExample() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        images: [] as ImageItem[],
    });

    const handleSubmit = () => {
        // 提交时的数据结构
        const submitData = {
            ...formData,
            coverImageUrl: imageUtils.getCoverImageUrl(formData.images),
            imageUrls: imageUtils.getImageUrls(formData.images),
        };

        console.log('提交数据:', submitData);
    };

    return (
        <Card>
            <CardHeader>
                <h3 className="text-lg font-semibold">表单使用示例</h3>
            </CardHeader>
            <CardBody className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        商品图片 (第一张将作为封面)
                    </label>
                    <MultiImageUpload
                        value={formData.images}
                        onChange={(images) => setFormData((prev) => ({ ...prev, images }))}
                        onError={(error) => console.error(error)}
                        enableCover={true}
                        maxCount={8}
                    />
                </div>

                <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-white rounded">
                    提交表单
                </button>
            </CardBody>
        </Card>
    );
}
