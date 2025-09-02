// // components/FeatureHierarchy.tsx
// import React, { useState, useEffect } from 'react';
// import {IFeature} from "@/types/project/Feature";
// import {HeadedButton, HeadedInput, VariantEnum} from "headed-ui";
//
// interface FeatureHierarchyProps {
//   projectId: string;
//   featureId: string;
//   parent?: string;
//   children: string[];
//   onUpdate: (endpoint: string, data: any) => void;
// }
//
// export default function FeatureHierarchy({
//   projectId,
//   featureId,
//   parent,
//   children,
//   onUpdate
// }: FeatureHierarchyProps) {
//   const [parentFeature, setParentFeature] = useState<IFeature | null>(null);
//   const [childFeatures, setChildFeatures] = useState<IFeature[]>([]);
//
//   useEffect(() => {
//     if (parent) fetchParentFeature();
//   }, [parent]);
//
//   useEffect(() => {
//     if (children.length) fetchChildFeatures();
//   }, [children]);
//
//   const fetchParentFeature = async () => {
//     try {
//       const response = await fetch(`/api/project/${projectId}/features/${parent}`);
//       if (response.ok) {
//         const data = await response.json();
//         setParentFeature(data);
//       }
//     } catch (err) {
//       console.error('Failed to fetch parent features:', err);
//     }
//   };
//
//   const fetchChildFeatures = async () => {
//     try {
//       const response = await fetch(`/api/project/${projectId}/features/batch?ids=${children.join(',')}`);
//       if (response.ok) {
//         const data = await response.json();
//         setChildFeatures(data);
//       }
//     } catch (err) {
//       console.error('Failed to fetch child features:', err);
//     }
//   };
//
//   return (
//     <div>
//       <h3>Feature Hierarchy</h3>
//
//       {parentFeature && (
//         <div>
//           <h4>Parent Feature</h4>
//           <span>{parentFeature.title}</span>
//           <HeadedButton variant={VariantEnum.Outline} onClick={() => onUpdate('parent/remove', {})}>
//             Remove Parent
//           </HeadedButton>
//         </div>
//       )}
//
//       <div>
//         <h4>Child Features</h4>
//         {childFeatures.map(child => (
//           <div key={child._id}>
//             <span>{child.title}</span>
//             <HeadedButton variant={VariantEnum.Outline} onClick={() => onUpdate('children/remove', { childId: child._id })}>
//               Remove
//             </HeadedButton>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }