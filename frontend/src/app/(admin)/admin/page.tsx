import { PenTool, Music } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Summary Cards */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">総会員数</h3>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">1,234</span>
            <span className="ml-2 text-sm text-green-600 font-semibold">+12%</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">有効会員数</h3>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">856</span>
            <span className="ml-2 text-sm text-green-600 font-semibold">+5%</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">総ページビュー</h3>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">45.2k</span>
            <span className="ml-2 text-sm text-gray-500">過去30日</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">最近のアクティビティ</h3>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              {[1, 2, 3].map((i) => (
                <li key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="h-2 w-2 bg-indigo-500 rounded-full mr-3"></span>
                    <span className="text-sm text-gray-600">新規会員登録がありました</span>
                  </div>
                  <span className="text-xs text-gray-400">2時間前</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">クイックアクション</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <a href="/admin/blog/new" className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <PenTool className="h-8 w-8 mb-2 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">ブログを書く</span>
            </a>
            <a href="/admin/concerts/new" className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Music className="h-8 w-8 mb-2 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">コンサート追加</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
