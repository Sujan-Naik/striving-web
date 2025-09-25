// about.tsx
// Minimal, responsive, no colors, fewer fixed numbers.

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title">
      <h2 id="about-title">About Striving</h2>
      <p>
        Striving helps you plan software, structure features, and generate polished Documentation and Manuals—with GitHub and AI built in.
      </p>

      <div>
        <FlowDiagram />

        <section aria-labelledby="how-it-works">
          <h3 id="how-it-works">How it works</h3>
          <ul>
            <li>Create a project from your idea.</li>
            <li>Break it down into nested features (as deep as you need).</li>
            <li>Add Documentation Sections and Manual Sections to features.</li>
            <li>Organize sections into viewable Docs and Manuals (multiple per project).</li>
            <li>Connect GitHub to sync context and ship changes.</li>
            <li>Use AI tools for a chatbot and AI-powered GitHub edits.</li>
          </ul>
        </section>

        <FeatureTreeDiagram />

        <DocsManualsDiagram />

        <IntegrationsDiagram />
      </div>
    </section>
  );
}

/* ───────────────────────── Diagrams ───────────────────────── */

function FlowDiagram() {
  const view = { w: 960, h: 180 };
  // Scale helpers (based on original baseline)
  const sx = (n: number) => (n / 960) * view.w;
  const sy = (n: number) => (n / 180) * view.h;
  const fs = (n: number) => (n / 180) * view.h; // font size scales with height

  // Layout derived from viewBox
  const padX = sx(20);
  const cols = 5;
  const gridW = (view.w - padX * 2) / (cols - 1);
  const yMid = view.h / 2;
  const yTop = sy(55);
  const yBottom = view.h - yTop;
  const boxW = sx(180);
  const boxH = sy(48);
  const pillH = sy(28);

  const col = (i: number) => padX + i * gridW;

  return (
    <figure>
      <figcaption>Overview</figcaption>
      <svg role="img" aria-label="Flow from Idea to Project, Features/Sections to Docs/Manuals, then Publish" viewBox={`0 0 ${view.w} ${view.h}`} style={{ width: "100%", height: "auto" }}>
        <Defs />

        {/* Idea -> Project */}
        <FlowBox x={col(0)} y={yMid - boxH / 2} w={boxW} h={boxH} label="Idea" fs={fs} />
        <Arrow x1={col(0) + boxW} y1={yMid} x2={col(1) - sx(10)} y2={yMid} />
        <FlowBox x={col(1)} y={yMid - boxH / 2} w={sx(200)} h={boxH} label="Project" fs={fs} />

        {/* Features / Sections column */}
        <Arrow x1={col(1) + sx(200)} y1={yMid} x2={col(2) - sx(10)} y2={yMid} />
        <FlowBox x={col(2)} y={yTop - boxH / 2} w={sx(180)} h={boxH * 0.9} label="Features" sub="Nested" fs={fs} />
        <FlowBox x={col(2)} y={yBottom - boxH / 2} w={sx(180)} h={boxH * 0.9} label="Sections" sub="Docs + Manual" fs={fs} />

        {/* Docs / Manuals */}
        <Arrow x1={col(2) + sx(180)} y1={yTop} x2={col(3) - sx(10)} y2={yTop} />
        <Arrow x1={col(2) + sx(180)} y1={yBottom} x2={col(3) - sx(10)} y2={yBottom} />
        <FlowBox x={col(3)} y={yTop - boxH / 2} w={sx(140)} h={boxH * 0.9} label="Docs" fs={fs} />
        <FlowBox x={col(3)} y={yBottom - boxH / 2} w={sx(140)} h={boxH * 0.9} label="Manuals" fs={fs} />

        {/* Publish */}
        <Arrow x1={col(3) + sx(70)} y1={yBottom + boxH * 0.5} x2={col(3) + sx(70)} y2={view.h - sy(20)} />
        <FlowPill x={col(3)} y={view.h - sy(20) - pillH} w={sx(140)} h={pillH} label="Publish" fs={fs} />
      </svg>
    </figure>
  );
}

