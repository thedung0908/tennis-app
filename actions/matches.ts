'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { isValidScore } from '@/lib/calculations';
import { TAGS } from '@/lib/queries';

type MatchPayload = {
  date: string;
  team1_p1_id: string;
  team1_p2_id: string;
  team2_p1_id: string;
  team2_p2_id: string;
  score1: number;
  score2: number;
};

function validatePayload(p: MatchPayload): string | null {
  if (!p.date) return 'Vui lòng chọn ngày thi đấu';
  const ids = [p.team1_p1_id, p.team1_p2_id, p.team2_p1_id, p.team2_p2_id];
  if (ids.some((id) => !id)) return 'Vui lòng chọn đủ 4 người chơi';
  if (new Set(ids).size !== 4) return 'Mỗi người chỉ được tham gia 1 lần trong trận';
  if (!isValidScore(p.score1, p.score2))
    return 'Tỷ số không hợp lệ. Chỉ chấp nhận: 6-0 đến 6-4 (hoặc ngược lại), hoặc 5-5';
  return null;
}

export async function createMatch(_: unknown, formData: FormData) {
  await requireAdmin();

  const payload: MatchPayload = {
    date: formData.get('date') as string,
    team1_p1_id: formData.get('team1_p1_id') as string,
    team1_p2_id: formData.get('team1_p2_id') as string,
    team2_p1_id: formData.get('team2_p1_id') as string,
    team2_p2_id: formData.get('team2_p2_id') as string,
    score1: parseInt(formData.get('score1') as string),
    score2: parseInt(formData.get('score2') as string),
  };

  const err = validatePayload(payload);
  if (err) return { error: err };

  const { error } = await supabase.from('matches').insert(payload);
  if (error) return { error: 'Lỗi khi lưu trận đấu: ' + error.message };

  revalidateTag(TAGS.matches);
  revalidatePath('/matches');
  revalidatePath('/ranking');
  revalidatePath('/finance');
  return { success: true };
}

export async function updateMatch(_: unknown, formData: FormData) {
  await requireAdmin();

  const id = formData.get('id') as string;
  const payload: MatchPayload = {
    date: formData.get('date') as string,
    team1_p1_id: formData.get('team1_p1_id') as string,
    team1_p2_id: formData.get('team1_p2_id') as string,
    team2_p1_id: formData.get('team2_p1_id') as string,
    team2_p2_id: formData.get('team2_p2_id') as string,
    score1: parseInt(formData.get('score1') as string),
    score2: parseInt(formData.get('score2') as string),
  };

  const err = validatePayload(payload);
  if (err) return { error: err };

  const { error } = await supabase.from('matches').update(payload).eq('id', id);
  if (error) return { error: 'Lỗi khi cập nhật trận đấu: ' + error.message };

  revalidateTag(TAGS.matches);
  revalidatePath('/matches');
  revalidatePath('/ranking');
  revalidatePath('/finance');
  return { success: true };
}

export async function deleteMatch(id: string) {
  await requireAdmin();
  const { error } = await supabase.from('matches').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidateTag(TAGS.matches);
  revalidatePath('/matches');
  revalidatePath('/ranking');
  revalidatePath('/finance');
}
