'use client';

import { useState, useTransition } from 'react';
import { Trash2, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Member } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { deleteMember, updateMemberName } from '@/actions/members';

interface MemberListProps {
  members: Member[];
  memberMatchCount: Record<string, number>;
  isAdmin: boolean;
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-green-100 text-green-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
  'bg-indigo-100 text-indigo-700',
];

export function MemberList({ members, memberMatchCount, isAdmin }: MemberListProps) {
  const [deletePending, startDeleteTransition] = useTransition();
  const [editPending, startEditTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  function startEdit(member: Member) {
    setEditingId(member.id);
    setEditName(member.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
  }

  function handleSave(id: string) {
    startEditTransition(async () => {
      const result = await updateMemberName(id, editName);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Đã cập nhật tên');
        cancelEdit();
      }
    });
  }

  function handleDelete(id: string, name: string) {
    startDeleteTransition(async () => {
      try {
        await deleteMember(id);
        toast.success(`Đã xóa ${name}`);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Xóa thất bại');
      }
    });
  }

  return (
    <TooltipProvider>
      <div className="border rounded-lg divide-y overflow-hidden">
        {members.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">Chưa có thành viên nào</p>
        )}
        {members.map((member, i) => {
          const matchCount = memberMatchCount[member.id] ?? 0;
          const hasMatches = matchCount > 0;
          const isEditing = editingId === member.id;
          const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
          const initial = member.name.trim().charAt(0).toUpperCase();

          return (
            <div key={member.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-xs text-muted-foreground w-4 shrink-0 text-right select-none">{i + 1}</span>
              <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor}`}>
                {initial}
              </div>
              {isEditing ? (
                <>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 h-8 text-sm"
                    maxLength={30}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave(member.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 text-green-600 shrink-0"
                    disabled={editPending}
                    onClick={() => handleSave(member.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                    onClick={cancelEdit}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight">{member.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{matchCount} trận</p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => startEdit(member)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {hasMatches ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" disabled>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>Đã có trận đấu, không thể xóa</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                          disabled={deletePending}
                          onClick={() => handleDelete(member.id, member.name)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
