'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Mail, MailOpen, Clock, ArrowRight, X, Send } from 'lucide-react';
import { api } from '@/lib/api';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  category?: string;
  subject: string;
  message: string;
  created_at: string;
  status: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  unread: { label: '未読', color: 'bg-burgundy-accent text-white' },
  read: { label: '既読', color: 'bg-burgundy text-taupe' },
  replied: { label: '返信済み', color: 'bg-green-900/20 text-green-400' },
  archived: { label: 'アーカイブ', color: 'bg-burgundy-light text-taupe' },
};

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    api.GET('/admin/contacts', {
      params: { query: { status: (filterStatus !== 'all' ? filterStatus : undefined) as 'unread' | 'read' | 'replied' | 'archived' | undefined, search: search || undefined } },
    })
      .then(({ data }) => { if (data) setContacts(data.contacts as Contact[]); })
      .catch(() => {});
  }, [filterStatus, search]);

  const filteredContacts = contacts;

  const handleSelectContact = async (contact: Contact) => {
    setSelectedContact(contact);
    if (contact.status === 'unread') {
      await api.PUT('/admin/contacts/{id}', { params: { path: { id: contact.id } }, body: { status: 'read' } }).catch(() => {});
      setContacts((prev) =>
        prev.map((c) => (c.id === contact.id ? { ...c, status: 'read' } : c))
      );
    }
  };

  const handleReply = () => {
    if (selectedContact) {
      window.location.href = `mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`;
    }
  };

  const handleArchive = async () => {
    if (!selectedContact) return;
    await api.PUT('/admin/contacts/{id}', { params: { path: { id: selectedContact.id } }, body: { status: 'archived' } }).catch(() => {});
    setContacts((prev) => prev.filter((c) => c.id !== selectedContact.id));
    setSelectedContact(null);
  };

  const unreadCount = contacts.filter((c) => c.status === 'unread').length;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl mb-2">お問い合わせ</h1>
        <p className="text-taupe">
          {unreadCount > 0 ? `${unreadCount} 件の未読があります` : 'すべて確認済みです'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* List */}
        <div className="lg:w-1/2">
          {/* Filters */}
          <div className="card p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe" />
                <input
                  type="text"
                  placeholder="検索..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-burgundy border border-burgundy-border rounded pl-10 pr-4 py-2 text-beige focus:outline-none focus:border-burgundy-accent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-taupe" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-burgundy border border-burgundy-border rounded px-4 py-2 text-beige focus:outline-none focus:border-burgundy-accent"
                >
                  <option value="all">すべて</option>
                  <option value="unread">未読</option>
                  <option value="read">既読</option>
                  <option value="replied">返信済み</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact List */}
          <div className="card overflow-hidden">
            <div className="divide-y divide-burgundy-border">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  className={`w-full text-left p-4 hover:bg-burgundy/50 transition-colors ${
                    selectedContact?.id === contact.id ? 'bg-burgundy' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {contact.status === 'unread' ? (
                        <Mail size={18} className="text-burgundy-accent" />
                      ) : (
                        <MailOpen size={18} className="text-taupe" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-beige font-medium truncate">{contact.name}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            statusLabels[contact.status].color
                          }`}
                        >
                          {statusLabels[contact.status].label}
                        </span>
                      </div>
                      <p className="text-beige text-sm truncate">{contact.subject}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-taupe text-xs">{contact.category}</span>
                        <span className="text-taupe text-xs flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(contact.created_at).toLocaleDateString('ja-JP', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-taupe flex-shrink-0" />
                  </div>
                </button>
              ))}

              {filteredContacts.length === 0 && (
                <div className="p-8 text-center">
                  <Mail size={32} className="mx-auto mb-4 text-burgundy-border" />
                  <p className="text-taupe">お問い合わせがありません</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detail */}
        <div className="lg:w-1/2">
          {selectedContact ? (
            <div className="card p-6 sticky top-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl mb-1">{selectedContact.subject}</h2>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      statusLabels[selectedContact.status].color
                    }`}
                  >
                    {statusLabels[selectedContact.status].label}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-taupe hover:text-beige lg:hidden"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex gap-4">
                  <span className="text-taupe text-sm w-24">送信者</span>
                  <span className="text-beige">{selectedContact.name}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-taupe text-sm w-24">メール</span>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="text-burgundy-accent hover:text-white"
                  >
                    {selectedContact.email}
                  </a>
                </div>
                {selectedContact.phone && (
                  <div className="flex gap-4">
                    <span className="text-taupe text-sm w-24">電話番号</span>
                    <a
                      href={`tel:${selectedContact.phone}`}
                      className="text-burgundy-accent hover:text-white"
                    >
                      {selectedContact.phone}
                    </a>
                  </div>
                )}
                <div className="flex gap-4">
                  <span className="text-taupe text-sm w-24">カテゴリ</span>
                  <span className="text-beige">{selectedContact.category}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-taupe text-sm w-24">受信日時</span>
                  <span className="text-beige">
                    {new Date(selectedContact.created_at).toLocaleString('ja-JP')}
                  </span>
                </div>
              </div>

              <div className="border-t border-burgundy-border pt-6 mb-6">
                <h3 className="text-sm text-taupe mb-3">本文</h3>
                <p className="text-beige leading-relaxed whitespace-pre-wrap">
                  {selectedContact.message}
                </p>
              </div>

              <div className="flex gap-4">
                <button onClick={handleReply} className="btn btn-primary flex items-center gap-2">
                  <Send size={16} />
                  返信する
                </button>
                <button onClick={handleArchive} className="btn btn-outline">アーカイブ</button>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center">
              <Mail size={48} className="mx-auto mb-4 text-burgundy-border" />
              <p className="text-taupe">お問い合わせを選択してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
