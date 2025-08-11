import {Feature} from "@/types/project/Feature";
import DocumentationSectionDisplay from "@/components/project/docs/section/DocumentationSectionDisplay";
import WikiSectionDisplay from "@/components/project/wiki/section/WikiSectionDisplay";

export default function FeatureDisplaySingle({
  feature,
  showDocumentation = true,
  showWiki = true
}: {
  feature: Feature;
  showDocumentation?: boolean;
  showWiki?: boolean;
}){

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
      <h3>{feature.title} {feature.children.length > 0 && '(Parent)'}</h3>
      <p>{feature.description}</p>
      <p>State: {feature.state}</p>
      {showDocumentation && <DocumentationSectionDisplay section={feature.documentationSection!}/>}
      {showWiki && <WikiSectionDisplay section={feature.wikiSection!}/>}
    </div>
  )
}