function FeatureTreeDiagram() {
  const view = { w: 960, h: 260 };
  const sx = (n: number) => (n / 960) * view.w;
  const sy = (n: number) => (n / 260) * view.h;
  const fs = (n: number) => (n / 260) * view.h;

  const padX = sx(40);
  const padY = sy(20);
  const col = (i: number, cols = 4) => padX + (i * (view.w - padX * 2)) / (cols - 1);

  const row1 = padY + sy(30);
  const row2a = row1 - sy(20);
  const row2b = row1 + sy(40);
  const row3a = row2b - sy(20);
  const row3b = row2b + sy(40);

  return (
    <figure>
      <figcaption>Feature hierarchy</figcaption>
      <svg role="img" aria-label="A project with nested features; each feature can have docs and manual sections" viewBox={`0 0 ${view.w} ${view.h}`} style={{ width: "100%", height: "auto" }}>
        <Defs />

        {/* Root project */}
        <Node x={col(0)} y={padY} label="Project: Striving" fs={fs} />

        {/* Level 1 features */}
        <Connector x1={col(0) + sx(140)} y1={padY + sy(30)} x2={col(1)} y2={row2a + sy(20)} />
        <Connector x1={col(0) + sx(140)} y1={padY + sy(30)} x2={col(1)} y2={row2b + sy(20)} />
        <Node x={col(1)} y={row2a} label="Feature: Planning" fs={fs} />
        <Node x={col(1)} y={row2b} label="Feature: Docs/Manuals" fs={fs} />

        {/* Level 2 under Docs/Manuals */}
        <Connector x1={col(1) + sx(160)} y1={row2b + sy(30)} x2={col(2)} y2={row3a + sy(20)} />
        <Connector x1={col(1) + sx(160)} y1={row2b + sy(30)} x2={col(2)} y2={row3b + sy(20)} />
        <Node x={col(2)} y={row3a} label="Docs Sections" chips={["Overview", "API", "Guides"]} fs={fs} />
        <Node x={col(2)} y={row3b} label="Manual Sections" chips={["Setup", "Operate", "Troubleshoot"]} fs={fs} />

        {/* Note */}
        <Note x={padX} y={view.h - sy(40)} text="Organize sections into multiple viewable Docs or Manuals per project." fs={fs} />
      </svg>
    </figure>
  );
}

function DocsManualsDiagram() {
  const view = { w: 960, h: 400 };
  const sx = (n: number) => (n / 960) * view.w;
  const sy = (n: number) => (n / 400) * view.h;
  const fs = (n: number) => (n / 400) * view.h;

  const pad = sx(40);
  const groupW = (view.w - pad * 3) / 2;
  const groupH = view.h - pad * 2;
  const leftX = pad;
  const rightX = pad * 2 + groupW;
  const top = pad;

  const rowGap = groupH * 0.35;
  const row1Y = top + sy(56);
  const row2Y = row1Y + rowGap;

  const stackW = Math.min(sx(180), groupW * 0.42);
  const outputW = Math.min(sx(300), groupW * 0.66);

  const arrowStartX = leftX + stackW + sx(60);
  const arrowEndX = rightX + sx(16);

  return (
    <figure>
      <figcaption>From sections to outputs</figcaption>
      <svg role="img" aria-label="Sections flow into multiple outputs" viewBox={`0 0 ${view.w} ${view.h}`} style={{ width: "100%", height: "auto" }}>
        <Defs />

        {/* Group frames (stroke only) */}
        <rect x={leftX} y={top} width={groupW} height={groupH} rx={sy(12)} fill="none" stroke="currentColor" />
        <rect x={rightX} y={top} width={groupW} height={groupH} rx={sy(12)} fill="none" stroke="currentColor" />

        {/* Labels */}
        <GroupLabel x={leftX + sx(12)} y={top + sy(18)} text="Sources" fs={fs} />
        <GroupLabel x={rightX + sx(12)} y={top + sy(18)} text="Outputs" fs={fs} />

        {/* Left: stacks */}
        <Stack x={leftX + sx(28)} y={row1Y} title="Documentation Sections" items={["Intro", "Concepts", "API", "Examples"]} width={stackW} fs={fs} />
        <Stack x={leftX + sx(28)} y={row2Y} title="Manual Sections" items={["Install", "Configure", "Operate", "Support"]} width={stackW} fs={fs} />

        {/* Right: outputs */}
        <OutputDoc x={rightX + sx(28)} y={row1Y} title="Docs: Developer Guide" tags={["Docs Sections"]} width={outputW} fs={fs} />
        <OutputDoc x={rightX + sx(28)} y={row2Y} title="Manual: User Handbook" tags={["Manual Sections"]} width={outputW} fs={fs} />

        {/* Arrows */}
        <Arrow x1={arrowStartX} y1={row1Y + sy(20)} x2={arrowEndX} y2={row1Y + sy(20)} />
        <Arrow x1={arrowStartX} y1={row2Y + sy(20)} x2={arrowEndX} y2={row2Y + sy(20)} />
      </svg>
    </figure>
  );
}

