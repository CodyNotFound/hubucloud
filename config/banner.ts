export interface CarouselItem {
    id: number;
    title: string;
    subtitle: string;
    image: string;
    link?: string;
}

export const defaultSlides: CarouselItem[] = [
    // {
    //     id: 1,
    //     title: '联通校园卡',
    //     subtitle: '超多流量 高速宽带',
    //     image: '/banner/unicom.webp',
    //     link: '/unicom',
    // },
    {
        id: 2,
        title: '萧云黑卡',
        subtitle: '湖北大学 全校通用',
        image: '/banner/vipcard.webp',
        link: '/card',
    },
    {
        id: 3,
        title: ' 众诚驾校',
        subtitle: '学校学车更方便',
        image: '/banner/drivingschool.webp',
        link: '/drivingschool',
    },
];
