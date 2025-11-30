import React from 'react';
import { ThemeType } from '../types';
import { Crown, Newspaper, Moon, LayoutGrid, Music, Leaf, Info } from 'lucide-react';

interface LandingViewProps {
  onSelect: (theme: ThemeType) => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-white border-b border-slate-200 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-slate-500 font-bold tracking-widest uppercase text-xs mb-4">
            Web Design Proposal
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            榎田 雅志 様 公式ウェブサイト リニューアルデザイン案
          </h1>
          <p className="text-slate-600 max-w-3xl leading-relaxed">
            アーティストとしてのアイデンティティを再定義するための、6つの異なるデザイン方向性をご提案いたします。
            各カードをクリックして、それぞれのウェブサイトデザインをご確認ください。
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Royal */}
          <button 
            onClick={() => onSelect('royal')}
            className="group text-left bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-[#ab966d] transition-all duration-300"
          >
            <div className="h-40 bg-[#Fdfdfa] flex items-center justify-center border-b border-slate-100 group-hover:bg-[#fcfbf5] transition-colors">
              <Crown size={48} className="text-[#ab966d] opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            </div>
            <div className="p-8">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                Royal Classic
                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">正統派</span>
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                静謐なる正統。縦書きのタイポグラフィとクリーム色の背景による、格式高い招待状のようなデザイン。
              </p>
              <span className="text-blue-600 text-sm font-bold group-hover:underline">デザインを確認する &rarr;</span>
            </div>
          </button>

          {/* Editorial */}
          <button 
            onClick={() => onSelect('editorial')}
            className="group text-left bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-black transition-all duration-300"
          >
            <div className="h-40 bg-white flex items-center justify-center border-b border-slate-100">
              <Newspaper size={48} className="text-black opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            </div>
            <div className="p-8">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                Editorial Classic
                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">現代的</span>
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                現代のポートフォリオ。雑誌のような大胆な余白と非対称レイアウト、ハイコントラストな配色。
              </p>
              <span className="text-blue-600 text-sm font-bold group-hover:underline">デザインを確認する &rarr;</span>
            </div>
          </button>

          {/* Nocturne */}
          <button 
            onClick={() => onSelect('nocturne')}
            className="group text-left bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-[#1C1917] transition-all duration-300"
          >
            <div className="h-40 bg-[#1C1917] flex items-center justify-center border-b border-slate-100">
              <Moon size={48} className="text-[#D6D3D1] opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            </div>
            <div className="p-8">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                Nocturne
                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">夜想曲</span>
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                夜の独白。漆黒の背景に浮かぶ文字。演奏会場のような没入感と静寂を表現。
              </p>
              <span className="text-blue-600 text-sm font-bold group-hover:underline">デザインを確認する &rarr;</span>
            </div>
          </button>

          {/* Studio */}
          <button 
            onClick={() => onSelect('studio')}
            className="group text-left bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-gray-400 transition-all duration-300"
          >
            <div className="h-40 bg-gray-100 flex items-center justify-center border-b border-slate-100">
              <LayoutGrid size={48} className="text-gray-900 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            </div>
            <div className="p-8">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                Modern Studio
                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">機能美</span>
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                記録とデータ。無機質なグレー、グリッドライン、等幅フォントによるアーカイブ的な知性。
              </p>
              <span className="text-blue-600 text-sm font-bold group-hover:underline">デザインを確認する &rarr;</span>
            </div>
          </button>

          {/* Stage */}
          <button 
            onClick={() => onSelect('stage')}
            className="group text-left bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-[#800] transition-all duration-300"
          >
            <div className="h-40 bg-[#450a0a] flex items-center justify-center border-b border-slate-100">
              <Music size={48} className="text-white opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            </div>
            <div className="p-8">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                Grand Stage
                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">劇場</span>
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                幕開けの緊張。深いボルドーと黒、プログラムリスト形式のレイアウトによるドラマチックな演出。
              </p>
              <span className="text-blue-600 text-sm font-bold group-hover:underline">デザインを確認する &rarr;</span>
            </div>
          </button>

          {/* Nature */}
          <button 
            onClick={() => onSelect('nature')}
            className="group text-left bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-[#57534e] transition-all duration-300"
          >
            <div className="h-40 bg-[#e7e5e4] flex items-center justify-center border-b border-slate-100">
              <Leaf size={48} className="text-[#57534e] opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            </div>
            <div className="p-8">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                Harmony & Nature
                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">調和</span>
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                原風景。アースカラーと素材感を重視したコラージュレイアウト。ルーツである自然との調和。
              </p>
              <span className="text-blue-600 text-sm font-bold group-hover:underline">デザインを確認する &rarr;</span>
            </div>
          </button>

        </div>

        <div className="mt-16 p-6 bg-slate-100 rounded-lg text-xs text-slate-500 flex gap-4 items-start">
           <Info size={16} className="shrink-0 mt-0.5" />
           <div className="space-y-2">
             <p className="font-bold">ご確認ください</p>
             <p>※ 本サイトはデザイン案確認用のサンプルです。</p>
             <p>※ コンサート情報やブログ記事などのテキストデータは、レイアウト確認のための仮のものです。</p>
             <p>※ 使用している画像はイメージです。本番サイト制作時には、ご提供いただく高解像度の写真素材に差し替えます。</p>
           </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-400">
        &copy; 2025 Web Design Proposal for Masashi Enokida.
      </footer>
    </div>
  );
};

export default LandingView;