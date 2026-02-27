'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import AuthGuard from '@/components/AuthGuard';
import { api, type components } from '@/lib/api';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type BiographyEntry = components['schemas']['AdminBiographyEntry'];

function SortableRow({
  item,
  onDelete,
}: {
  item: BiographyEntry;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-gray-50">
      <td className="px-3 py-4 w-10">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
          title="ドラッグして並べ替え"
        >
          ☰
        </button>
      </td>
      <td className="px-6 py-4 font-medium text-gray-900">{item.year}</td>
      <td className="px-6 py-4 text-gray-600 max-w-md truncate">{item.description}</td>
      <td className="px-6 py-4 text-right flex gap-3 justify-end">
        <Link href={`/biography/${item.id}`} className="text-blue-600 hover:underline">編集</Link>
        <button onClick={() => onDelete(item.id)} className="text-red-500 hover:underline">削除</button>
      </td>
    </tr>
  );
}

export default function BiographyListPage() {
  const [items, setItems] = useState<BiographyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    api.GET('/admin/biography').then(({ data }) => {
      if (data) setItems(data);
    }).finally(() => setLoading(false));
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    const payload = reordered.map((item, idx) => ({ id: item.id, sort_order: idx }));
    setSaving(true);
    await api.PUT('/biography/reorder', { body: payload as never });
    setSaving(false);
  }, [items]);

  async function handleDelete(id: string) {
    if (!confirm('削除しますか？')) return;
    await api.DELETE('/biography/{id}', { params: { path: { id } } });
    setItems((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <AuthGuard>
      <AdminShell>
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">経歴</h1>
              {saving && <span className="text-xs text-gray-400">保存中...</span>}
            </div>
            <Link href="/biography/new" className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              + 新規作成
            </Link>
          </div>
          {loading ? <p className="text-gray-500 text-sm">読み込み中...</p> : items.length === 0 ? (
            <p className="text-gray-400 text-sm">経歴がありません</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-3 py-3 w-10"></th>
                      <th className="px-6 py-3 text-left">年</th>
                      <th className="px-6 py-3 text-left">説明</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((b) => (
                        <SortableRow key={b.id} item={b} onDelete={handleDelete} />
                      ))}
                    </tbody>
                  </SortableContext>
                </table>
              </DndContext>
            </div>
          )}
        </div>
      </AdminShell>
    </AuthGuard>
  );
}
