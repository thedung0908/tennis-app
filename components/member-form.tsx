'use client';

import { useActionState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { createMember } from '@/actions/members';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function MemberForm() {
  const [state, action, pending] = useActionState(createMember, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success('Đã thêm thành viên');
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex gap-2">
      <Input
        name="name"
        placeholder="Tên thành viên mới"
        className="flex-1"
        maxLength={30}
      />
      <Button type="submit" disabled={pending} size="sm">
        {pending ? '...' : '+ Thêm'}
      </Button>
      {state?.error && (
        <p className="text-sm text-destructive w-full mt-1">{state.error}</p>
      )}
    </form>
  );
}
