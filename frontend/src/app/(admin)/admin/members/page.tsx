'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, Crown, User, Mail, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAdminMembers } from '@/lib/api-client';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  subscription_status?: string;
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getAdminMembers({
      role: filterRole !== 'all' ? filterRole : undefined,
      search: search || undefined,
      page: currentPage,
    })
      .then((data) => {
        setMembers(data.members as Member[]);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .catch(() => {});
  }, [filterRole, search, currentPage]);

  const handleExport = () => {
    alert('CSVエクスポート機能は実装中です');
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl mb-2">会員管理</h1>
        <p className="text-taupe">登録会員の一覧と管理</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-grow relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe" />
            <input
              type="text"
              placeholder="名前またはメールで検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-burgundy border border-burgundy-border rounded pl-10 pr-4 py-2 text-beige focus:outline-none focus:border-burgundy-accent"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-taupe" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-burgundy border border-burgundy-border rounded px-4 py-2 text-beige focus:outline-none focus:border-burgundy-accent"
            >
              <option value="all">すべて</option>
              <option value="MEMBER_GOLD">ゴールド会員</option>
              <option value="MEMBER_FREE">メール会員</option>
            </select>
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            className="btn btn-outline flex items-center gap-2"
          >
            <Download size={16} />
            エクスポート
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-burgundy flex items-center justify-center">
            <User size={18} className="text-burgundy-accent" />
          </div>
          <div>
            <p className="text-taupe text-sm">総会員数</p>
            <p className="text-xl text-white">{total}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-burgundy flex items-center justify-center">
            <Crown size={18} className="text-burgundy-accent" />
          </div>
          <div>
            <p className="text-taupe text-sm">ゴールド会員</p>
            <p className="text-xl text-white">
              {members.filter((m) => m.role === 'MEMBER_GOLD').length}
            </p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-burgundy flex items-center justify-center">
            <Mail size={18} className="text-burgundy-accent" />
          </div>
          <div>
            <p className="text-taupe text-sm">メール会員</p>
            <p className="text-xl text-white">
              {members.filter((m) => m.role === 'MEMBER_FREE').length}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-burgundy border-b border-burgundy-border">
                <th className="text-left text-taupe text-sm font-normal px-6 py-4">会員</th>
                <th className="text-left text-taupe text-sm font-normal px-6 py-4">メールアドレス</th>
                <th className="text-left text-taupe text-sm font-normal px-6 py-4">会員種別</th>
                <th className="text-left text-taupe text-sm font-normal px-6 py-4">登録日</th>
                <th className="text-left text-taupe text-sm font-normal px-6 py-4">ステータス</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-burgundy-border hover:bg-burgundy/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-burgundy flex items-center justify-center">
                        <User size={14} className="text-taupe" />
                      </div>
                      <span className="text-beige">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-taupe">{member.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        member.role === 'MEMBER_GOLD'
                          ? 'bg-burgundy-accent/20 text-burgundy-accent'
                          : 'bg-burgundy text-taupe'
                      }`}
                    >
                      {member.role === 'MEMBER_GOLD' ? 'ゴールド' : 'メール'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-taupe">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {new Date(member.created_at).toLocaleDateString('ja-JP')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        member.subscription_status !== 'CANCELED'
                          ? 'bg-green-900/20 text-green-400'
                          : 'bg-red-900/20 text-red-400'
                      }`}
                    >
                      {member.subscription_status !== 'CANCELED' ? '有効' : '解約'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-burgundy-border">
            <p className="text-taupe text-sm">
              {total} 件中 {(currentPage - 1) * 20 + 1} -{' '}
              {Math.min(currentPage * 20, total)} 件を表示
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded bg-burgundy text-taupe hover:text-beige disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-taupe text-sm px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded bg-burgundy text-taupe hover:text-beige disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
