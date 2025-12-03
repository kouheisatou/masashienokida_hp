# 実装計画書 (Implementation Plan)

## 1. プロジェクト構成 (Monorepo Structure)

ルートディレクトリに `frontend` と `backend` を配置する構成とします。

```
.
├── docker-compose.yml      # 全サービスの起動設定
├── .env                    # 共通環境変数 (Dockerで共有)
├── frontend/               # Next.js (App Router)
│   ├── src/
│   │   ├── app/            # Pages & Layouts
│   │   ├── components/     # UI Components
│   │   ├── lib/            # Generated API Client (OpenAPI)
│   │   └── ...
│   ├── Dockerfile
│   └── ...
├── backend/                # NestJS (Recommended for OpenAPI/TDD)
│   ├── src/
│   │   ├── prisma/         # Prisma Schema & Migrations
│   │   ├── modules/        # Feature Modules
│   │   └── ...
│   ├── test/               # E2E Tests
│   ├── Dockerfile
│   └── ...
└── docs/                   # ドキュメント
```

## 2. 技術スタック詳細

### Frontend
*   **Framework**: Next.js 14+ (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **API Client**: `openapi-generator-cli` で生成された TypeScript-Fetch クライアント
    *   *Rule*: `src/lib/api` 配下に生成し、手動編集禁止。

### Backend
*   **Framework**: NestJS (TypeScript)
    *   理由: OpenAPI (Swagger) の自動生成サポートが強力で、構造化された開発が可能なため。
*   **Database**: PostgreSQL (Dockerコンテナで提供)
*   **ORM**: Prisma
*   **API Spec**: OpenAPI 3.0 (Code-first approach with NestJS decorators)
*   **Testing**: Jest (Unit/Integration), Supertest (E2E)

### Infrastructure / Dev Environment
*   **Docker Compose**:
    *   `frontend`: Next.js Dev Server (Hot Reload enabled)
    *   `backend`: NestJS Dev Server (Hot Reload enabled)
    *   `db`: PostgreSQL
    *   `studio`: Prisma Studio (Optional, for DB GUI)

## 3. 開発ワークフロー

### A. OpenAPI連携フロー
1.  **Backend**: NestJSのコントローラーとDTOにデコレータ (`@ApiProperty` 等) を記述。
2.  **Backend**: サーバー起動時に `http://localhost:3000/api-json` 等でOpenAPIスペックを出力。
3.  **Frontend**: スクリプト (`npm run generate-client`) を実行。
    *   Docker経由またはローカルの `openapi-generator-cli` がバックエンドのスペックを読み込み、`frontend/src/lib/api` にコードを生成。
4.  **Frontend**: 生成されたクラス/関数を使ってAPIコール実装。

### B. テスト駆動開発 (TDD) フロー (Backend)
1.  **Red**: 実装したい機能のE2Eテスト (`test/xxx.e2e-spec.ts`) または単体テストを書く。
    *   例: `GET /concerts` が 200 OK と空配列を返すことを期待するテスト。
2.  **Green**: テストを通すための最小限の実装を行う。
3.  **Refactor**: コードを整理する。

### C. データベース変更フロー
1.  `backend/prisma/schema.prisma` を編集。
2.  `npx prisma migrate dev` でマイグレーションファイル作成＆DB適用。
3.  `npx prisma generate` でPrisma Client更新。

## 4. 初期構築ステップ

1.  **プロジェクト初期化**:
    *   ルートディレクトリ作成、Git初期化。
    *   `frontend` (Next.js), `backend` (NestJS) の雛形作成。
2.  **Docker環境構築**:
    *   `Dockerfile` (Front/Back) 作成。
    *   `docker-compose.yml` 作成 (DB含む)。
    *   `.env` 設定。
3.  **OpenAPI連携設定**:
    *   Backend: SwaggerModule設定。
    *   Frontend: `openapi-generator` 導入、生成スクリプト作成。
4.  **Prisma設定**:
    *   BackendにPrisma導入、DB接続確認。
5.  **認証基盤 (Google Auth) 準備**:
    *   Firebase Auth または NextAuth.js + Backend検証の構成決定。
    *   *推奨*: NextAuth.js (Frontend) でGoogleログインし、ID TokenをBackendに送り、Backendで検証してUser作成/特定するフロー。

## 5. 今後のタスク
*   [ ] プロジェクトディレクトリとGitの初期化
*   [ ] Docker Compose環境の構築
*   [ ] Backend (NestJS) 初期セットアップ & OpenAPI出力設定
*   [ ] Frontend (Next.js) 初期セットアップ & OpenAPI生成スクリプト作成
*   [ ] Prisma & DB接続設定
