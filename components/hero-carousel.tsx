'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@heroui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { defaultSlides, CarouselItem } from '@/config/banner';

interface HeroCarouselProps {
    slides?: CarouselItem[];
    autoPlayInterval?: number;
}

export const HeroCarousel = ({
    slides = defaultSlides,
    autoPlayInterval = 5000,
}: HeroCarouselProps) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, autoPlayInterval);

        return () => clearInterval(timer);
    }, [slides.length, autoPlayInterval]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    const goToPrevious = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const goToNext = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const handleSlideClick = (slide: CarouselItem) => {
        if (slide.link) {
            router.push(slide.link);
        }
    };

    return (
        <div className="relative w-full">
            <Card className="w-full overflow-hidden">
                <div className="relative h-48">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`absolute inset-0 transition-opacity duration-500 ${
                                index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                            style={{
                                pointerEvents: index === currentSlide ? 'auto' : 'none',
                            }}
                        >
                            <div
                                className={`w-full h-full bg-cover bg-center bg-no-repeat ${
                                    slide.link ? 'cursor-pointer' : ''
                                }`}
                                style={{ backgroundImage: `url(${slide.image})` }}
                                onClick={() => handleSlideClick(slide)}
                            >
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <div className="text-center text-white px-4">
                                        <h2 className="text-xl font-bold mb-2">{slide.title}</h2>
                                        <p className="text-sm opacity-90">{slide.subtitle}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button
                        isIconOnly
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
                        variant="flat"
                        onPress={goToPrevious}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <Button
                        isIconOnly
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
                        variant="flat"
                        onPress={goToNext}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </Card>

            <div className="flex justify-center mt-3 gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentSlide
                                ? 'bg-primary'
                                : 'bg-default-300 hover:bg-default-400'
                        }`}
                        onClick={() => goToSlide(index)}
                    />
                ))}
            </div>
        </div>
    );
};
