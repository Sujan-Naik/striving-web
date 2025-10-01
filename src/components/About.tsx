import {HeadedLink, VariantEnum} from "headed-ui";

export default function AboutPage() {
  return (
    <main 
      className="space-y-16 w-full p-6 min-h-screen transition-all duration-300"
      style={{ backgroundColor: 'var(--base-background)', color: 'var(--base-foreground)' }}
    >
      <header 
        className="w-full space-y-4 text-center py-8 px-6 rounded-lg shadow-lg backdrop-blur-sm border"
        style={{
          backgroundColor: 'var(--background-primary)',
          borderColor: 'var(--border-color)',
          borderRadius: 'var(--border-radius-large)'
        }}
      >
        <h1
          className="w-full text-5xl font-bold tracking-tight leading-tight"
          style={{ color: 'var(--foreground-primary)' }}
        >
          About Striving
        </h1>
        <p
          className="w-full text-xl leading-relaxed max-w-3xl mx-auto"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          Discover how ideas transform into comprehensive software projects through our structured workflow of features, documentation, and seamless integrations with Github.
        </p>
        <div
          className="w-24 h-1 mx-auto rounded-full"
          style={{ backgroundColor: 'var(--highlight)' }}
        ></div>
      </header>

      <section className="w-full">
        <div
          className="w-full p-8 rounded-lg shadow-lg border backdrop-blur-sm"
          style={{
            backgroundColor: 'var(--background-secondary)',
            borderColor: 'var(--border-color)',
            borderRadius: 'var(--border-radius-large)'
          }}
        >
          <FlowDiagram />

          <p
          style={{ color: 'var(--foreground-secondary)' }}
        >
            We offer <HeadedLink variant={VariantEnum.Outline} href={'/github'}>a GPT-5 powered Github Repository generator</HeadedLink>
             to create Github repositories or edit your currently available ones if desired!
          </p>
        </div>

      </section>

      <section className="w-full">
        <div
          className="w-full p-8 rounded-lg shadow-lg border backdrop-blur-sm"
          style={{
            backgroundColor: 'var(--background-secondary)',
            borderColor: 'var(--border-color)',
            borderRadius: 'var(--border-radius-large)'
          }}
        >
          <FeatureTree />
        </div>
      </section>

      <section className="w-full">
        <div
          className="w-full p-8 rounded-lg shadow-lg border backdrop-blur-sm"
          style={{
            backgroundColor: 'var(--background-secondary)',
            borderColor: 'var(--border-color)',
            borderRadius: 'var(--border-radius-large)'
          }}
        >
          <DocsManuals />
        </div>
      </section>

      <section className="w-full">
        <div
          className="w-full p-8 rounded-lg shadow-lg border backdrop-blur-sm"
          style={{
            backgroundColor: 'var(--background-secondary)',
            borderColor: 'var(--border-color)',
            borderRadius: 'var(--border-radius-large)'
          }}
        >
          <Integrations />
        </div>
      </section>
    </main>
  );
}

/* ---------------------- Shared SVG primitives ---------------------- */
function Defs() {
  return (
    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,10 L10,5 z" fill="var(--highlight)"/>
      </marker>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--background-primary)" stopOpacity="0.9"/>
        <stop offset="100%" stopColor="var(--background-secondary)" stopOpacity="0.7"/>
      </linearGradient>
      <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--highlight)" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="var(--hover)" stopOpacity="0.1"/>
      </linearGradient>
    </defs>
  );
}

function Arrow({
  x1,
  y1,
  x2,
  y2,
  dashed = false,
  strokeWidth = 2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dashed?: boolean;
  strokeWidth?: number;
}) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      strokeWidth={strokeWidth}
      strokeDasharray={dashed ? "8 4" : undefined}
      markerEnd="url(#arrow)"
      stroke="var(--hover)"
      filter="var(--hover)"
      opacity="0.8"
    />
  );
}

