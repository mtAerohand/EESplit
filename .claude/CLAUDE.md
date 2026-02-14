# Claude Code 開発ガイド - EESplit

## プロジェクト概要

このプロジェクトは原神の精鋭狩り（Elite Enemy）RTA用タイマーアプリ「EESplit」です。

- **ベース**: LiveSplitOne (https://github.com/LiveSplit/LiveSplitOne)
- **技術スタック**: React, TypeScript, Tauri, Rust (livesplit-core)
- **目的**: 原神専用のタイムアタック計測ツール

## 重要なドキュメント

開発を進める際は、以下のドキュメントを参照してください：

- **改修計画**: [docs/CUSTOMIZATION.md](../docs/CUSTOMIZATION.md)
- **変更履歴**: [docs/CHANGELOG.md](../docs/CHANGELOG.md)
- **機能仕様**: [docs/FEATURES.md](../docs/FEATURES.md)
- **開発フロー・Git戦略**: [docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md)

## 開発方針

### コード変更時の注意点

1. **LiveSplitOneからの変更を明確にする**
   - 大きな変更は必ず `docs/CHANGELOG.md` に記録
   - 原神専用機能は明確にコメントを残す

2. **日本語対応**
   - UIテキストは日本語を優先
   - コメント・ドキュメントは日本語でOK

3. **パフォーマンス**
   - 原神と同時起動することを想定
   - リソース消費を最小限に

4. **仕様参照にContext 7 MCPを活用**
   - 実装前に必ず `docs/FEATURES.md` などの仕様を確認
   - Context 7 MCPを使って最新の仕様を参照
   - 詳細は [docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md) の「MCP活用」セクションを参照

### ファイル構造

```
EESplit/
├── src/              # フロントエンド (React + TS)
├── src-tauri/        # Tauriバックエンド
├── livesplit-core/   # タイマーコアロジック (Rust)
├── docs/             # プロジェクトドキュメント
└── .claude/          # Claude Code設定
```

## コミットメッセージ規約

日本語でOKですが、以下の形式を推奨：

```
[カテゴリ] 変更内容

例：
[Feature] 精鋭敵プリセット機能を追加
[Fix] タイマーのバグを修正
[UI] テーマカラーを原神風に変更
```

## 開発時の確認事項

- [ ] 既存のLiveSplit機能を壊していないか
- [ ] 原神専用機能として適切か
- [ ] 日本語UIが正しく表示されるか
- [ ] パフォーマンスに影響がないか
