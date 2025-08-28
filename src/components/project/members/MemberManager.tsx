'use client';
import { useState, useEffect } from 'react';
import {HeadedButton, VariantEnum} from "headed-ui";

interface Member {
  _id: string;
  username: string;
  email: string;
}

interface Props {
  projectId: string;
}

export function MemberManager({ projectId }: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [newMemberId, setNewMemberId] = useState('');

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const fetchMembers = async () => {
    const res = await fetch(`/api/project/${projectId}/members`);
    const data = await res.json();
        console.log(data)

    setMembers(data);
  };

  // const addMember = async () => {
  //   await fetch(`/api/project/${projectId}/members`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ contributorId: newMemberId })
  //   });
  //   setNewMemberId('');
  //   fetchMembers();
  // };

  const removeMember = async (contributorId: string) => {
    await fetch(`/api/project/${projectId}/members`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contributorId })
    });
    fetchMembers();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Members</h2>

      {/*<div className="mb-4">*/}
      {/*  <HeadedInput width={"100%"} variant={VariantEnum.Outline}*/}
      {/*    type="text"*/}
      {/*    placeholder="Member ID"*/}
      {/*    value={newMemberId}*/}
      {/*    onChange={(e) => setNewMemberId(e.target.value)}*/}
      {/*    className="border p-2 mr-2"*/}
      {/*  />*/}
      {/*  <HeadedButton variant={VariantEnum.Outline} onClick={addMember} className="bg-blue-500 text-white px-4 py-2">*/}
      {/*    Add*/}
      {/*  </HeadedButton>*/}
      {/*</div>*/}

      <div className="space-y-2">
        {members.map(member => (
          <div key={member._id} className="flex justify-between items-center border p-2">
            <span>{member.username} ({member.email})</span>
            <HeadedButton variant={VariantEnum.Outline}
              onClick={() => removeMember(member._id)}
              className="bg-red-500 text-white px-2 py-1 text-sm"
            >
              Remove
            </HeadedButton>
          </div>
        ))}
      </div>
    </div>
  );
}