function RectText({
  x,
  y,
  w,
  h,
  rx = 0,
  title,
  subtitle,
  fs,
  subtitleOffset = 8,
  accent = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  rx?: number;
  title: string;
  subtitle?: string;
  fs: (n: number) => number;
  subtitleOffset?: number;
  accent?: boolean;
}) {
  return (
    <>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        fill={accent ? "url(#accentGradient)" : "url(#cardGradient)"}
        stroke="var(--border-color)"
        strokeWidth="1.5"
        filter="url(#glow)"
      />
      <text
        x={x + w / 2}
        y={y + h / 2 - (subtitle ? fs(subtitleOffset) : 0)}
        fontSize={fs(16)}
        fontWeight="600"
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--foreground-primary)"
      >
        {title}
      </text>
      {subtitle && (
        <text
          x={x + w / 2}
          y={y + h / 2 + fs(subtitleOffset)}
          fontSize={fs(12)}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--foreground-secondary)"
          opacity="0.8"
        >
          {subtitle}
        </text>
      )}
    </>
  );
}

/* ---------------------- Diagrams ---------------------- */
function FlowDiagram() {
  const viewW = 1000;
  const viewH = 200;
  const { sx, sy, fs } = makeScaler(viewW, viewH);
  const pad = sx(30);
  const cols = 4;
  const boxW = sx(180);
  const boxH = sy(50);
  const pillW = sx(150);
  const pillH = sy(32);

  const colCenter = (i: number) =>
    pad + boxW / 2 + (i * (viewW - 2 * (pad + boxW / 2))) / (cols - 1);
  const centerY = viewH / 2;

  const pillTop = viewH - sy(25) - pillH;
  const pillCenterY = pillTop + pillH / 2;
  const manualsBottom = centerY + sy(12) + boxH / 2;
  const arrowY1 = manualsBottom + sy(8);
  const arrowY2 = pillTop - sy(8);

  return (
    <figure className="w-full">
      <figcaption
        className="mb-4 text-xl font-bold tracking-wide"
        style={{ color: 'var(--foreground-primary)' }}
      >
        Development Flow Overview
      </figcaption>
      <svg
        role="img"
        aria-label="Development flow from Idea to Project to Features then Docs, Manuals, Publish"
        viewBox={`0 0 ${viewW} ${viewH}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto rounded-lg"
        style={{ backgroundColor: 'var(--background-tertiary)' }}
      >
        <Defs />

        {/* Background gradient */}
        <rect width={viewW} height={viewH} fill="url(#accentGradient)" rx="12" opacity="0.3"/>

        {/* Idea */}
        <RectText
          x={colCenter(0) - boxW / 2}
          y={centerY - boxH / 2}
          w={boxW}
          h={boxH}
          rx={boxH * 0.2}
          title="Idea"
          fs={fs}
        />
        <Arrow
          x1={colCenter(0) + boxW / 2}
          y1={centerY}
          x2={colCenter(1) - boxW / 2}
          y2={centerY}
          strokeWidth={2}
        />

        {/* Project */}
        <RectText
          x={colCenter(1) - boxW / 2}
          y={centerY - boxH / 2}
          w={boxW}
          h={boxH}
          rx={boxH * 0.2}
          title="Project"
          fs={fs}
        />
        <Arrow
          x1={colCenter(1) + boxW / 2}
          y1={centerY}
          x2={colCenter(2) - boxW / 2}
          y2={centerY}
        />

        {/* Features */}
        <RectText
          x={colCenter(2) - boxW / 2}
          y={centerY - boxH / 2}
          w={boxW}
          h={boxH}
          rx={boxH * 0.2}
          title="Features"
          fs={fs}
          accent={true}
        />
        <Arrow
          x1={colCenter(2) + boxW / 2}
          y1={centerY}
          x2={colCenter(3) - boxW / 2}
          y2={centerY}
        />

        {/* Docs */}
        <RectText
          x={colCenter(3) - boxW / 2}
          y={centerY - boxH - sy(15)}
          w={boxW}
          h={boxH}
          rx={boxH * 0.2}
          title="Docs"
          fs={fs}
        />

        {/* Manuals */}
        <RectText
          x={colCenter(3) - boxW / 2}
          y={centerY + sy(15)}
          w={boxW}
          h={boxH}
          rx={boxH * 0.2}
          title="Manuals"
          fs={fs}
        />

        {/* Arrow from Manuals to Publish */}
        <Arrow x1={colCenter(3)} y1={arrowY1} x2={colCenter(3)} y2={arrowY2} strokeWidth={3} />

        {/* Publish pill */}
        <rect
          x={colCenter(3) - pillW / 2}
          y={pillTop}
          width={pillW}
          height={pillH}
          rx={pillH / 2}
          fill="var(--highlight)"
          stroke="var(--border-color)"
          strokeWidth="2"
          filter="url(#glow)"
        />
        <text
          x={colCenter(3)}
          y={pillCenterY}
          fontSize={fs(14)}
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--foreground-primary)"
        >
          Publish
        </text>
      </svg>
    </figure>
  );
}

function FeatureTree() {
  const viewW = 1000;
  const viewH = 200;
  const { sx, sy, fs } = makeScaler(viewW, viewH);
  const rootX = viewW / 2;
  const rootY = sy(100);
  const boxW = sx(180);
  const boxH = sy(100);
  const childY = sy(300);
  const spread = sx(280);

  const features = ["Core Engine", "UI Components", "Integrations"];

  return (
    <figure className="w-full">
      <figcaption
        className="mb-4 text-xl font-bold tracking-wide"
        style={{ color: 'var(--foreground-primary)' }}
      >
        Feature Architecture Examples
      </figcaption>
      <svg
        role="img"
        aria-label="Feature tree showing core components and their relationships"
        viewBox={`0 0 ${viewW} ${viewH}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto rounded-lg"
        style={{ backgroundColor: 'var(--background-tertiary)' }}
      >
        <Defs />

        {/* Background */}
        <rect width={viewW} height={viewH} fill="url(#accentGradient)" rx="12" opacity="0.2"/>

        {/* Root Features */}
        <RectText
          x={rootX - boxW / 2}
          y={rootY - boxH / 2}
          w={boxW}
          h={boxH}
          rx={boxH * 0.2}
          title="Features"
          subtitle="Core System"
          fs={fs}
          accent={true}
        />

        {features.map((feature, i) => (
          <g key={i}>
            <Arrow
              x1={rootX}
              y1={rootY + boxH / 2}
              x2={rootX + (i - 1) * spread}
              y2={childY - sy(15)}
              strokeWidth={3}
            />
            <RectText
              x={rootX + (i - 1) * spread - boxW / 2}
              y={childY}
              w={boxW}
              h={boxH}
              rx={boxH * 0.2}
              title={feature}
              fs={fs}
            />
          </g>
        ))}
      </svg>
      <p>Features can be nested and own their relevant sections of documentation and manual sections</p>
      <p>These sections can be organised to create documentation and manuals and remain in sync forever!</p>
    </figure>
  );
}

function DocsManuals() {
  const viewW = 1000;
  const viewH = 200;
  const { sx, sy, fs } = makeScaler(viewW, viewH);

  const leftX = sx(250);
  const rightX = sx(750);
  const boxW = sx(200);
  const boxH = sy(100);
  const subBoxW = sx(150);
  const subBoxH = sy(50);
  const categoryY = sy(100);
  const subCategoryY = sy(300);
  const detailY = sy(500);

  const docTypes = [
    { title: "API Reference", items: ["REST API", "GraphQL", "Webhooks"] },
    { title: "Tutorials", items: ["Quick Start", "Advanced", "Examples"] },
    { title: "SDK Guides", items: ["JavaScript", "Python", "Go"] }
  ];

  const manualTypes = [
    { title: "User Manual", items: ["Setup", "Configuration", "Usage"] },
    { title: "Admin Guide", items: ["Installation", "Maintenance", "Security"] }
  ];

  return (
    <figure className="w-full">
      <figcaption
        className="mb-4 text-xl font-bold tracking-wide"
        style={{ color: 'var(--foreground-primary)' }}
      >
        Full Ecosystem Examples
      </figcaption>
      <svg
        role="img"
        aria-label="Documentation structure showing developer and user resources"
        viewBox={`0 0 ${viewW} ${viewH}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto rounded-lg"
        style={{ backgroundColor: 'var(--background-tertiary)' }}
      >
        <Defs />

        {/* Background sections */}
        <rect x="0" y="0" width={leftX + sx(500)} height={viewH} fill="url(#accentGradient)" rx="12" opacity="0.2"/>
        <rect x={rightX - sx(200)} y="0" width={sx(500)} height={viewH} fill="url(#accentGradient)" rx="12" opacity="0.15"/>

        {/* Main Documentation category */}
        <RectText
          x={leftX - boxW / 2}
          y={categoryY - boxH / 2}
          w={boxW}
          h={boxH}
          rx={boxH * 0.25}
          title="Documentation"
          fs={fs}
          accent={true}
        />

        {/* Main Manuals category */}
        <RectText
          x={rightX - boxW / 2}
          y={categoryY - boxH / 2}
          w={boxW}
          h={boxH}
          rx={boxH * 0.25}
          title="Manuals"
          fs={fs}
          accent={true}
        />

        {/* Documentation subcategories */}
        {docTypes.map((docType, i) => {
          const x = leftX + (i - 1) * sx(160);
          return (
            <g key={docType.title}>
              <Arrow
                x1={leftX}
                y1={categoryY + boxH / 2}
                x2={x}
                y2={subCategoryY - subBoxH / 2}
                strokeWidth={2}
              />
              <RectText
                x={x - subBoxW / 2}
                y={subCategoryY - subBoxH / 2}
                w={subBoxW}
                h={subBoxH}
                rx={subBoxH * 0.2}
                title={docType.title}
                fs={fs}
              />

              {docType.items.map((item, j) => {
                const detailX = x + (j - 1) * sx(50);
                return (
                  <g key={item}>
                    <line
                      x1={x}
                      y1={subCategoryY + subBoxH / 2}
                      x2={detailX}
                      y2={detailY - sy(10)}
                      stroke="var(--highlight)"
                      strokeWidth="1.5"
                      opacity="0.6"
                    />
                    <circle cx={detailX} cy={detailY} r="4" fill="var(--highlight)" opacity="0.8" />
                    <text
                      x={detailX}
                      y={detailY + sy(15)}
                      fontSize={fs(10)}
                      textAnchor="middle"
                      fill="var(--foreground-secondary)"
                      fontWeight="500"
                    >
                      {item}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Manual subcategories */}
        {manualTypes.map((manualType, i) => {
          const x = rightX + (i - 0.5) * sx(180);
          return (
            <g key={manualType.title}>
              <Arrow
                x1={rightX}
                y1={categoryY + boxH / 2}
                x2={x}
                y2={subCategoryY - subBoxH / 2}
                strokeWidth={2}
              />
              <RectText
                x={x - subBoxW / 2}
                y={subCategoryY - subBoxH / 2}
                w={subBoxW}
                h={subBoxH}
                rx={subBoxH * 0.2}
                title={manualType.title}
                fs={fs}
              />

              {manualType.items.map((item, j) => {
                const detailX = x + (j - 1) * sx(60);
                return (
                  <g key={item}>
                    <line
                      x1={x}
                      y1={subCategoryY + subBoxH / 2}
                      x2={detailX}
                      y2={detailY - sy(10)}
                      stroke="var(--highlight)"
                      strokeWidth="1.5"
                      opacity="0.6"
                    />
                    <circle cx={detailX} cy={detailY} r="4" fill="var(--highlight)" opacity="0.8" />
                    <text
                      x={detailX}
                      y={detailY + sy(15)}
                      fontSize={fs(10)}
                      textAnchor="middle"
                      fill="var(--foreground-secondary)"
                      fontWeight="500"
                    >
                      {item}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

function Integrations() {
  const viewW = 1000;
  const viewH = 280;
  const { sx, sy, fs } = makeScaler(viewW, viewH);
  const centerX = viewW / 2;
  const topY = sy(50);
  const boxW = sx(180);
  const boxH = sy(50);

  const systems = ["APIs", "Cloud Services", "Databases"];

  return (
      <p
          style={{ color: 'var(--foreground-secondary)' }}
        >
        Publish your completed manual to end-users or documentation to collaborators by sharing a link!
        </p>
  )
  // return (
  //   <figure className="w-full">
  //     <figcaption
  //       className="mb-4 text-xl font-bold tracking-wide"
  //       style={{ color: 'var(--foreground-primary)' }}
  //     >
  //       Integration Network
  //     </figcaption>
  //     <svg
  //       role="img"
  //       aria-label="Integration connections to external systems and services"
  //       viewBox={`0 0 ${viewW} ${viewH}`}
  //       preserveAspectRatio="xMidYMid meet"
  //       className="w-full h-auto rounded-lg"
  //       style={{ backgroundColor: 'var(--background-tertiary)' }}
  //     >
  //       <Defs />
  //
  //       {/* Background */}
  //       <rect width={viewW} height={viewH} fill="url(#accentGradient)" rx="12" opacity="0.3"/>
  //
  //       {/* Central Publish node */}
  //       <RectText
  //         x={centerX - boxW / 2}
  //         y={topY}
  //         w={boxW}
  //         h={boxH}
  //         rx={boxH * 0.25}
  //         title="Publish"
  //         subtitle="Distribution Hub"
  //         fs={fs}
  //         accent={true}
  //       />
  //
  //       {systems.map((system, i) => (
  //         <g key={i}>
  //           <Arrow
  //             x1={centerX}
  //             y1={topY + boxH}
  //             x2={centerX + (i - 1) * sx(280)}
  //             y2={sy(180)}
  //             dashed={i === 1}
  //             strokeWidth={3}
  //           />
  //           <RectText
  //             x={centerX + (i - 1) * sx(280) - boxW / 2}
  //             y={sy(180)}
  //             w={boxW}
  //             h={boxH}
  //             rx={boxH * 0.2}
  //             title={system}
  //             fs={fs}
  //           />
  //         </g>
  //       ))}
  //
  //       {/* Connection indicators */}
  //       <g transform={`translate(${sx(50)}, ${sy(50)})`}>
  //         <text fontSize={fs(11)} fill="var(--foreground-secondary)" fontWeight="500">Status:</text>
  //         <line x1="0" y1="15" x2="20" y2="15" stroke="var(--highlight)" strokeWidth="2" />
  //         <text x="25" y="15" fontSize={fs(9)} fill="var(--foreground-secondary)" dominantBaseline="central">Active</text>
  //         <line x1="0" y1="30" x2="20" y2="30" stroke="var(--highlight)" strokeWidth="2" strokeDasharray="8 4" />
  //         <text x="25" y="30" fontSize={fs(9)} fill="var(--foreground-secondary)" dominantBaseline="central">Pending</text>
  //       </g>
  //     </svg>
  //   </figure>
  // );
}

/* ---------------------- Utility ---------------------- */
function makeScaler(viewW: number, viewH: number) {
  const baseW = 1000;
  const baseH = 600;
  const sx = (n: number) => (n * viewW) / baseW;
  const sy = (n: number) => (n * viewH) / baseH;
  const fs = (n: number) => Math.round(sx(n));
  return { sx, sy, fs };
}