import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
    swSrc: 'app/sw.ts',
    swDest: 'public/sw.js',
    cacheOnNavigation: true,
    reloadOnOnline: true,
    disable: process.env.NODE_ENV === 'development',
    // 排除图片等大文件，使用运行时按需缓存
    exclude: [
        // 排除图片文件
        /\.(?:png|jpg|jpeg|gif|svg|webp|ico)$/i,
        // 排除用户上传的文件
        /^uploads\//,
        // 排除其他大文件
        /\.(?:mp4|webm|ogg|mp3|wav)$/i,
    ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withSerwist(nextConfig);
