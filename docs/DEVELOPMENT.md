# 開発フローとGit戦略

## Git戦略：GitHub Flow

このプロジェクトではシンプルで効率的な **GitHub Flow** を採用しています。

### ブランチ構成

- **`master`**: メインブランチ（常にデプロイ可能な状態を保つ）
- **`feature/*`**: 機能開発用ブランチ
- **`fix/*`**: バグ修正用ブランチ
- **`docs/*`**: ドキュメント更新用ブランチ

### 基本フロー

```
master
  │
  ├─→ feature/add-elite-enemy-preset (Issue #1)
  │     │
  │     └─→ PR #1 → Review → Merge
  │
  ├─→ fix/timer-bug (Issue #2)
  │     │
  │     └─→ PR #2 → Review → Merge
  │
  └─→ master (常に最新の安定版)
```

## 開発フロー（推奨手順）

### 1. Issueの作成

新機能や修正の内容をGitHub Issueとして作成します。

```
例：
タイトル: 精鋭敵プリセット機能を追加
内容: 原神の精鋭敵リストをプリセットとして選択できる機能を実装
```

### 2. ブランチの作成

Issueから直接ブランチを作成するか、手動で作成します。

```bash
# Issue #1の場合
git checkout -b feature/add-elite-enemy-preset

# ブランチ名の規則
# feature/機能名-issue番号
# fix/修正内容-issue番号
```

### 3. 開発（Claude Code使用）

Claude Codeの `/feature-dev` コマンドを使って開発を進めます。

```
/feature-dev
```

このコマンドにより：
- Issueの内容に基づいた実装
- 適切なコミットメッセージの自動生成
- テストコードの作成（必要に応じて）

### 4. コミット

変更をコミットします。コミットメッセージは日本語でOK。

```bash
git add .
git commit -m "[Feature] 精鋭敵プリセット機能を追加 #1"
```

### 5. プッシュ

```bash
git push -u origin feature/add-elite-enemy-preset
```

### 6. コードレビュー（セルフレビュー）

Claude Codeの `/pr-review-toolkit:review-pr` を使ってレビューを行います。

```
/pr-review-toolkit:review-pr
```

このコマンドにより：
- コードの問題点の指摘
- ベストプラクティスの提案
- パフォーマンスやセキュリティの確認

### 7. 修正対応

レビューで指摘された問題を修正します。

```bash
# 修正後
git add .
git commit -m "[Fix] レビュー指摘事項を修正"
git push
```

### 8. プルリクエストの作成

GitHubでプルリクエストを作成します。

```
タイトル: [Feature] 精鋭敵プリセット機能を追加 #1
説明:
- 精鋭敵リストのデータベース実装
- UIコンポーネントの追加
- テストコードの追加

Closes #1
```

### 9. マージ

レビューが完了したら、`master` ブランチにマージします。

```bash
# GitHubのUI上でマージ
# または CLI で
gh pr merge --squash
```

### 10. ブランチの削除

マージ後、featureブランチを削除します。

```bash
git branch -d feature/add-elite-enemy-preset
git push origin --delete feature/add-elite-enemy-preset
```

## Claude Code活用のポイント

### `/feature-dev` コマンド
- Issueの内容を理解して実装を提案
- 段階的な開発サポート
- コードの品質を保ちながら効率的に開発

### `/pr-review-toolkit:review-pr` コマンド
- 包括的なコードレビュー
- 潜在的なバグの発見
- コーディング規約の確認

## MCP (Model Context Protocol) の活用

### Context 7 MCP の導入

このプロジェクトでは **Context 7 MCP** を活用して、開発時の仕様参照を効率化します。

#### Context 7 MCPとは

Model Context Protocol (MCP) はAnthropicが開発した、AIアシスタントが外部ツールやデータソースにアクセスするための標準化プロトコルです。Context 7 MCPは、プロジェクトの仕様書やドキュメントを一元管理し、必要に応じて参照できるツールです。

#### 導入方法

1. **MCPサーバーの設定**

