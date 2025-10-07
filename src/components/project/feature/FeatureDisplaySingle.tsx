import {IFeature} from "@/types/project/Feature";
import DocsSectionDisplay from "@/components/project/docs/section/DocsSectionDisplay";
import ManualSectionDisplay from "@/components/project/manual/section/ManualSectionDisplay";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {HeadedTabs} from "headed-ui";
import {useEffect} from "react";

export default function FeatureDisplaySingle({
                                                 feature,
                                                 showDocs = true,
                                                 showManual = true
                                             }: {
    feature: IFeature;
    showDocs?: boolean;
    showManual?: boolean;
}) {
    useEffect(() => {
        // This effect will run whenever `feature` changes
        console.log("Feature updated:", feature);
    }, [feature]); // Log or trigger side effects on feature change

    const tabs: string[] = [
        'Overview',
        ...(showDocs ? ['Docs'] : []),
        ...(showManual ? ['Manual'] : []),
    ];

    return (
        <div className={'indented-block'}>
            <h3>{feature.title} {feature.children.length > 0 && '(Parent)'}</h3>
            <p>State: {feature.state}</p>
            <HeadedTabs tabs={tabs}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{feature.description}</ReactMarkdown>
                {showDocs && <DocsSectionDisplay section={feature.docsSection!}/>}
                {showManual && <ManualSectionDisplay section={feature.manualSection!}/>}
            </HeadedTabs>
        </div>
    );
}