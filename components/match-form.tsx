'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Member, Match } from '@/types';
import { createMatch, updateMatch } from '@/actions/matches';

interface MatchFormProps {
  members: Member[];
  defaultValues?: Partial<Match>;
  onSuccess?: () => void;
}

const SCORES = [0, 1, 2, 3, 4, 5, 6];
const today = new Date().toISOString().split('T')[0];

export function MatchForm({ members, defaultValues, onSuccess }: MatchFormProps) {
  const isEdit = !!defaultValues?.id;
  const action = isEdit ? updateMatch : createMatch;
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
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={defaultValues?.date ?? today}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <PlayerSelect name="team1_p1_id" label="Đội 1 — Người 1" members={members} defaultValue={defaultValues?.team1_p1_id} />
        <PlayerSelect name="team1_p2_id" label="Đội 1 — Người 2" members={members} defaultValue={defaultValues?.team1_p2_id} />
      </div>

      <ScoreRow
        name1="score1" name2="score2"
        defaultScore1={defaultValues?.score1}
        defaultScore2={defaultValues?.score2}
      />

      <div className="grid grid-cols-2 gap-3">
        <PlayerSelect name="team2_p1_id" label="Đội 2 — Người 1" members={members} defaultValue={defaultValues?.team2_p1_id} />
        <PlayerSelect name="team2_p2_id" label="Đội 2 — Người 2" members={members} defaultValue={defaultValues?.team2_p2_id} />
      </div>

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

function ScoreRow({ name1, name2, defaultScore1, defaultScore2 }: {
  name1: string; name2: string; defaultScore1?: number; defaultScore2?: number;
}) {
  return (
    <div className="flex items-end gap-3">
      <div className="flex-1 space-y-1.5">
        <Label className="text-xs">Tỷ số Đội 1</Label>
        <Select name={name1} defaultValue={defaultScore1 !== undefined ? String(defaultScore1) : undefined} required>
          <SelectTrigger className="h-9"><SelectValue placeholder="-" /></SelectTrigger>
          <SelectContent>
            {SCORES.map((s) => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <span className="text-lg font-bold mb-2">—</span>
      <div className="flex-1 space-y-1.5">
        <Label className="text-xs">Tỷ số Đội 2</Label>
        <Select name={name2} defaultValue={defaultScore2 !== undefined ? String(defaultScore2) : undefined} required>
          <SelectTrigger className="h-9"><SelectValue placeholder="-" /></SelectTrigger>
          <SelectContent>
            {SCORES.map((s) => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
