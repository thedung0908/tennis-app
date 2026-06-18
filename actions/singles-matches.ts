'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { isValidScore } from '@/lib/calculations';

type SinglesPayload = {
  date: string;
  player1_id: string;
  player2_id: string;
  score1: number;
  score2: number;
};

function validatePayload(p: SinglesPayload): string | null {
  if (!p.date) return 'Vui lòng chọn ngày thi đấu';
  if (!p.player1_id || !p.player2_id) return 'Vui lòng chọn đủ 2 người chơi';
  if (p.player1_id === p.player2_id) return 'Hai người chơi phải khác nhau';
  if (!isValidScore(p.score1, p.score2))
    return 'Tỷ số không hợp lệ. Chỉ chấp nhận: 6-0 đến 6-4 (hoặc ngược lại), hoặc 5-5';
  return null;
}

function revalidateAll() {
  revalidatePath('/matches');
  revalidatePath('/ranking');
  revalidatePath('/finance');
}

export async function createSinglesMatch(_: unknown, formData: FormData) {
  await requireAdmin();
  const payload: SinglesPayload = {
    date: formData.get('date') as string,
    player1_id: formData.get('player1_id') as string,
    player2_id: formData.get('player2_id') as string,
    score1: parseInt(formData.get('score1') as string),
    score2: parseInt(formData.get('score2') as string),
  };
  const err = validatePayload(payload);
  if (err) return { error: err };
  const { error } = await supabase.from('singles_matches').insert(payload);
  if (error) return { error: 'Lỗi khi lưu trận đấu: ' + error.message };
  revalidateAll();
  return { success: true };
}

export async function updateSinglesMatch(_: unknown, formData: FormData) {
  await requireAdmin();
  const id = formData.get('id') as string;
  const payload: SinglesPayload = {
    date: formData.get('date') as string,
    player1_id: formData.get('player1_id') as string,
    player2_id: formData.get('player2_id') as string,
    score1: parseInt(formData.get('score1') as string),
    score2: parseInt(formData.get('score2') as string),
  };
  const err = validatePayload(payload);
  if (err) return { error: err };
  const { error } = await supabase.from('singles_matches').update(payload).eq('id', id);
  if (error) return { error: 'Lỗi khi cập nhật trận đấu: ' + error.message };
  revalidateAll();
  return { success: true };
}

export async function deleteSinglesMatch(id: string) {
  await requireAdmin();
  const { error } = await supabase.from('singles_matches').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidateAll();
}