function IntegrationsDiagram() {
  const view = { w: 960, h: 180 };
  const sx = (n: number) => (n / 960) * view.w;
  const sy = (n: number) => (n / 180) * view.h;
  const fs = (n: number) => (n / 180) * view.h;

  const pad = sx(40);
  const cols = 3;
  const colX = (i: number) => pad + (i * (view.w - pad * 2 - sx(200))) / (cols - 1);
  const y = sy(40);

  return (
    <figure>
      <figcaption>GitHub + AI</figcaption>
      <svg role="img" aria-label="GitHub integration with AI-assisted edits and a chatbot" viewBox={`0 0 ${view.w} ${view.h}`} style={{ width: "100%", height: "auto" }}>
        <Defs />
        <IconBlock x={colX(0)} y={y} title="GitHub" subtitle="Sync, PRs, branches" fs={fs}>
          <GitHubMark x={sx(16)} y={sy(12)} size={sy(20)} />
        </IconBlock>

        <IconBlock x={colX(1)} y={y} title="AI Tools" subtitle="Chatbot + AI GitHub edits" fs={fs}>
          <AIGear x={sx(16)} y={sy(12)} size={sy(20)} />
        </IconBlock>

        <IconBlock x={colX(2)} y={y} title="Your Project" subtitle="Features, Docs, Manuals" fs={fs} />

        <Arrow x1={colX(0) + sx(200)} y1={y + sy(40)} x2={colX(1)} y2={y + sy(40)} />
        <Arrow x1={colX(1) + sx(200)} y1={y + sy(40)} x2={colX(2)} y2={y + sy(40)} />
        <Arrow x1={colX(2) + sx(100)} y1={y + sy(80)} x2={colX(0) + sx(100)} y2={y + sy(80)} dashed />
      </svg>

      <ul>
        <li>Connect repositories to pull context and push changes.</li>
        <li>Ask the chatbot about your project and docs.</li>
        <li>Generate or edit content with AI, then commit via GitHub.</li>
      </ul>
    </figure>
  );
}

/* ───────────────────────── SVG primitives ───────────────────────── */

function Defs() {
  return (
    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
        <path d="M0,0 L10,5 L0,10 Z" fill="currentColor" />
      </marker>
    </defs>
  );
}

function FlowBox({
  x, y, w, h, label, sub, fs,
}: {
  x: number; y: number; w: number; h: number; label: string; sub?: string; fs: (n: number) => number;
}) {
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx={Math.min(w, h) * 0.15} fill="none" stroke="currentColor" />
      <text x={x + w / 2} y={y + h / 2 - (sub ? fs(6) : 0)} textAnchor="middle" dominantBaseline="central" fontSize={fs(14)} fill="currentColor">
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + fs(10)} textAnchor="middle" dominantBaseline="central" fontSize={fs(12)} fill="currentColor" opacity={0.8}>
          {sub}
        </text>
      )}
    </>
  );
}

function FlowPill({
  x, y, w, h, label, fs,
}: {
  x: number; y: number; w: number; h: number; label: string; fs: (n: number) => number;
}) {
  const r = h / 2;
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx={r} fill="none" stroke="currentColor" />
      <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="central" fontSize={fs(13)} fill="currentColor">
        {label}
      </text>
    </>
  );
}

function Arrow({
  x1, y1, x2, y2, dashed = false,
}: {
  x1: number; y1: number; x2: number; y2: number; dashed?: boolean;
}) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="currentColor"
      strokeWidth={2}
      strokeDasharray={dashed ? "6 6" : undefined}
      markerEnd="url(#arrow)"
    />
  );
}

function Node({
  x, y, label, chips, fs,
}: {
  x: number; y: number; label: string; chips?: string[]; fs: (n: number) => number;
}) {
  const w = fs(220 * (260 / 220)); // maintain relative scale
  const h = chips ? fs(64 * (260 / 220)) : fs(40 * (260 / 220));
  const width = Math.max(w, fs(180));
  const height = h;

  return (
    <>
      <rect x={x} y={y} width={width} height={height} rx={fs(8)} fill="none" stroke="currentColor" />
      <text x={x + fs(12)} y={y + fs(20)} fontSize={fs(13)} fill="currentColor">
        {label}
      </text>
      {chips && (
        <>
          {chips.map((c, i) => (
            <g key={c}>
              <rect x={x + fs(12) + i * fs(72)} y={y + fs(34)} width={fs(64)} height={fs(20)} rx={fs(10)} fill="none" stroke="currentColor" />
              <text x={x + fs(12) + i * fs(72) + fs(32)} y={y + fs(44)} fontSize={fs(11)} textAnchor="middle" dominantBaseline="central" fill="currentColor">
                {c}
              </text>
            </g>
          ))}
        </>
      )}
    </>
  );
}

