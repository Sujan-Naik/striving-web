"use client"
import {HeadedTextAnim, TextAnimationType} from "headed-ui";
import Hero from "@/components/Hero";
import {useEffect, useState} from "react";
import Load from "@/components/Load";
import About from "@/components/About";

export default function Home() {
    const [showLoader, setShowLoader] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowLoader(false), 3000); // show for 3 seconds
        return () => clearTimeout(timer);
    }, []);

    if (showLoader) {
        console.log('load')
        return <Load/>; // Your loading component
    }
    return (
        <div
className="font-sans min-h-screen w-full">
        <main className="center-column">

                <h1
                    className="mx-auto max-w-3xl text-center text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
                >
                    Document as you Code
                </h1>

                <Hero/>
                <About/>
            </main>
        </div>
    );
}