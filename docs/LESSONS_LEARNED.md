# 精鋭カウンター実装 - 試行錯誤から得た知見

## 実装サイクル1: Custom Variables方式（失敗）

### 試みた方法
- LiveSplitの`custom_variables`機能を使って精鋭数を保存
- `editor.setCustomVariable(key, value)`で保存
- `editorState.metadata.custom_variables[key]`で読み込み

### 失敗の原因
**WASMバインディングの制約**により、以下の問題が発生：

1. **即座に反映されない**
   ```
   [setSegmentEliteCount] Setting __elite_count_seg___ = 7 for segment "時間" (index 0)
   [getSegmentEliteCount] Reading __elite_count_seg___ for segment "時間" (index 0): 0
   ```
   `setCustomVariable()`を呼んでも、`editorState.metadata.custom_variables`に即座に反映されない

2. **永続化されない**
   - React stateで管理すると表示は正しいが、Run保存時に失われる
   - スプリット設定を再度開くと全て0に戻る

### 技術的詳細

#### WASM/Rustバインディングの制約
- `livesplit-core`はRustで書かれWASMにコンパイルされている
- TypeScriptバインディングは自動生成で、全機能が公開されていない
- `editor.setCustomVariable()`は内部状態を変更するが、`stateAsJson()`の出力には即座に反映されない
- これはWASM層とJavaScript層の同期タイミングの問題

#### React State vs Custom Variables
- React stateで管理 → UI表示は問題ないが永続化できない
- Custom variables → 永続化されるはずだが、読み書きが正しく動作しない

## 正しいアプローチ: Rustでネイティブ実装

### 重要な発見
**livesplit-coreサブモジュールは既に初期化済み**
```bash
$ ls livesplit-core/src/
# Rustソースコードが存在！
```

### 実装方針（サイクル2）

1. **Rustで`Segment`構造体に`elite_count`フィールドを追加**
   ```rust
   pub struct Segment {
       name: String,
       icon: Image,
       best_segment_time: Time,
       split_time: Time,
       segment_history: SegmentHistory,
       comparisons: Comparisons,
       variables: HashMap<String, String>,
       elite_count: u32,  // 追加
   }
   ```

2. **LSS parser/serializerを更新**
   - `.lss`ファイル（XML形式）に`<EliteCount>`要素を追加
   - 読み込み時にパース、保存時にシリアライズ

3. **WASMバインディングを更新**
   - getter/setterメソッドを公開
   - TypeScriptから`segment.eliteCount()`でアクセス可能に

4. **TypeScriptから使用**
   ```typescript
   const count = editorState.segments[0].elite_count;  // 直接アクセス
   editor.activeSegment().setEliteCount(10);  // 直接設定
   ```

### メリット
- ✅ データの一貫性が保証される
- ✅ LSS形式で永続化される
- ✅ 既存のLiveSplit機能と同じアーキテクチャ
- ✅ WASMバインディングの制約を回避

### 実装手順
1. Rustで`Segment`に`elite_count`を追加
2. LSS parser (`livesplit-core/src/run/parser/livesplit.rs`) を更新
3. LSS writer (`livesplit-core/src/run/saver/livesplit.rs`) を更新
4. WASMバインディング (`livesplit-core/capi/bind_gen`) を更新
5. `npm run build:core` でWASM再ビルド
6. TypeScriptから新しいAPIを使用

## その他の知見

### デフォルトセグメント名
- `src/localization/japanese.ts`の`Label.NewSegmentName`で定義
- デフォルトは"時間"だったが、空欄に変更

### ビルドプロセス
- フロントエンド: `npm run tauri:build-html`
- Tauriアプリ: `npm run tauri:watch`（開発モード）
- livesplit-core: `npm run build:core`

### TypeScript警告
- `textBox`クラスが`RunEditor.module.scss`に存在しない
  - 実際は`Table.module.scss`にある
  - 警告だが動作には影響なし

## まとめ

Custom variables方式は**WASMバインディングの制約**により実用不可。
正しいアプローチは**Rustでネイティブ実装**してWASM経由で使用すること。

livesplit-coreのソースコードが既に存在するため、実装可能。
