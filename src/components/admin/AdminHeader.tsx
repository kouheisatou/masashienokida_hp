
export default function AdminHeader() {
  return (
    <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-20">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-800">管理画面</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-sm text-gray-600 hover:text-indigo-600 font-medium">
          ログアウト
        </button>
      </div>
    </header>
  );
}
