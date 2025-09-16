'use client';

import { Card, CardBody } from '@heroui/react';
import { CheckCircle, Phone, MessageCircle, Mail, Clock } from 'lucide-react';

export default function DrivingSchool() {
    return (
        <>
            {/* 横幅区域 */}
            <section className="relative w-full h-64 mb-4 overflow-hidden rounded-lg">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url(/driving-school-banner1.jpg)',
                    }}
                >
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative h-full flex items-center justify-center text-center text-white z-10">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">众诚驾校</h1>
                            <p className="text-lg">万平训练场 总校直营 湖大双校区全覆盖</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 视频介绍区域 */}
            <section className="w-full py-2">
                <Card className="mb-4">
                    <CardBody className="p-4">
                        <h3 className="text-lg font-bold mb-3">驾校介绍视频</h3>
                        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                            <video
                                className="w-full h-full object-cover"
                                controls
                                poster="/driving-school-banner1.jpg"
                            >
                                <source
                                    src="https://upos-sz-estghw.bilivideo.com/upgcxcode/80/29/31352162980/31352162980-1-16.mp4?e=ig8euxZM2rNcNbRVhwdVhwdlhWdVhwdVhoNvNC8BqJIzNbfq9rVEuxTEnE8L5F6VnEsSTx0vkX8fqJeYTj_lta53NCM=&uipk=5&mid=0&deadline=1757650470&nbs=1&oi=1039303078&og=hw&platform=html5&trid=ee852262b60640e98397aa00bb0357bh&gen=playurlv3&os=estghw&upsig=e87fc6d61cf1a666009ea5918588f823&uparams=e,uipk,mid,deadline,nbs,oi,og,platform,trid,gen,os&bvc=vod&nettype=0&bw=490217&buvid=&build=0&dl=0&f=h_0_0&agrr=0&orderid=0,1"
                                    type="video/mp4"
                                />
                                您的浏览器不支持视频播放
                            </video>
                        </div>
                    </CardBody>
                </Card>
            </section>

            {/* 路线指引区域 */}
            <section className="w-full py-2">
                <Card className="mb-4">
                    <CardBody className="p-4">
                        <h3 className="text-lg font-bold mb-3">路线指引</h3>
                        <div className="relative w-full aspect-[9/16] max-h-[70vh] bg-black rounded-lg overflow-hidden mb-3 mx-auto">
                            <video
                                className="w-full h-full object-contain"
                                controls
                                poster="/driving-school-banner1.jpg"
                            >
                                <source src="/driving-school-video.mp4" type="video/mp4" />
                                您的浏览器不支持视频播放
                            </video>
                        </div>
                        <p className="text-default-600 text-sm">
                            观看此视频了解如何到达众诚驾校的详细路线
                        </p>
                    </CardBody>
                </Card>
            </section>

            {/* 驾校特色区域 */}
            <section className="w-full py-2">
                <Card className="mb-4">
                    <CardBody className="p-4">
                        <h3 className="text-lg font-bold mb-4">驾校特色</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                '数十台教练车+数十名教练',
                                '随到随学 无需预约练车时间',
                                '全天早中晚班开放',
                                '报名前接受试乘试驾',
                                '教练20岁出头，温柔细致',
                                '不收礼，不偏袒！最快一个月拿证',
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 bg-default-50 rounded-lg"
                                >
                                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                                    <span className="text-sm">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            </section>

            {/* 联系我们区域 */}
            <section className="w-full py-2">
                <Card>
                    <CardBody className="p-4">
                        <h3 className="text-lg font-bold mb-4">联系我们</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 bg-default-50 rounded-lg">
                                <Phone className="w-6 h-6 text-primary flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-default-600 mb-1">咨询电话</div>
                                    <div className="font-medium">13422950430</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-3 bg-default-50 rounded-lg">
                                <MessageCircle className="w-6 h-6 text-success flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-default-600 mb-1">微信</div>
                                    <div className="font-medium">13422950430</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-3 bg-default-50 rounded-lg">
                                <Mail className="w-6 h-6 text-warning flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-default-600 mb-1">QQ</div>
                                    <div className="font-medium">1205957952</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-3 bg-default-50 rounded-lg">
                                <Clock className="w-6 h-6 text-secondary flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-default-600 mb-1">营业时间</div>
                                    <div className="font-medium">周一至周日 8:00-18:00</div>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </section>
        </>
    );
}
