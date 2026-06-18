'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function createMember(_: unknown, formData: FormData) {
  await requireAdmin();

  const name = (formData.get('name') as string)?.trim();
  if (!name) return { error: 'Vui lòng nhập tên thành viên' };

  const { error } = await supabase.from('members').insert({ name });
  if (error) {
    if (error.code === '23505') return { error: 'Tên này đã tồn tại' };
    return { error: 'Lỗi khi thêm thành viên: ' + error.message };
  }

  revalidatePath('/members');
  revalidatePath('/matches');
  return { success: true };
}

export async function updateMemberName(id: string, name: string): Promise<{ error?: string }> {
  await requireAdmin();

  const trimmed = name.trim();
  if (!trimmed) return { error: 'Vui lòng nhập tên thành viên' };

  const { error } = await supabase.from('members').update({ name: trimmed }).eq('id', id);
  if (error) {
    if (error.code === '23505') return { error: 'Tên này đã tồn tại' };
    return { error: 'Lỗi khi cập nhật: ' + error.message };
  }

  revalidatePath('/members');
  revalidatePath('/matches');
  revalidatePath('/ranking');
  revalidatePath('/finance');
  return {};
}

export async function deleteMember(id: string) {
  await requireAdmin();

  const { count } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .or(`team1_p1_id.eq.${id},team1_p2_id.eq.${id},team2_p1_id.eq.${id},team2_p2_id.eq.${id}`);

  if (count && count > 0) {
    throw new Error('Đã có trận đấu, không thể xóa');
  }

  const { error } = await supabase.from('members').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/members');
}
