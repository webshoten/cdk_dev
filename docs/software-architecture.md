# ソフトウェアアーキテクチャ

このドキュメントは、アプリケーション実装側の構造（特に React）を説明します。  
インフラ構成は [README](../README.md) の「インフラ」セクションを参照してください。

## 全体方針

- モノレポで `infra` / `functions` / `frontend` を分離する
- Web クライアントは runtime config（`config.js`）で環境差分を吸収する
- React 側は Vertical Slice ベースで、関心事ごとにディレクトリを分ける

## レイヤー責務（React）

`packages/react/src` の責務は次のとおりです。

- `app/`: アプリの合成・エントリーポイント
- `slices/`: 機能単位の実装（Vertical Slice）
- `lib/`: スライス横断のユーティリティ（例: runtime config）

## Vertical Slice 構成

現在の主要スライス:

- `slices/auth`
- `slices/dashboard`

各スライス内は、次のサブフォルダで整理します。

- `ui/`: 画面表示コンポーネント
- `hooks/`: React hook
- `services/`: API 呼び出しなど外部I/O
- `context/`: スライス専用の共有状態（必要時のみ）

例（現行実装）:

```text
packages/react/src/
├── app/
│   └── App.tsx
├── lib/
│   └── runtime-config.ts
└── slices/
    ├── auth/
    │   ├── services/
    │   │   └── configureAmplify.ts
    │   └── ui/
    │       ├── AuthShell.tsx
    │       └── SignInHeader.tsx
    └── dashboard/
        ├── hooks/
        │   └── useDashboardGreeting.ts
        ├── services/
        │   └── fetchDashboardGreeting.ts
        └── ui/
            └── DashboardPanel.tsx
```

## config.js の扱い

CDK の `WebStack`（React 配信）で `config.js` を生成し、ブラウザで `window.__CONFIG__` として参照します。  
`lib/runtime-config.ts` が型チェック付きで読み出しを行います。

想定キー:

- `apiUrl`
- `cognito.userPoolId`
- `cognito.userPoolClientId`
- `cognito.region`

## 命名規約

- ファイル接尾辞（`.service.ts` など）は付けない
- 役割はディレクトリで表現する（`ui/`, `hooks/`, `services/`）
- 1ファイル1責務を基本とする

## 変更時のガイド

新しい機能を追加する場合:

1. `slices/<feature>` を作る
2. `ui` / `hooks` / `services` に責務分離して実装する
3. `app/App.tsx` で必要なスライスを合成する
4. 複数スライスで使うロジックだけ `lib/` に切り出す

