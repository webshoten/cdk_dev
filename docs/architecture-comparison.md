# アーキテクチャ比較

既存環境 (SST 構築) を CDK ベースで再現するにあたり、構成パターンを開発体験 (DX) 中心に比較する。

## 背景

- **SST → CDK への移行**: SST の将来性への不安から CDK に寄せる
- **DX は落としたくない**: 本番に近いものを簡単に再現できる、デプロイ時間が短い、細かい面倒な作業が不要
- **既存環境 (= SST)**: Next.js (OpenNext on Lambda) + GraphQL (Lambda) + ECS (顔モザイク処理のみ) + RDS + LiveKit + IoT Core + Cognito + S3
- **再現が第一目標**: 機能・動作の再現が最優先。技術スタックの置き換えは歓迎

---

## 比較する 3 パターン

- **SST**: 現状・比較基準。Next.js (OpenNext → Lambda) + GraphQL (Lambda)
- **CDK(SPA+Lambda)**: 移行案 1。React SPA (S3+CF) + GraphQL (Lambda)
- **CDK(ECS)**: 移行案 2。Next.js (ECS Fargate) + GraphQL (ECS Fargate)

**共通前提**:
- LiveKit 顔モザイク処理用 ECS / RDS / Cognito / IoT Core はどのパターンでも必要
- 個人環境は SST では "個人 stage"、CDK では "個人 stack"（本質的には同じ概念）

---

## 評価マトリクス

| 観点 | SST | CDK(SPA+Lambda) | CDK(ECS) |
|---|---|---|---|
| **1. 将来性・エコシステム** | ✕ v2 → v3 の破壊的変更の前例、単一ベンダー依存、情報量やや少 | ◎ AWS 公式で長期安定、情報豊富 | ◎ 同左 + Docker / ECS エコシステム厚い |
| **2. コードのテスタビリティ**<br>保存 → 反映（ライブデバッグ） | ◎ Live Lambda で実 Lambda に即反映 | ○ lld で同等、または `tsx watch` でローカル完結 | ○ ローカル完結なら `tsx watch`。実 ECS への保存→反映は原理的に遅い（ブレークポイント接続自体は ECS Exec + `--inspect` で可） |
| **3. インフラのテスタビリティ**<br>保存 → 反映（インフラのホットリロード） | ◎ `sst dev` でインフラ変更が即反映（SST 最大の強み） | ○ `cdk deploy --hotswap` は CloudFormation をバイパスして直接 API 呼び出し。Lambda は数秒で反映。hotswap 非対応リソースは CFn 経由 | △ hotswap は対応するが ECS rolling update 自体に数分かかる |
| **4. テスト環境の本番同等性（実環境）**<br>デプロイ先の環境が本番とどれだけ同じか | ◎ 個人 stage に本番と同じリソースを複製 | ◎ 個人 stack で同じく複製可能 | ◎ 同左 + Docker イメージも本番と同一 |
| **5. テスト環境の本番同等性（ローカル環境）**<br>手元で動かす環境が本番とどれだけ同じか | △ ローカル Node ≠ Lambda ランタイム（Live Lambda で実 Lambda 接続は可） | △ 同左（lld で実 Lambda 接続は可） | ◎ Docker で本番と同じイメージがそのままローカルで動く |
| **6. state の安全性** | △ Pulumi state 上で SST 抽象と生 Pulumi が同居、境界が曖昧で drift や pending state が起きやすい | ○ CloudFormation 単一 state。drift は起きうるが検知（`cdk diff`）・復旧手段は AWS 標準で揃う | ○ 同左 |
| **7. 作って壊してのしやすさ** | △ serverless で個人 stage のコストは低いが、SST + Pulumi の state 事故で destroy / 再作成が詰まりがち | ◎ serverless で使わない間ほぼ無料 + `cdk destroy` も軽い、drift 起きにくい | △ Fargate が常時課金で「使わない個人 stack」を持ちにくい + ENI / VPC 後始末の罠もあり |
| **8. インフラ制約（スケール）** | △ Lambda 制約を引き継ぐ（15 分上限、cold start、WebSocket 癖） | △ 同左 | ◎ 常時稼働で制約なし、long-running / WebSocket に強い |

**凡例**: ◎ 優位 / ○ 十分 / △ 弱点あり / ✕ 構造的に不利

---

## 示唆

### SST vs CDK 全般
- **state 安全性 / 作って壊し / 将来性** で SST が不利 → CDK 方針は妥当
- ただし **インフラのテスタビリティ（保存→反映速度）** では SST が最強

### CDK(SPA+Lambda) vs CDK(ECS)
- **SPA+Lambda が有利**: インフラのテスタビリティ（hotswap）、作って壊しの軽さ（serverless コスト + destroy 軽い）
- **ECS が有利**: ローカル環境での本番同等性（Docker）、スケール制約からの自由

### 結論に効く分岐
- **Next.js の SSR / middleware / App Router が必須か**
  - 必須 → CDK(ECS)
  - CSR で代替可能 → CDK(SPA+Lambda)
- **LiveKit 等で long-running / WebSocket が GraphQL 側にも必要か**
  - 必要 → CDK(ECS)
  - 不要 → CDK(SPA+Lambda)

---

## 未解決の論点

- [ ] Next.js の SSR / middleware / App Router をどこまで使っているか
- [ ] LiveKit / IoT Core のローカル開発方針（LocalStack / 共有 dev / モック）
- [ ] RDS 接続方式（Lambda なら Proxy 必須、ECS なら直接可）
- [ ] genql + urql 型自動生成パイプラインの実装
