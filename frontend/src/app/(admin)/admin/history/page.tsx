import Link from "next/link";

export default function HistoryListPage() {
  // Mock data
  const historyItems = [
    { id: 1, year: 2024, title: "初の全国ツアー開催", description: "東京、大阪、名古屋、福岡、札幌の5都市を巡るリサイタルツアー。" },
    { id: 2, year: 2023, title: "アルバム「Debut」リリース", description: "メジャーデビューアルバムをリリース。オリコンクラシックチャート1位獲得。" },
    { id: 3, year: 2022, title: "パリ留学", description: "パリ国立高等音楽院に入学。" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">活動履歴 (History)</h1>
        <Link
          href="/admin/history/new"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          新規追加
        </Link>
      </div>

      <div className="bg-white shadow-sm overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Year
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title & Description
              </th>
              <th scope="col" className="relative px-6 py-3 w-24">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {historyItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 align-top">
                  {item.year}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <p className="font-medium text-gray-900 mb-1">{item.title}</p>
                  <p className="text-gray-500 text-xs">{item.description}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-top">
                  <Link href={`/admin/history/edit/${item.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    編集
                  </Link>
                  <button className="text-red-600 hover:text-red-900">
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
