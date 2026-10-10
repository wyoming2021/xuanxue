'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

export function DeleteArticleButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('确定删除这篇文章？此操作不可恢复。')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/articles?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        window.alert(data.error || '删除失败');
      }
    } catch (err) {
      console.error('[DeleteArticleButton] 删除失败:', err);
      window.alert('网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={loading}
      onClick={handleDelete}
      className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
    >
      {loading ? '删除中...' : '删除'}
    </Button>
  );
}
