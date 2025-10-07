'use client';
import {useEffect, useState} from 'react';

interface TypewriterProps {
    fullText: string;
}

export default function TypewriterHero({fullText}: TypewriterProps) {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        let index = 0;
        const timer = setInterval(() => {
            setDisplayText(fullText.slice(0, index + 1));
            index++;
            if (index === fullText.length) clearInterval(timer);
        }, 50);

        return () => clearInterval(timer);
    }, []);

    return <h1 style={{textAlign: 'center'}}>{displayText}</h1>;
}