function Connector({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={2} />;
}

function Note({ x, y, text, fs }: { x: number; y: number; text: string; fs: (n: number) => number }) {
  const w = fs(520 * (260 / 220));
  const h = fs(32);
  return (
    <>
      <rect x={x} y={y - h / 2} width={w} height={h} rx={fs(6)} fill="none" stroke="currentColor" />
      <text x={x + fs(10)} y={y} fontSize={fs(12)} fill="currentColor" dominantBaseline="central">
        {text}
      </text>
    </>
  );
}

function GroupLabel({ x, y, text, fs }: { x: number; y: number; text: string; fs: (n: number) => number }) {
  return <text x={x} y={y} fontSize={fs(12)} fill="currentColor">{text}</text>;
}

function Stack({
  x, y, title, items, width, fs,
}: {
  x: number; y: number; title: string; items: string[]; width: number; fs: (n: number) => number;
}) {
  const itemH = fs(22);
  const gap = fs(2);
  return (
    <g>
      <text x={x} y={y} fontSize={fs(13)} fontWeight={600} fill="currentColor">{title}</text>
      {items.map((it, i) => {
        const iy = y + fs(10) + i * (itemH + fs(2));
        return (
          <g key={it}>
            <rect x={x} y={iy} width={width} height={itemH} rx={fs(6)} fill="none" stroke="currentColor" />
            <circle cx={x + fs(12)} cy={iy + itemH / 2} r={fs(4)} fill="currentColor" />
            <text x={x + fs(26)} y={iy + itemH / 2 + fs(3)} fontSize={fs(12)} fill="currentColor">
              {it}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function OutputDoc({
  x, y, title, tags, width, fs,
}: {
  x: number; y: number; title: string; tags: string[]; width: number; fs: (n: number) => number;
}) {
  const h = fs(44);
  return (
    <g>
      <rect x={x} y={y} width={width} height={h} rx={fs(8)} fill="none" stroke="currentColor" />
      <text x={x + fs(12)} y={y + fs(18)} fontSize={fs(13)} fill="currentColor">
        {title}
      </text>
      {tags.map((t, i) => (
        <g key={t}>
          <rect x={x + fs(12) + i * fs(120)} y={y + fs(24)} width={fs(110)} height={fs(18)} rx={fs(9)} fill="none" stroke="currentColor" />
          <text x={x + fs(12) + i * fs(120) + fs(55)} y={y + fs(33)} fontSize={fs(11)} textAnchor="middle" dominantBaseline="central" fill="currentColor">
            {t}
          </text>
        </g>
      ))}
    </g>
  );
}

function IconBlock({
  x, y, title, subtitle, children, fs,
}: {
  x: number; y: number; title: string; subtitle?: string; children?: React.ReactNode; fs: (n: number) => number;
}) {
  const w = 200;
  const h = 80;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={fs(10)} fill="none" stroke="currentColor" />
      <rect x={x} y={y} width={w} height={fs(30)} rx={fs(10)} fill="none" stroke="currentColor" />
      {children}
      <text x={x + fs(16)} y={y + fs(20)} fontSize={fs(12)} fontWeight={600} fill="currentColor">{title}</text>
      {subtitle && <text x={x + fs(16)} y={y + fs(52)} fontSize={fs(12)} fill="currentColor">{subtitle}</text>}
    </g>
  );
}

function GitHubMark({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <path
      aria-hidden="true"
      transform={`translate(${x}, ${y}) scale(${size / 24})`}
      fill="currentColor"
      d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56s0-1 0-2c-3.22.7-3.9-1.55-3.9-1.55a3.07 3.07 0 0 0-1.29-1.69c-1.05-.72.08-.71.08-.71a2.43 2.43 0 0 1 1.77 1.19 2.47 2.47 0 0 0 3.38 1 2.45 2.45 0 0 1 .73-1.54c-2.57-.29-5.27-1.28-5.27-5.68a4.45 4.45 0 0 1 1.19-3.09 4.13 4.13 0 0 1 .11-3.05s.97-.31 3.18 1.18a10.97 10.97 0 0 1 5.8 0c2.21-1.49 3.18-1.18 3.18-1.18a4.13 4.13 0 0 1 .11 3.05 4.45 4.45 0 0 1 1.19 3.09c0 4.41-2.71 5.38-5.29 5.66a2.76 2.76 0 0 1 .78 2.15c0 1.55 0 2.81 0 3.19 0 .31.21.68.79.56A11.5 11.5 0 0 0 12 .5Z"
    />
  );
}

function AIGear({ x, y, size }: { x: number; y: number; size: number }) {
  const s = size / 24;
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`} aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M12 2v3" />
        <path d="M12 19v3" />
        <path d="M2 12h3" />
        <path d="M19 12h3" />
        <path d="M4.2 4.2l2.1 2.1" />
        <path d="M17.7 17.7l2.1 2.1" />
        <path d="M4.2 19.8l2.1-2.1" />
        <path d="M17.7 6.3l2.1-2.1" />
      </g>
    </g>
  );
}