プロジェクトルートに `.mcp.json` ファイルを作成（既に設定済み）：

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"],
      "env": {
        "CONTEXT7_PROJECT_PATH": "c:\\Users\\bambo\\workspace\\EESplit"
      }
    }
  }
}
```

2. **MCPサーバーの有効化**

Claude Codeの初回起動時、またはプロジェクトを開いた時に、Context 7 MCPサーバーの使用許可を求められるので承認します。

2. **仕様書の配置**

`docs/` フォルダに仕様書を配置：
- `docs/FEATURES.md` - 機能仕様
- `docs/API.md` - API仕様（作成予定）
- `docs/UI_DESIGN.md` - UI設計書（作成予定）
- `docs/DATA_STRUCTURE.md` - データ構造仕様（作成予定）

#### 開発フローでの活用

Context 7 MCPは開発フローの各段階で仕様参照に使用します。

##### 1. Issue作成時 - 仕様の確認

Issueを作成する前に、Context 7 MCPで既存の仕様を確認：

```
Claude: docs/FEATURES.mdの精鋭敵関連の仕様を教えて
```

これにより、重複する機能の作成を防ぎ、一貫性のある設計ができます。

##### 2. 設計・実装時 - 仕様の参照

開発中に仕様を確認する際、Context 7 MCPを利用：

```
Claude: UIコンポーネントの命名規則は？
Claude: データ構造のスキーマを確認
Claude: API仕様に従ってエンドポイントを実装
```

**メリット**:
- 仕様書を手動で開く手間が省ける
- 最新の仕様を常に参照できる
- AIが文脈を理解して適切な実装を提案

##### 3. レビュー時 - 仕様との整合性確認

コードレビュー時に仕様との整合性をチェック：

```
Claude: この実装は仕様通り？
Claude: データ構造が仕様と一致しているか確認
```

#### 仕様書の管理

Context 7 MCPを効果的に使うため、仕様書は以下のルールで管理：

1. **常に最新に保つ**
   - 仕様変更があった場合、すぐにドキュメントを更新
   - 実装とドキュメントの乖離を防ぐ

2. **明確な構造**
   - セクションを明確に分ける
   - 検索しやすいキーワードを使う

3. **バージョン管理**
   - 仕様変更は `docs/CHANGELOG.md` に記録
   - 破壊的変更は明示的にマーク

#### 使用例

```bash
# 開発開始前
Claude: 精鋭敵プリセット機能の仕様を確認

# 実装中
Claude: 精鋭敵のデータ構造はどうなっている？

# コードレビュー中
Claude: この実装は仕様の要件を満たしている？

# テスト設計時
Claude: この機能のテストケースを仕様から生成
```

#### 推奨される運用

- **Issue作成時**: 必ず関連する仕様を確認
- **実装前**: 仕様を読み込んでから設計
- **コミット前**: 仕様との整合性を確認
- **PR作成時**: 仕様要件を満たしているか検証

## コミットメッセージ規約

```
[カテゴリ] 変更内容 #Issue番号

カテゴリ:
- Feature: 新機能追加
- Fix: バグ修正
- Refactor: リファクタリング
- Docs: ドキュメント更新
- UI: UI/UX改善
- Test: テスト追加・修正
- Perf: パフォーマンス改善

例:
[Feature] 精鋭敵プリセット機能を追加 #1
[Fix] タイマーが正しく停止しない問題を修正 #5
[UI] テーマカラーを原神風に変更 #3
```

## 注意事項

### ⚠️ やってはいけないこと

- `master` ブランチへの直接コミット
- レビューなしでのマージ
- 複数の機能を1つのPRにまとめる
- コミットメッセージを適当に書く

### ✅ 推奨事項

- 小さく頻繁にコミット
- PR は1機能1PR
- コミット前にビルドとテストを確認
- レビュー指摘は素直に受け入れて改善

## リリースフロー

将来的にリリース管理が必要になった場合：

1. バージョニング：セマンティックバージョニング（v1.0.0）
2. リリースブランチ：`release/v1.0.0`
3. タグ付け：`git tag v1.0.0`
4. リリースノート作成

## トラブルシューティング

### コンフリクトが発生した場合

```bash
# masterの最新を取得
git checkout master
git pull origin master

# featureブランチにマージ
git checkout feature/your-feature
git merge master

# コンフリクトを解決
# エディタでコンフリクト部分を修正

git add .
git commit -m "[Fix] コンフリクトを解決"
git push
```

### 間違ったコミットをした場合

```bash
# 最後のコミットを取り消し（変更は残す）
git reset --soft HEAD^

# 最後のコミットを完全に取り消し
git reset --hard HEAD^
```

---

**より詳しい情報**:
- [GitHub Flow Guide](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Conventional Commits](https://www.conventionalcommits.org/)
