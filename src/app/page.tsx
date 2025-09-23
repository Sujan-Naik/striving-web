"use client"
import {HeadedCard, HeadedCarousel, HeadedStepper, HeadedTextAnim, TextAnimationType, VariantEnum} from "headed-ui";

import TypewriterHero from "@/components/TypewriterHero";
import Hero from "@/components/Hero";
import {useEffect, useState} from "react";
import Load from "@/components/Load";

export default function Home() {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 3000); // show for 3 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showLoader) {
      console.log('load')
    return <Load />; // Your loading component
  }
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="center-column">
        <HeadedTextAnim
          speed={50}
          delay={2000}
          animation={TextAnimationType.SLIDE_UP}
        >
          Document as you Code
        </HeadedTextAnim>
        <Hero />
      </main>
    </div>
  );
}