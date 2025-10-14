'use client';

import type { Activity } from '@/types/activity';

import { useState, useEffect } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Image,
    Card,
    CardBody,
} from '@heroui/react';
import { X } from 'lucide-react';

interface ActivityModalProps {
    modal: Activity;
    /** 是否立即显示（用于自动打开的弹窗） */
    isOpen: boolean;
    /** 关闭回调 */
    onClose: () => void;
}

/**
 * 活动弹窗组件
 * 支持图片和文字两种类型的内容展示
 */
export function ActivityModalComponent({ modal, isOpen, onClose }: ActivityModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="2xl"
            scrollBehavior="inside"
            classNames={{
                base: 'mx-4',
                body: 'py-6',
                header: 'border-b border-default-200',
                footer: 'border-t border-default-200',
            }}
        >
            <ModalContent>
                {(onModalClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold">{modal.title}</h3>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    onPress={onModalClose}
                                    aria-label="关闭"
                                >
                                    <X size={20} />
                                </Button>
                            </div>
                        </ModalHeader>
                        <ModalBody>
                            {modal.type === 'IMAGE' && modal.imageUrl && (
                                <div className="w-full">
                                    <Image
                                        src={modal.imageUrl}
                                        alt={modal.title}
                                        className="w-full h-auto"
                                        classNames={{
                                            wrapper: 'w-full',
                                        }}
                                    />
                                </div>
                            )}
                            {modal.type === 'TEXT' && modal.content && (
                                <div className="whitespace-pre-wrap text-default-700">
                                    {modal.content}
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onPress={onModalClose} className="w-full">
                                {modal.buttonText || '确定'}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

interface ManualModalCardProps {
    modal: Activity;
    onOpen: () => void;
}

/**
 * 手动打开的弹窗卡片
 * 显示在页面底部，用户点击后打开弹窗
 */
export function ManualModalCard({ modal, onOpen }: ManualModalCardProps) {
    return (
        <Card
            isPressable
            onPress={onOpen}
            className="w-full hover:scale-[1.02] transition-transform"
        >
            <CardBody className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h4 className="font-semibold text-base mb-1">{modal.title}</h4>
                        {modal.type === 'TEXT' && modal.content && (
                            <p className="text-sm text-default-600 line-clamp-2">
                                {modal.content.split('\n')[0]}
                            </p>
                        )}
                        {modal.type === 'IMAGE' && (
                            <p className="text-sm text-default-600">点击查看活动详情</p>
                        )}
                    </div>
                    <Button size="sm" color="primary" variant="flat">
                        {modal.buttonText || '查看'}
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
}

interface ActivityModalsContainerProps {
    modals: Activity[];
}

/**
 * 活动弹窗容器组件
 * 管理多个弹窗的显示逻辑
 */
export function ActivityModalsContainer({ modals }: ActivityModalsContainerProps) {
    const [openModalId, setOpenModalId] = useState<string | null>(null);
    const [hasAutoOpened, setHasAutoOpened] = useState(false);

    // 页面加载时自动打开第一个启用且自动打开的弹窗
    useEffect(() => {
        if (!hasAutoOpened) {
            const autoOpenModal = modals.find((m) => m.enabled && m.autoOpen);
            if (autoOpenModal) {
                setOpenModalId(autoOpenModal.id);
                setHasAutoOpened(true);
            }
        }
    }, [modals, hasAutoOpened]);

    const enabledModals = modals.filter((m) => m.enabled);
    const manualModals = enabledModals.filter((m) => !m.autoOpen);
    const currentModal = enabledModals.find((m) => m.id === openModalId);

    return (
        <>
            {/* 弹窗组件 */}
            {currentModal && (
                <ActivityModalComponent
                    modal={currentModal}
                    isOpen={openModalId === currentModal.id}
                    onClose={() => setOpenModalId(null)}
                />
            )}

            {/* 手动打开的弹窗卡片列表 */}
            {manualModals.length > 0 && (
                <div className="space-y-2">
                    {manualModals.map((modal) => (
                        <ManualModalCard
                            key={modal.id}
                            modal={modal}
                            onOpen={() => setOpenModalId(modal.id)}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
