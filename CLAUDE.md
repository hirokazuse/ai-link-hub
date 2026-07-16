# ai-link-hub

## 作業完了ルール（status.json）

コミットを作成する際は、実装差分と同じコミットに `status.json` の更新を含めること。status.json だけを独立コミットしない。

- `status`: `active` / `planning` / `paused` のいずれか（既存3値を維持。拡張しない）
- `progress`: 0〜100の概算進捗率（数値、既存フィールド。体感値でよい）
- `progressNote`: 今回の変更内容を一言で（テキスト。「今何が起きているか」を人が読むための補足。ブロック中なら理由もここに書く）
- `description`: プロジェクト概要（一言）
- `issues.open` / `issues.closed`: Issue件数
- `prs.open` / `prs.merged`: PR件数
- `lastUpdated`: 更新日（`YYYY-MM-DD`）
- `notes`: 補足（任意）

