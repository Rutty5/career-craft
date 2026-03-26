import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-warm-bg">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <span className="text-xl font-black text-navy">キャリアクラフト</span>
          </div>
          <Link href="/app" className="bg-gradient-to-r from-navy to-navy-light text-white px-5 py-2 rounded-lg font-bold text-sm hover:shadow-lg transition-all">
            無料で始める
          </Link>
        </div>
      </header>

      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-black text-navy leading-tight mb-6">
            AI × 転職支援20年以上の知見で<br />
            <span className="text-gold">職務経歴書</span>を戦略的に最適化
          </h1>
          <p className="text-lg sm:text-xl text-text-light mb-10 max-w-2xl mx-auto">
            転職支援20年以上のナレッジを集約。<br className="hidden sm:block" />
            40代・50代専門の職務経歴書 添削・リライト AIツール
          </p>
          <Link href="/app" className="inline-block bg-gradient-to-r from-gold to-gold-light text-white px-10 py-4 rounded-xl font-black text-lg shadow-lg hover:shadow-xl hover:brightness-110 transition-all">
            無料で始める →
          </Link>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-navy text-center mb-12">3つのモードで徹底サポート</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-warm-bg rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-bold text-navy mb-2">添削・スコアリング</h3>
              <p className="text-sm text-text-light leading-relaxed">5軸評価（100点満点）で現状を診断。改善ポイントTOP3とBefore→Afterの具体例を提示します。</p>
            </div>
            <div className="bg-warm-bg rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-bold text-navy mb-2">リライト</h3>
              <p className="text-sm text-text-light leading-relaxed">改善版の職務経歴書を全文作成。応募先に最適化された「利益提案書」として再構成します。</p>
            </div>
            <div className="bg-warm-bg rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-lg font-bold text-navy mb-2">自己PR作成</h3>
              <p className="text-sm text-text-light leading-relaxed">PREP法に基づく説得力のある自己PRを2〜3パターン作成。400〜600字で面接にも使えます。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-navy text-center mb-12">かんたん3ステップ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-r from-navy to-navy-light text-white rounded-full flex items-center justify-center text-xl font-black mx-auto mb-4">1</div>
              <h3 className="text-lg font-bold text-navy mb-1">基本設定</h3>
              <p className="text-sm text-text-light">年代・業界・職種・モードを選択</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-r from-navy to-navy-light text-white rounded-full flex items-center justify-center text-xl font-black mx-auto mb-4">2</div>
              <h3 className="text-lg font-bold text-navy mb-1">経歴書を入力</h3>
              <p className="text-sm text-text-light">現在の職務経歴書をペースト</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-r from-navy to-navy-light text-white rounded-full flex items-center justify-center text-xl font-black mx-auto mb-4">3</div>
              <h3 className="text-lg font-bold text-navy mb-1">AI分析・結果</h3>
              <p className="text-sm text-text-light">即座に改善提案を受け取る</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-navy mb-8">幅広い業界・職種に対応</h2>
          <p className="text-text-light mb-6">16業界 × 12職種のカスタマイズ対応。同業種転職・異業種転職の両方に最適化します。</p>
          <Link href="/app" className="inline-block bg-gradient-to-r from-gold to-gold-light text-white px-10 py-4 rounded-xl font-black text-lg shadow-lg hover:shadow-xl hover:brightness-110 transition-all">
            今すぐ添削を始める →
          </Link>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-gray-200">
        <div className="max-w-5xl mx-auto text-center text-sm text-text-light">
          <p>&copy; 2026 キャリアクラフト. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
