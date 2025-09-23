import {IFeature} from "@/types/project/Feature";
import DocsSectionDisplay from "@/components/project/docs/section/DocsSectionDisplay";
import ManualSectionDisplay from "@/components/project/manual/section/ManualSectionDisplay";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {HeadedTabs} from "headed-ui";


export default function FeatureDisplaySingle({
  feature,
  showDocs = true,
  showManual = true
}: {
  feature: IFeature;
  showDocs?: boolean;
  showManual?: boolean;
}){

    const tabs: string[] = [
  'Overview',
  ...(showDocs ? ['Docs'] : []),
  ...(showManual ? ['Manual'] : []),
];

  return (
    <div style={{ borderLeft: '10px solid var(--border-color)',
        borderBottom: 'var(--border-thickness) solid var(--border-color)',
        borderTop: 'var(--border-thickness) solid var(--border-color)',
        marginRight: '5vw', width: 'calc(100% - 5vw)', paddingLeft: '5px' }}>
      <h3>{feature.title} {feature.children.length > 0 && '(Parent)'}</h3>
              <p>State: {feature.state}</p>
        <HeadedTabs tabs={tabs}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{feature.description}</ReactMarkdown>
            {showDocs && <DocsSectionDisplay section={feature.docsSection!}/>}
            {showManual && <ManualSectionDisplay section={feature.manualSection!}/>}
        </HeadedTabs>

    </div>
  )
}