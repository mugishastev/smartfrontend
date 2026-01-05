import type { User } from '@/lib/types';
import { Users, Edit, Trash2, Mail, Phone, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Props = {
  members: User[];
  onView?: (member: User) => void;
  onEdit?: (member: User) => void;
  onDelete?: (member: User) => void;
  onInvite?: (member: User) => void;
};

export const MemberTable: React.FC<Props> = ({ members, onView, onEdit, onDelete, onInvite }) => {
  if (!members.length) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-white">
        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-white" />
        <p>No members found</p>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      COOP_ADMIN: 'bg-purple-100 text-purple-800',
      SECRETARY: 'bg-blue-100 text-blue-800',
      ACCOUNTANT: 'bg-green-100 text-green-800',
      MEMBER: 'bg-gray-100 text-gray-800 dark:text-white',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 dark:text-white';
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold">Member</TableHead>
            <TableHead className="font-semibold">Contact</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Joined</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center gap-3">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={`${member.firstName} ${member.lastName}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-white">{member.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white">
                    <Mail className="h-3 w-3" />
                    <span className="truncate max-w-xs">{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white">
                      <Phone className="h-3 w-3" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                    member.role
                  )}`}
                >
                  {member.role.replace('_', ' ')}
                </span>
              </TableCell>
              <TableCell>
                {member.isActive ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                    Pending
                  </span>
                )}
              </TableCell>
              <TableCell className="text-gray-600 dark:text-white">
                {new Date(member.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {!member.isActive && onInvite && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onInvite(member)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      title="Invite Member"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  )}
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(member)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      title="View Member"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(member)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title="Edit Member"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(member)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete Member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};