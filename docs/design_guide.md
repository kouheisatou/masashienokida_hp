# デザインガイドライン

## 1. デザインコンセプト
**「ミニマルで洗練されたエレガンス」**

*   **キーワード**: Minimal (ミニマル), Elegant (優雅), Refined (洗練), Timeless (普遍的), Readable (可読性)
*   **雰囲気**:
    *   静謐で落ち着いた、ピアノの音色が響くような空間。
    *   装飾を極限まで削ぎ落とし、タイポグラフィとホワイトスペースで魅せる。
    *   **明朝体による統一**で、クラシカルかつモダンな印象を表現する。

## 2. カラーパレット (Color Palette)

ベースは「漆黒」のみを使用し、究極のシンプルさを追求。アクセントカラーは使用せず、白とグレーのみでコントラストを作る。

*   **Primary Background (背景色)**:
    *   `#0a0a0a` (Rich Black): 深い黒。メイン背景。
    *   `#1a1a1a` (Darker Gray): セクション背景、カードの背景。
*   **Primary Text (文字色)**:
    *   `#ffffff` (Pure White): 見出し、重要なテキスト用。
    *   `#cccccc` (Light Gray): 本文用。
    *   `#888888` (Medium Gray): 補足情報、日付など。
*   **Border & Divider**:
    *   `#333333` (Dark Gray): 境界線、区切り線用。

## 3. タイポグラフィ (Typography)

**明朝体で統一**し、クラシカルで読みやすいデザインとする。

*   **Font Family**:
    *   `"Noto Serif JP", "游明朝", "Yu Mincho", serif`
    *   エレガントで可読性の高い明朝体を採用。
*   **Font Sizes & Line Heights (Pixel指定)**:
    *   **H1 (Main Hero)**: `64px` / `1.2` (SP: `40px`) - 圧倒的な存在感。
    *   **H2 (Section Title)**: `36px` / `1.4` (SP: `28px`) - セクションの区切り。
    *   **H3 (Card Title)**: `24px` / `1.5` (SP: `20px`)
    *   **Body (本文)**: `16px` / `1.8` (SP: `15px`) - 読みやすさを重視し、行間を広めに取る。
    *   **Small (注釈)**: `12px` / `1.6`

## 4. デザイン定義 (Design Tokens)

デザイナー視点で統一感を持たせるための数値定義。

### Spacing (余白・マージン)
8の倍数を基本ルールとし、リズムを作る。

*   **Section Padding (セクション間の余白)**:
    *   PC: `120px` (ゆったりとした余白で高級感を演出)
    *   SP: `80px`
*   **Component Margin (要素間の余白)**:
    *   `8px`: 極小（アイコンとテキストの間など）
    *   `16px`: 小（リストアイテム間）
    *   `24px`: 中（カード内の要素間）
    *   `40px`: 大（見出しと本文の間）
    *   `64px`: 特大（グループ間の区切り）

### Border Radius (角丸)
モダンさを出すため、わずかに丸みを持たせるが、甘くなりすぎないように抑える。

*   **Card / Image**: `4px` (シャープさを残した微細な角丸)
*   **Button**: `9999px` (完全な円形・ピル型でエレガントさを強調) または `2px` (極めてシャープ)
    *   *推奨*: メインアクション（チケット購入など）は `9999px`、サブ要素は `4px`。

### Layout & Grid
*   **Max Container Width**: `1200px` (コンテンツの最大幅)
*   **Side Padding**: `24px` (SP時の画面端からの余白)

### Effects
*   **Glassmorphism**:
    *   Background: `rgba(255, 255, 255, 0.05)`
    *   Backdrop Blur: `12px`
    *   Border: `1px solid rgba(255, 255, 255, 0.1)`
*   **Shadow (Drop Shadow)**:
    *   Card Hover: `0px 10px 30px rgba(0, 0, 0, 0.5)` (浮遊感)

## 5. UI要素の具体仕様

*   **Buttons**:
    *   Height: `48px` (タップしやすいサイズ)
    *   Padding: `0 32px`
    *   Text: `14px`, Tracking (Letter Spacing): `0.05em`
*   **Images**:
    *   全ての画像に対して、明度を少し落とす (`brightness: 0.8`) か、黒のオーバーレイ (`opacity: 0.2`) をかけ、文字の可読性とサイト全体のトーンを統一する。ホバー時に `brightness: 1.0` に戻る演出などを入れる。

## 6. 実装時の注意点 (Tailwind CSS Config)

`tailwind.config.js` にて以下を拡張設定すること。

```javascript
theme: {
  extend: {
    fontFamily: {
      serif: ['"Noto Serif JP"', '"Yu Mincho"', 'serif'],
    },
    colors: {
      primary: '#0a0a0a',
      'gray-dark': '#1a1a1a',
      // ...他カラー
    },
    spacing: {
      '120': '120px', // Section Padding用
    }
  }
}
```

## 7. デザイン原則

*   **装飾を排除**: グラデーション、シャドウ、ゴールドアクセントは使用しない
*   **ホワイトスペース**: 余白を贅沢に使い、呼吸感を持たせる
*   **タイポグラフィ重視**: 文字の美しさとレイアウトで魅せる
*   **最小限のカラー**: 黒、白、グレーのみで構成
