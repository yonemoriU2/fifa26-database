# FC26 Scout Database Prototype

React + Vite + TypeScript + shadcn/ui style components で作成した、EA SPORTS FC 26向けの選手検索プロトタイプです。

## 現在の機能

- 選手名 / クラブ / 国籍の全文検索
- ポジション絞り込み
- 年齢レンジ
- OVRレンジ
- POTレンジ
- クラブ / 国籍フィルター
- OVR / POT / 年齢 / 市場価値ソート
- 選手クリックで詳細能力表示
- GitHub Pages向けActions設定
- レスポンシブ表示

## 重要

`src/data/players.ts` はUI確認用のモックデータです。数値は公式FC26データとして保証されません。
実運用時は取得元ライセンスを確認したFC26データセットを正規化し、JSONまたはTypeScriptデータへ差し替えてください。

## 起動

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
npm run preview
```

## 実データへの差し替え

最終的には以下の形に正規化すると扱いやすいです。

```ts
{
  id,
  name,
  club,
  nationality,
  position,
  secondaryPositions,
  age,
  overall,
  potential,
  pace,
  shooting,
  passing,
  dribbling,
  defending,
  physical,
  foot,
  valueM
}
```

大量データでは `public/data/players.min.json` に検索用の軽量データを置き、選手詳細を分割JSONにする構成へ拡張できます。

## GitHub Pages

`.github/workflows/deploy-pages.yml` を同梱しています。
GitHubのリポジトリ設定で Pages の Source を GitHub Actions に設定してください。
