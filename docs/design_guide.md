# デザインガイドライン

## 1. デザインコンセプト
**「劇場のような没入感と、現代的な機能美の融合」**

*   **キーワード**: Gorgeous (ゴージャス), Theatrical (劇場的), Elegant (優雅), Modern (現代的), Readable (可読性)
*   **雰囲気**:
    *   クラシック音楽のコンサートホールに足を踏み入れたような、静謐で重厚な空気感。
    *   暗闇の中にスポットライトが当たるような、ドラマチックな演出。
    *   **ゴシック体による統一**で、モダンかつ洗練された印象を強調する。

## 2. カラーパレット (Color Palette)

ベースは「漆黒」と「深紅」で劇場の幕やピアノの塗装をイメージし、アクセントに「ゴールド」を用いて品格を添える。

*   **Primary Background (背景色)**:
    *   `#0a0a0a` (Rich Black): ほぼ黒に近いが、わずかに温かみのある黒。メイン背景。
    *   `#1a0505` (Deep Red Black): 非常に暗い赤黒。セクション背景やグラデーションに使用。
*   **Primary Text (文字色)**:
    *   `#f0f0f0` (Off White): 真っ白ではなく、目に優しいオフホワイト。本文用。
    *   `#d4af37` (Metallic Gold): 見出し、アクセント、リンクのホバー時。落ち着いた輝きのある金。
*   **Secondary Accent**:
    *   `#800000` (Maroon): 深紅。ボタンや強調要素の背景色。
    *   `#2d2d2d` (Dark Gray): フッターやカードの背景色。

## 3. タイポグラフィ (Typography)

**ゴシック系で統一**し、モダンで可読性の高いデザインとする。ウェイト（太さ）の使い分けでメリハリをつける。

*   **Font Family**:
    *   `"Zen Kaku Gothic New", "Noto Sans JP", sans-serif`
    *   クラシックな雰囲気の中に現代的な切れ味を持たせるため、少し骨格のしっかりしたゴシック体を採用。
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
      sans: ['"Zen Kaku Gothic New"', '"Noto Sans JP"', 'sans-serif'],
    },
    colors: {
      primary: '#0a0a0a',
      accent: '#d4af37',
      // ...他カラー
    },
    spacing: {
      '120': '120px', // Section Padding用
    }
  }
}
```
