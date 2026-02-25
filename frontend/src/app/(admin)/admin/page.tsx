'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Mail, CreditCard, TrendingUp, ArrowRight, Clock } from 'lucide-react';
import { getAdminStats } from '@/lib/api-client';

interface StatsData {
  totalMembers: number;
  goldMembers: number;
  freeMembers: number;
  unreadContacts: number;
}

interface ContactItem {
  id: string;
  name: string;
  subject: string;
  created_at: string;
  status: string;
}

interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentContacts, setRecentContacts] = useState<ContactItem[]>([]);
  const [recentMembers, setRecentMembers] = useState<MemberItem[]>([]);

  useEffect(() => {
    getAdminStats()
      .then((data) => {
        setStats(data.stats);
        setRecentContacts(data.recentContacts as ContactItem[]);
        setRecentMembers(data.recentMembers as MemberItem[]);
      })
      .catch(() => {});
  }, []);

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
              <p className="text-3xl text-white">{stats?.totalMembers ?? '—'}</p>
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
              <p className="text-3xl text-white">{stats?.goldMembers ?? '—'}</p>
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
              <p className="text-3xl text-white">{stats?.unreadContacts ?? '—'}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-burgundy flex items-center justify-center">
              <Mail size={20} className="text-burgundy-accent" />
            </div>
          </div>
        </div>

        {/* Free Members */}
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-taupe text-sm mb-1">メール会員</p>
              <p className="text-3xl text-white">{stats?.freeMembers ?? '—'}</p>
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
                  {new Date(contact.created_at).toLocaleDateString('ja-JP', {
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
                      member.role === 'MEMBER_GOLD'
                        ? 'bg-burgundy-accent/20 text-burgundy-accent'
                        : 'bg-burgundy-light text-taupe'
                    }`}
                  >
                    {member.role === 'MEMBER_GOLD' ? 'ゴールド' : 'メール'}
                  </span>
                  <span className="text-taupe text-xs mt-1">
                    {new Date(member.created_at).toLocaleDateString('ja-JP', {
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
