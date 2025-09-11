"use client"
import {HeadedCard, HeadedCarousel, HeadedStepper, HeadedTextAnim, TextAnimationType, VariantEnum} from "headed-ui";

import {
    FaGithub,
    FaGoogle,
    FaSpotify,
    FaRobot,
    FaEnvelope,
    FaCalendarAlt,
    FaYoutube,
    FaMusic,
    FaPodcast,
    FaHeart,
    FaList,
    FaCode,
    FaUsers,
    FaStar,
    FaBook,
    FaBrain,
    FaComments,
    FaLanguage,
    FaImage,
    FaGoogleDrive
} from "react-icons/fa";
import TypewriterHero from "@/components/TypewriterHero";
import Hero from "@/components/Hero";

export default function Home() {
    return (
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <main className="center-column">

                <HeadedTextAnim speed={50} delay={2000} animation={TextAnimationType.SLIDE_UP}>
                    Document as you Code
                </HeadedTextAnim>
                <Hero></Hero>

            </main>
        </div>
    );
}