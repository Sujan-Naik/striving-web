'use client'
import {useProject} from "@/context/ProjectContext";
import FeatureEditor from "@/components/project/feature/edit/FeatureEditor";
import FeatureCreate from "@/components/project/feature/FeatureCreate";
import {AccordionItem, HeadedAccordion, HeadedTabs, VariantEnum} from "headed-ui";
import {IFeature} from "@/types/project/Feature";
import {useFeatures} from "@/context/FeatureContext";


export default function Page(){

    const { project, refreshProject } = useProject()!;
  const projectId = project._id
  // const features = project.features

  const features = useFeatures()!;

  const buildHierarchy = (features: IFeature[]): IFeature[] => {
    return features.filter(f => !f.parent);
  };

  const renderFeatureEditor = (feature: IFeature, level = 0) => {
    const children = features.filter(f => f.parent === feature._id);
    if (children) {
      return (
          <div  key={feature._id} style={{marginLeft: `${level * 20}px`, width: '100%'}}>
            <FeatureEditor projectId={projectId} feature={feature} onFeatureUpdate={refreshProject}/>
            <HeadedAccordion>
              {children.map(child =>
                  <AccordionItem title={child.title} variant={VariantEnum.Outline} key={child._id} >
                    {renderFeatureEditor(child, level + 1)}
                  </AccordionItem>
                    )}
          </HeadedAccordion>
          </div>
      );
    }
  };


  const rootFeatures = buildHierarchy(features);

  return (
    <div style={{width: '100%'}}>
      <FeatureCreate projectId={projectId} onFeatureCreated={refreshProject}/>
      <HeadedTabs tabs={rootFeatures.map(value => value.title)} >

      {rootFeatures.map(feature => renderFeatureEditor(feature))}
      </HeadedTabs>
    </div>
  )
}