'use client';

import type { Activity } from '@/types/activity';

import { useEffect, useState } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Spinner,
    Modal,
    ModalContent,
    ModalBody,
    Button,
} from '@heroui/react';
import { Heart, MessageCircle, Share2, X, EyeOff } from 'lucide-react';

import { ImageViewer } from '@/components/common/image-viewer';

const STORAGE_KEY_PREFIX = 'activity_hidden_';
const STORAGE_KEY_LAST_SHOWN = 'activity_last_shown_';

/**
 * 活动页面 - 朋友圈风格
 */
export default function ActivityPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalActivity, setModalActivity] = useState<Activity | null>(null);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await fetch('/api/activity');
            const result = await response.json();

            if (result.status === 'success' && result.data) {
                const enabledActivities = result.data.filter((a: Activity) => a.enabled);
                setActivities(enabledActivities);

                // 检查是否需要自动弹窗
                checkAndShowModal(enabledActivities);
            }
        } catch (error) {
            console.error('获取活动列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 检查并显示弹窗
    const checkAndShowModal = (acts: Activity[]) => {
        if (acts.length === 0) return;

        // 找到第一个未被永久隐藏且今天还没显示过的活动
        const now = Date.now();
        const today = new Date().toDateString();

        for (const activity of acts) {
            // 检查是否被永久隐藏
            const isPermanentlyHidden =
                localStorage.getItem(STORAGE_KEY_PREFIX + activity.id) === 'true';
            if (isPermanentlyHidden) continue;

            // 检查今天是否已显示过
            const lastShown = localStorage.getItem(STORAGE_KEY_LAST_SHOWN + activity.id);
            const lastShownDate = lastShown ? new Date(parseInt(lastShown)).toDateString() : null;

            if (lastShownDate !== today) {
                // 记录本次显示时间
                localStorage.setItem(STORAGE_KEY_LAST_SHOWN + activity.id, now.toString());
                // 显示弹窗
                setModalActivity(activity);
                break;
            }
        }
    };

    // 永久不再显示
    const handleNeverShowAgain = (activityId: string) => {
        localStorage.setItem(STORAGE_KEY_PREFIX + activityId, 'true');
        setModalActivity(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <>
            {/* 页面标题 */}
            <section className="w-full py-2">
                <div className="text-center mb-3">
                    <h2 className="text-xl font-bold mb-2">校园动态</h2>
                    <p className="text-sm text-default-600">了解最新的校园资讯</p>
                </div>
            </section>

            {/* 活动列表 - 朋友圈风格 */}
            <section className="w-full py-2">
                <div className="space-y-3">
                    {activities.length === 0 ? (
                        <Card>
                            <CardBody className="text-center py-8">
                                <p className="text-default-500">暂无动态</p>
                            </CardBody>
                        </Card>
                    ) : (
                        activities.map((activity) => (
                            <Card key={activity.id} className="w-full">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                                            湖
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold">湖大萧云</p>
                                            <p className="text-xs text-default-500">
                                                {new Date(activity.createdAt).toLocaleString(
                                                    'zh-CN',
                                                    {
                                                        month: 'numeric',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    }
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardBody className="pt-2">
                                    {/* 文字内容 */}
                                    <p className="text-default-700 whitespace-pre-wrap mb-3">
                                        {activity.content}
                                    </p>

                                    {/* 图片网格 - 使用 ImageViewer */}
                                    {activity.images.length > 0 && (
                                        <div
                                            className={`grid gap-1 ${
                                                activity.images.length === 1
                                                    ? 'grid-cols-1'
                                                    : activity.images.length === 2 ||
                                                        activity.images.length === 4
                                                      ? 'grid-cols-2'
                                                      : 'grid-cols-3'
                                            }`}
                                        >
                                            {activity.images.map((img, index) => (
                                                <div
                                                    key={index}
                                                    className={`${activity.images.length === 1 ? 'max-w-sm' : ''}`}
                                                >
                                                    <ImageViewer
                                                        src={img}
                                                        alt={`活动图片 ${index + 1}`}
                                                        thumbnailClassName="rounded-lg aspect-square"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* 互动按钮 */}
                                    <div className="flex items-center gap-6 mt-4 pt-3 border-t border-default-200">
                                        <button className="flex items-center gap-1 text-default-500 hover:text-danger transition-colors">
                                            <Heart size={18} />
                                            <span className="text-sm">点赞</span>
                                        </button>
                                        <button className="flex items-center gap-1 text-default-500 hover:text-primary transition-colors">
                                            <MessageCircle size={18} />
                                            <span className="text-sm">评论</span>
                                        </button>
                                        <button className="flex items-center gap-1 text-default-500 hover:text-success transition-colors">
                                            <Share2 size={18} />
                                            <span className="text-sm">分享</span>
                                        </button>
                                    </div>
                                </CardBody>
                            </Card>
                        ))
                    )}
                </div>
            </section>

            {/* 自动弹窗 */}
            {modalActivity && (
                <Modal
                    isOpen={true}
                    onClose={() => setModalActivity(null)}
                    size="2xl"
                    scrollBehavior="inside"
                    classNames={{
                        base: 'mx-4',
                    }}
                >
                    <ModalContent>
                        <ModalBody className="p-6">
                            {/* 头部 */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                                        湖
                                    </div>
                                    <div>
                                        <p className="font-semibold">湖大萧云</p>
                                        <p className="text-xs text-default-500">
                                            {new Date(modalActivity.createdAt).toLocaleString(
                                                'zh-CN'
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    onPress={() => setModalActivity(null)}
                                >
                                    <X size={20} />
                                </Button>
                            </div>

                            {/* 内容 */}
                            <div className="space-y-4">
                                <p className="text-default-700 whitespace-pre-wrap">
                                    {modalActivity.content}
                                </p>

                                {/* 图片 - 使用 ImageViewer */}
                                {modalActivity.images.length > 0 && (
                                    <div
                                        className={`grid gap-2 ${
                                            modalActivity.images.length === 1
                                                ? 'grid-cols-1'
                                                : modalActivity.images.length === 2 ||
                                                    modalActivity.images.length === 4
                                                  ? 'grid-cols-2'
                                                  : 'grid-cols-3'
                                        }`}
                                    >
                                        {modalActivity.images.map((img, index) => (
                                            <ImageViewer
                                                key={index}
                                                src={img}
                                                alt={`活动图片 ${index + 1}`}
                                                thumbnailClassName="rounded-lg aspect-square"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 底部按钮 */}
                            <div className="flex gap-2 mt-6">
                                <Button
                                    variant="flat"
                                    color="default"
                                    className="flex-1"
                                    startContent={<EyeOff size={16} />}
                                    onPress={() => handleNeverShowAgain(modalActivity.id)}
                                >
                                    不再显示
                                </Button>
                                <Button
                                    color="primary"
                                    className="flex-1"
                                    onPress={() => setModalActivity(null)}
                                >
                                    知道了
                                </Button>
                            </div>
                        </ModalBody>
                    </ModalContent>
                </Modal>
            )}
        </>
    );
}
