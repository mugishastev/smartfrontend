import React from 'react';
import { Users, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

type Member = {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  createdAt?: string;
};

type Props = { members: Member[] };

export const MemberList: React.FC<Props> = ({ members }) => {
  const navigate = useNavigate();
  if (!members.length) return (
    <div className="text-center py-8 text-gray-500 dark:text-white">
      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
      <p>No members yet</p>
      <Button onClick={() => navigate('/coop-members/add')} className="mt-4 bg-[#b7eb34] text-white">Add Your First Member</Button>
    </div>
  );

  return (
    <div className="space-y-3">
      {members.map(member => (
        <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{member.firstName} {member.lastName}</p>
              <p className="text-sm text-gray-600">{member.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/member/${member.id}`)}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};
