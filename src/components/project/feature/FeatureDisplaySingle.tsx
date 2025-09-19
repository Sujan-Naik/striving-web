import {IFeature} from "@/types/project/Feature";
import DocsSectionDisplay from "@/components/project/docs/section/DocsSectionDisplay";
import ManualSectionDisplay from "@/components/project/manual/section/ManualSectionDisplay";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


export default function FeatureDisplaySingle({
  feature,
  showDocs = true,
  showManual = true
}: {
  feature: IFeature;
  showDocs?: boolean;
  showManual?: boolean;
}){

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
      <h3>{feature.title} {feature.children.length > 0 && '(Parent)'}</h3>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{feature.description}</ReactMarkdown>
      <p>State: {feature.state}</p>
      {showDocs && <DocsSectionDisplay section={feature.docsSection!}/>}
      {showManual && <ManualSectionDisplay section={feature.manualSection!}/>}
    </div>
  )
}