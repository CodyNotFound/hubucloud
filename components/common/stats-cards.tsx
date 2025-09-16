'use client';

import type { LucideIcon } from 'lucide-react';

import { Card, CardBody } from '@heroui/react';

export interface StatsItem {
    title: string;
    value: number;
    icon: LucideIcon;
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    description: string;
}

export interface StatsCardsProps {
    items: StatsItem[];
    className?: string;
}

export function StatsCards({ items, className = '' }: StatsCardsProps) {
    const colorClasses = {
        primary: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary/10 text-secondary',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        danger: 'bg-danger/10 text-danger',
    };

    return (
        <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 ${className}`}
        >
            {items.map((item, index) => {
                const Icon = item.icon;
                const colorClass = colorClasses[item.color];

                return (
                    <Card key={index} className="hover:scale-105 transition-transform">
                        <CardBody>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className={`p-2 rounded-lg w-fit ${colorClass} mb-3`}>
                                        <Icon size={20} />
                                    </div>
                                    <h3 className="text-sm font-medium text-default-600 mb-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-2xl font-bold text-default-900 mb-1">
                                        {item.value.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-default-500">{item.description}</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                );
            })}
        </div>
    );
}
