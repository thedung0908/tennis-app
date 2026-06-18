'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Member, SinglesMatch } from '@/types';
import { createSinglesMatch, updateSinglesMatch } from '@/actions/singles-matches';

interface SinglesMatchFormProps {
  members: Member[];
  defaultValues?: Partial<SinglesMatch>;
  onSuccess?: () => void;
}

const SCORES = [0, 1, 2, 3, 4, 5, 6];
const today = new Date().toISOString().split('T')[0];

export function SinglesMatchForm({ members, defaultValues, onSuccess }: SinglesMatchFormProps) {
  const isEdit = !!defaultValues?.id;
  const action = isEdit ? updateSinglesMatch : createSinglesMatch;
  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(isEdit ? 'Đã cập nhật trận đấu' : 'Đã thêm trận đấu');
      onSuccess?.();
    }
  }, [state, isEdit, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      {isEdit && <input type="hidden" name="id" value={defaultValues.id} />}

      <div className="space-y-1.5">
        <Label htmlFor="date">Ngày thi đấu</Label>
        <Input id="date" name="date" type="date" defaultValue={defaultValues?.date ?? today} required />
      </div>

      <PlayerSelect name="player1_id" label="Người chơi 1" members={members} defaultValue={defaultValues?.player1_id} />

      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs">Điểm người 1</Label>
          <Select name="score1" defaultValue={defaultValues?.score1 !== undefined ? String(defaultValues.score1) : undefined} required>
            <SelectTrigger className="h-9"><SelectValue placeholder="-" /></SelectTrigger>
            <SelectContent>
              {SCORES.map((s) => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <span className="text-lg font-bold mb-2">—</span>
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs">Điểm người 2</Label>
          <Select name="score2" defaultValue={defaultValues?.score2 !== undefined ? String(defaultValues.score2) : undefined} required>
            <SelectTrigger className="h-9"><SelectValue placeholder="-" /></SelectTrigger>
            <SelectContent>
              {SCORES.map((s) => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <PlayerSelect name="player2_id" label="Người chơi 2" members={members} defaultValue={defaultValues?.player2_id} />

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Đang lưu...' : isEdit ? 'Cập nhật trận' : 'Lưu trận'}
      </Button>
    </form>
  );
}

function PlayerSelect({ name, label, members, defaultValue }: {
  name: string; label: string; members: Member[]; defaultValue?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Select name={name} defaultValue={defaultValue} required>
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Chọn..." />
        </SelectTrigger>
        <SelectContent>
          {members.map((m) => (
            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
