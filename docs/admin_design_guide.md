# 管理者画面デザインガイドライン

## 1. デザインコンセプト
**「機能的で信頼感のあるモダンB2Bワークスペース」**

*   **キーワード**: Professional (プロフェッショナル), Efficient (効率的), Clean (清潔), Reliable (信頼), Usable (使いやすい)
*   **雰囲気**:
    *   情報の視認性と操作性を最優先した、ノイズの少ないフラットなデザイン。
    *   一般的なSaaS管理画面（Stripe Dashboard, Vercel Dashboard等）のような、使い慣れたUIパターン。
    *   **ゴシック体（サンセリフ）**による明快な情報伝達。

## 2. カラーパレット (Color Palette)

視認性の高いニュートラルなグレーをベースに、アクションカラーとしてブルー/インディゴを使用。

*   **Background**:
    *   `#F3F4F6` (Gray 100): アプリケーション全体の背景色。
    *   `#FFFFFF` (White): カード、サイドバー、ヘッダーの背景色。
*   **Primary Action**:
    *   `#4F46E5` (Indigo 600): メインアクション（保存、作成など）。
    *   `#4338CA` (Indigo 700): ホバー時の色。
*   **Text**:
    *   `#111827` (Gray 900): 見出し、主要テキスト。
    *   `#4B5563` (Gray 600): 本文、ラベル。
    *   `#9CA3AF` (Gray 400): プレースホルダー、無効なテキスト。
*   **Status Colors**:
    *   **Success**: `#059669` (Green 600) / Bg: `#D1FAE5` (Green 100)
    *   **Error**: `#DC2626` (Red 600) / Bg: `#FEE2E2` (Red 100)
    *   **Warning**: `#D97706` (Amber 600) / Bg: `#FEF3C7` (Amber 100)
    *   **Info**: `#2563EB` (Blue 600) / Bg: `#DBEAFE` (Blue 100)
*   **Border**:
    *   `#E5E7EB` (Gray 200): 一般的な境界線。

## 3. タイポグラフィ (Typography)

**ゴシック体（サンセリフ）**を使用し、システムフォントを優先してレンダリング速度と可読性を確保。

*   **Font Family**:
    *   `"Inter", "Noto Sans JP", "Helvetica Neue", Arial, sans-serif`
*   **Font Sizes**:
    *   **H1 (Page Title)**: `24px` / Bold / Gray 900
    *   **H2 (Section/Card Title)**: `18px` / Semibold / Gray 900
    *   **H3 (Label)**: `14px` / Medium / Gray 700
    *   **Body**: `14px` / Regular / Gray 600
    *   **Small**: `12px` / Regular / Gray 500

## 4. レイアウト構造 (Layout Structure)

*   **Sidebar Navigation (Left)**:
    *   幅: `256px` (固定)
    *   背景: White または Dark (`#111827`)
    *   常に表示され、主要機能へのアクセスを提供。
*   **Header (Top)**:
    *   高さ: `64px`
    *   背景: White
    *   パンくずリスト、ユーザープロフィール、通知などを配置。
*   **Main Content Area**:
    *   パディング: `32px` (PC)
    *   最大幅: `1280px` (コンテンツに応じて可変、または中央揃え)

## 5. UIコンポーネント仕様

### Buttons
*   **Primary**: 背景 Indigo 600, 文字 White, 丸み `6px` (Rounded-md)。
*   **Secondary**: 背景 White, ボーダー Gray 300, 文字 Gray 700。
*   **Danger**: 背景 Red 600, 文字 White (削除アクション等)。
*   **サイズ**: 高さ `38px` (基本), パディング `px-4 py-2`。

### Forms
*   **Input / Select / Textarea**:
    *   枠線: Gray 300 (Focus時に Indigo 500 リング)。
    *   丸み: `6px`。
    *   背景: White。
    *   ラベル: 上部に配置、BoldまたはMedium。
*   **Checkbox / Radio**: Indigo 600 のアクセントカラー。

### Tables (Data Lists)
*   **Header**: 背景 Gray 50 (薄いグレー), 文字 Gray 500 (Uppercase, Small, Bold)。
*   **Row**: 背景 White, ボーダー下線 Gray 200。Hover時に Gray 50。
*   **Pagination**: 下部に配置。

### Cards
*   背景: White
*   枠線: Gray 200 (1px) または シャドウ (Shadow-sm)。
*   丸み: `8px` (Rounded-lg)。
*   パディング: `24px`。

## 6. 実装アプローチ (Tailwind CSS)

Tailwind CSSのデフォルトユーティリティを最大限活用する。
`src/app/admin/layout.tsx` にて、ルートのフォント設定やベーススタイルを上書き（または適用）し、公開サイト（明朝体・ボルドー背景）の影響を受けないように隔離する。

```tsx
// admin/layout.tsx のイメージ
export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-8">
            {children}
        </main>
      </div>
    </div>
  )
}
```
