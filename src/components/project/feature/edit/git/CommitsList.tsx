// import React, { useState, useEffect } from 'react';
// import {HeadedButton, VariantEnum} from "headed-ui";
//
// interface CommitsListProps {
//   projectId: string;
//   githubRepo: string;
//   featureId: string;
//   commitShas: string[];
//   onUpdate: (endpoint: string, data: any) => void;
// }
//
// export default function CommitsList({
//   projectId,
//   featureId,
//   githubRepo,
//   commitShas,
//   onUpdate
// }: CommitsListProps) {
//   const [availableCommits, setAvailableCommits] = useState<GitCommit[]>([]);
//   const [selectedCommits, setSelectedCommits] = useState<GitCommit[]>([]);
//
//   useEffect(() => {
//     fetchAvailableCommits();
//   }, [projectId]);
//
//   useEffect(() => {
//     if (commitShas.length && availableCommits.length) {
//       setSelectedCommits(availableCommits.filter(commit => commitShas.includes(commit.sha)));
//     }
//   }, [commitShas, availableCommits]);
//
//   const fetchAvailableCommits = async () => {
//     try {
//       const response = await fetch(`/api/github/${githubRepo}/commits`);
//       // console.log(await response.json())
//       if (response.ok) {
//         const data = await response.json();
//         setAvailableCommits(data);
//       }
//     } catch (err) {
//       console.error('Failed to fetch commits:', err);
//     }
//   };
//
//   const handleAddCommit = (sha: string) => {
//     const endpoint = `commits`;
//     onUpdate(endpoint, { commitSha: sha, action: 'add' });
//   };
//
//   const handleRemoveCommit = (sha: string) => {
//     const endpoint = `commits`;
//     onUpdate(endpoint, { commitSha: sha, action: 'remove' });
//   };
//
//   return (
//     <div style={{width: '100%'}}>
//       <h4>Selected Commits</h4>
//       {selectedCommits.map(commit => (
//         <div key={commit.sha}>
//           <code>{commit.sha.substring(0, 7)}</code>
//           <span>{commit.message}</span>
//           <HeadedButton variant={VariantEnum.Outline} onClick={() => handleRemoveCommit(commit.sha)}>Remove</HeadedButton>
//         </div>
//       ))}
//
//       <h4>Available Commits</h4>
//       <select onChange={(e) => handleAddCommit(e.target.value)}>
//         <option value="">Select commit to add</option>
//         {availableCommits
//           .filter(commit => !commitShas.includes(commit.sha))
//           .map(commit => (
//             <option key={commit.sha} value={commit.sha}>
//               {commit.sha.substring(0, 7)}: {commit.message}
//             </option>
//           ))}
//       </select>
//     </div>
//   );
// }

