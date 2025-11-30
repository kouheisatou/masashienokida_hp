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
            6つの異なるデザイン方向性をご提案いたします。
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
                縦書き・クラシック
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                縦書きと明朝体を使用した、落ち着いた印象のデザインです。
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
                マガジン・スタイル
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                雑誌のように写真を大きく使い、余白を活かしたレイアウトです。
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
                ダーク・モード
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                黒を背景にした、没入感のあるデザインです。
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
                ミニマル・グリッド
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                装飾を抑え、情報の見やすさを重視したシンプルなデザインです。
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
                シアター・スタイル
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                劇場の雰囲気をイメージした、深みのある赤色が特徴のデザインです。
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
                ナチュラル・コラージュ
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                自然な色味と写真を重ねた配置で、柔らかさを出したデザインです。
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