'use client';

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { Wifi, ExternalLink } from 'lucide-react';

interface CampusNetworkPromptProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    targetUrl?: string;
}

/**
 * 校园网提示弹窗组件
 * 在跳转外部链接前提示用户连接校园 WiFi
 */
export function CampusNetworkPrompt({
    isOpen,
    onClose,
    onConfirm,
    targetUrl,
}: CampusNetworkPromptProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Wifi className="w-5 h-5 text-primary" />
                        <span>校园网提示</span>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-3">
                        <p className="text-sm text-default-600">
                            即将跳转到外部链接，为了确保正常访问，请先连接校园 WiFi：
                        </p>
                        <div className="bg-default-100 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="text-sm font-medium">HUBU-WLAN</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="text-sm font-medium">HUBU-STUDENT</span>
                            </div>
                        </div>
                        {targetUrl && (
                            <p className="text-xs text-default-400 break-all">
                                目标地址：{targetUrl}
                            </p>
                        )}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                        取消
                    </Button>
                    <Button
                        color="primary"
                        startContent={<ExternalLink size={16} />}
                        onPress={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        继续跳转
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
