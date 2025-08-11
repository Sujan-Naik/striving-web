import {IFeature} from "@/types/project/IFeature";
import DocsSectionDisplay from "@/components/project/docs/section/DocsSectionDisplay";
import ManualSectionDisplay from "@/components/project/manual/section/ManualSectionDisplay";

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
      <p>{feature.description}</p>
      <p>State: {feature.state}</p>
      {showDocs && <DocsSectionDisplay section={feature.docsSection!}/>}
      {showManual && <ManualSectionDisplay section={feature.manualSection!}/>}
    </div>
  )
}