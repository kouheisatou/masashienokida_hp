'use client';

import { useState } from 'react';
import { Search, Filter, Download, Crown, User, Mail, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

// Mock data - in production, fetch from API
const mockMembers = [
  { id: '1', name: '鈴木美咲', email: 'suzuki@example.com', role: 'MEMBER_GOLD', createdAt: '2024-12-15', status: 'active' },
  { id: '2', name: '高橋健太', email: 'takahashi@example.com', role: 'MEMBER_FREE', createdAt: '2024-12-14', status: 'active' },
  { id: '3', name: '伊藤真由', email: 'ito@example.com', role: 'MEMBER_GOLD', createdAt: '2024-12-12', status: 'active' },
  { id: '4', name: '渡辺大輔', email: 'watanabe@example.com', role: 'MEMBER_FREE', createdAt: '2024-12-10', status: 'active' },
  { id: '5', name: '山本さくら', email: 'yamamoto@example.com', role: 'MEMBER_GOLD', createdAt: '2024-12-08', status: 'canceled' },
  { id: '6', name: '中村翔太', email: 'nakamura@example.com', role: 'MEMBER_FREE', createdAt: '2024-12-05', status: 'active' },
  { id: '7', name: '小林優子', email: 'kobayashi@example.com', role: 'MEMBER_GOLD', createdAt: '2024-12-03', status: 'active' },
  { id: '8', name: '加藤拓也', email: 'kato@example.com', role: 'MEMBER_FREE', createdAt: '2024-12-01', status: 'active' },
];

export default function AdminMembersPage() {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter members
  const filteredMembers = mockMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    // In production, implement CSV export
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
            <p className="text-xl text-white">{mockMembers.length}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-burgundy flex items-center justify-center">
            <Crown size={18} className="text-burgundy-accent" />
          </div>
          <div>
            <p className="text-taupe text-sm">ゴールド会員</p>
            <p className="text-xl text-white">
              {mockMembers.filter((m) => m.role === 'MEMBER_GOLD').length}
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
              {mockMembers.filter((m) => m.role === 'MEMBER_FREE').length}
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
              {paginatedMembers.map((member) => (
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
                      {new Date(member.createdAt).toLocaleDateString('ja-JP')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        member.status === 'active'
                          ? 'bg-green-900/20 text-green-400'
                          : 'bg-red-900/20 text-red-400'
                      }`}
                    >
                      {member.status === 'active' ? '有効' : '解約'}
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
              {filteredMembers.length} 件中 {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredMembers.length)} 件を表示
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
