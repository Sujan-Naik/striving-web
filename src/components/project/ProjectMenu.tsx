'use client';
import { useProject } from "@/context/ProjectContext";
import { HeadedLink, VariantEnum } from "headed-ui";
import {FiUsers, FiBox, FiBook, FiStar, FiFileText, FiHome} from "react-icons/fi";
import { useState, useEffect, useRef } from "react";

export function ProjectMenu() {
  const project = useProject();
  const [useIcons, setUseIcons] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { href: '', text: 'Project Home', icon: FiHome },
    { href: 'members', text: 'Members', icon: FiUsers },
    // { href: 'members/applications', text: 'Applications', icon: FiBox },
    { href: 'features', text: 'Features', icon: FiStar },
    { href: 'features/docs', text: 'Docs', icon: FiBook },
    { href: 'features/manual', text: 'Manual', icon: FiFileText },
  ];

  useEffect(() => {
    const checkSpace = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.offsetWidth;

      // Check if text content fits
      setUseIcons(false);
      setTimeout(() => {
        if (container.scrollWidth > containerWidth) {
          setUseIcons(true);
        }
      }, 0);
    };

    checkSpace();
    window.addEventListener('resize', checkSpace);
    return () => window.removeEventListener('resize', checkSpace);
  }, []);

  return (
    <div
      ref={containerRef}
      className="mb-6"
      style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', padding: '6px'}}
    >
      {menuItems.map(({ href, text, icon: Icon }) => (
        <HeadedLink
          key={href}
          variant={VariantEnum.Outline}
          href={`/projects/${project!.name}/${href}`}
        >
          {useIcons ? <Icon /> : text}
        </HeadedLink>
      ))}
    </div>
  );
}