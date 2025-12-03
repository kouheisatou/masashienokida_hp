import Link from 'next/link';
import { LayoutDashboard, FileText, Music, Users, Lock, Contact, History, Disc } from 'lucide-react';

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white fixed inset-y-0 left-0 z-30 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <span className="text-lg font-bold tracking-wider">管理者コンソール</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link href="/admin" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors">
          <LayoutDashboard className="mr-3 h-5 w-5" />
          ダッシュボード
        </Link>
        <div className="pt-4 pb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">コンテンツ管理</span>
        </div>
        <Link href="/admin/biography" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors">
          <Contact className="mr-3 h-5 w-5" />
          プロフィール
        </Link>
        <Link href="/admin/history" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors">
          <History className="mr-3 h-5 w-5" />
          活動履歴
        </Link>
        <Link href="/admin/discography" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors">
          <Disc className="mr-3 h-5 w-5" />
          ディスコグラフィ
        </Link>
        <Link href="/admin/blog" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors">
          <FileText className="mr-3 h-5 w-5" />
          ブログ記事
        </Link>
        <Link href="/admin/concerts" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors">
          <Music className="mr-3 h-5 w-5" />
          コンサート情報
        </Link>
        <div className="pt-4 pb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">会員管理</span>
        </div>
        <Link href="/admin/members" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors">
          <Users className="mr-3 h-5 w-5" />
          会員一覧
        </Link>
        <Link href="/admin/members-content" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors">
          <Lock className="mr-3 h-5 w-5" />
          限定コンテンツ
        </Link>
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center">
           <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold">A</div>
           <div className="ml-3">
             <p className="text-sm font-medium text-white">管理者</p>
             <p className="text-xs text-gray-400">プロフィール設定</p>
           </div>
        </div>
      </div>
    </aside>
  );
}
