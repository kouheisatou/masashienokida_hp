'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Mail, CreditCard, TrendingUp, ArrowRight, Clock } from 'lucide-react';

// Placeholder data - in production, fetch from API
const mockStats = {
  totalMembers: 156,
  goldMembers: 42,
  freeMembers: 114,
  newMembersThisMonth: 8,
  totalContacts: 23,
  unreadContacts: 5,
  monthlyRevenue: 126000,
  revenueChange: 12.5,
};

const mockRecentContacts = [
  { id: '1', name: '山田太郎', subject: 'コンサート依頼について', date: '2024-12-15', status: 'unread' },
  { id: '2', name: '佐藤花子', subject: 'サポーターズクラブについて', date: '2024-12-14', status: 'read' },
  { id: '3', name: '田中一郎', subject: '取材のお願い', date: '2024-12-13', status: 'read' },
];

const mockRecentMembers = [
  { id: '1', name: '鈴木美咲', email: 'suzuki@example.com', tier: 'MEMBER_GOLD', date: '2024-12-15' },
  { id: '2', name: '高橋健太', email: 'takahashi@example.com', tier: 'MEMBER_FREE', date: '2024-12-14' },
  { id: '3', name: '伊藤真由', email: 'ito@example.com', tier: 'MEMBER_GOLD', date: '2024-12-12' },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(mockStats);
  const [recentContacts, setRecentContacts] = useState(mockRecentContacts);
  const [recentMembers, setRecentMembers] = useState(mockRecentMembers);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl mb-2">ダッシュボード</h1>
        <p className="text-taupe">サイトの概要と最新の活動</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Members */}
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-taupe text-sm mb-1">総会員数</p>
              <p className="text-3xl text-white">{stats.totalMembers}</p>
              <p className="text-burgundy-accent text-sm mt-1">
                +{stats.newMembersThisMonth} 今月
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-burgundy flex items-center justify-center">
              <Users size={20} className="text-burgundy-accent" />
            </div>
          </div>
        </div>

        {/* Gold Members */}
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-taupe text-sm mb-1">ゴールド会員</p>
              <p className="text-3xl text-white">{stats.goldMembers}</p>
              <p className="text-taupe text-sm mt-1">
                {Math.round((stats.goldMembers / stats.totalMembers) * 100)}% of total
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-burgundy flex items-center justify-center">
              <CreditCard size={20} className="text-burgundy-accent" />
            </div>
          </div>
        </div>

        {/* Unread Contacts */}
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-taupe text-sm mb-1">未読お問い合わせ</p>
              <p className="text-3xl text-white">{stats.unreadContacts}</p>
              <p className="text-taupe text-sm mt-1">
                {stats.totalContacts} 件中
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-burgundy flex items-center justify-center">
              <Mail size={20} className="text-burgundy-accent" />
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-taupe text-sm mb-1">月間売上</p>
              <p className="text-3xl text-white">
                ¥{stats.monthlyRevenue.toLocaleString()}
              </p>
              <p className="text-burgundy-accent text-sm mt-1 flex items-center gap-1">
                <TrendingUp size={14} />
                +{stats.revenueChange}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-burgundy flex items-center justify-center">
              <TrendingUp size={20} className="text-burgundy-accent" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Contacts */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg">最新のお問い合わせ</h2>
            <Link
              href="/admin/contacts"
              className="text-burgundy-accent hover:text-white transition-colors text-sm flex items-center gap-1"
            >
              すべて見る
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {recentContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-start gap-4 pb-4 border-b border-burgundy-border last:border-0 last:pb-0"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    contact.status === 'unread' ? 'bg-burgundy-accent' : 'bg-burgundy-border'
                  }`}
                />
                <div className="flex-grow min-w-0">
                  <p className="text-beige truncate">{contact.subject}</p>
                  <p className="text-taupe text-sm">{contact.name}</p>
                </div>
                <div className="flex items-center gap-1 text-taupe text-xs flex-shrink-0">
                  <Clock size={12} />
                  {new Date(contact.date).toLocaleDateString('ja-JP', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Members */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg">新規会員</h2>
            <Link
              href="/admin/members"
              className="text-burgundy-accent hover:text-white transition-colors text-sm flex items-center gap-1"
            >
              すべて見る
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {recentMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 pb-4 border-b border-burgundy-border last:border-0 last:pb-0"
              >
                <div className="w-10 h-10 rounded-full bg-burgundy flex items-center justify-center flex-shrink-0">
                  <Users size={16} className="text-taupe" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-beige truncate">{member.name}</p>
                  <p className="text-taupe text-sm truncate">{member.email}</p>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      member.tier === 'MEMBER_GOLD'
                        ? 'bg-burgundy-accent/20 text-burgundy-accent'
                        : 'bg-burgundy-light text-taupe'
                    }`}
                  >
                    {member.tier === 'MEMBER_GOLD' ? 'ゴールド' : 'メール'}
                  </span>
                  <span className="text-taupe text-xs mt-1">
                    {new Date(member.date).toLocaleDateString('ja-JP', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg mb-4">クイックアクション</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/members" className="btn btn-outline">
            会員を検索
          </Link>
          <Link href="/admin/contacts" className="btn btn-outline">
            お問い合わせを確認
          </Link>
          <a
            href="https://microcms.io/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            MicroCMS を開く
          </a>
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            Stripe を開く
          </a>
        </div>
      </div>
    </div>
  );
}
