import React from 'react';
import { FileText, Crown, Newspaper, Moon, LayoutGrid, Music, Leaf } from 'lucide-react';

const AnalysisView: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen p-8 md:p-16 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-slate-200 pb-8">
          <div className="flex items-center gap-3 text-blue-600 mb-4">
            <FileText size={24} />
            <span className="font-bold uppercase tracking-wider text-sm">Documentation</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">masashi-enokida.com デザイン提案</h1>
          <p className="text-lg text-slate-600">
             榎田匡志氏のアーティスト性を多角的に解釈した6つのデザインアプローチ。
             各デザインは個別のデザインガイド（docs/design_guide_*.md）に基づいて厳格に定義されています。
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-12">
            
            <section>
              <h2 className="text-2xl font-bold mb-6 text-slate-900">Design Variations</h2>
              <div className="grid md:grid-cols-2 gap-6">
                 
                 {/* Royal */}
                 <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-[#ab966d] transition-colors">
                    <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <span className="p-2 bg-[#Fdfdfa] border border-[#ab966d] text-[#ab966d] rounded"><Crown size={18}/></span> 
                      Royal Classic
                    </h3>
                    <p className="text-slate-600 text-sm mb-4">
                       <span className="font-bold text-xs uppercase tracking-wider text-slate-400 block mb-1">Concept</span>
                       静謐なる正統。縦書きのタイポグラフィとクリーム色の背景による、格式高い招待状のようなデザイン。
                    </p>
                 </div>

                 {/* Editorial */}
                 <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-black transition-colors">
                    <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                       <span className="p-2 bg-white border border-black text-black rounded"><Newspaper size={18}/></span> 
                       Editorial Classic
                    </h3>
                    <p className="text-slate-600 text-sm mb-4">
                       <span className="font-bold text-xs uppercase tracking-wider text-slate-400 block mb-1">Concept</span>
                       現代のポートフォリオ。雑誌のような大胆な余白と非対称レイアウト、ハイコントラストな配色。
                    </p>
                 </div>

                 {/* Nocturne */}
                 <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-[#1C1917] transition-colors">
                    <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                       <span className="p-2 bg-[#1C1917] text-[#D6D3D1] rounded"><Moon size={18}/></span> 
                       Nocturne
                    </h3>
                    <p className="text-slate-600 text-sm mb-4">
                       <span className="font-bold text-xs uppercase tracking-wider text-slate-400 block mb-1">Concept</span>
                       夜の独白。漆黒の背景に浮かぶ文字。演奏会場のような没入感と静寂を表現。
                    </p>
                 </div>

                 {/* Studio */}
                 <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-gray-400 transition-colors">
                    <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                       <span className="p-2 bg-gray-100 text-gray-900 border border-gray-300 rounded"><LayoutGrid size={18}/></span> 
                       Modern Studio
                    </h3>
                    <p className="text-slate-600 text-sm mb-4">
                       <span className="font-bold text-xs uppercase tracking-wider text-slate-400 block mb-1">Concept</span>
                       記録とデータ。無機質なグレー、グリッドライン、等幅フォントによるアーカイブ的な知性。
                    </p>
                 </div>

                 {/* Stage */}
                 <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-[#800] transition-colors">
                    <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                       <span className="p-2 bg-[#450a0a] text-white rounded"><Music size={18}/></span> 
                       Grand Stage
                    </h3>
                    <p className="text-slate-600 text-sm mb-4">
                       <span className="font-bold text-xs uppercase tracking-wider text-slate-400 block mb-1">Concept</span>
                       幕開けの緊張。深いボルドーと黒、プログラムリスト形式のレイアウトによるドラマチックな演出。
                    </p>
                 </div>

                 {/* Nature */}
                 <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-[#57534e] transition-colors">
                    <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                       <span className="p-2 bg-[#e7e5e4] text-[#57534e] rounded"><Leaf size={18}/></span> 
                       Harmony & Nature
                    </h3>
                    <p className="text-slate-600 text-sm mb-4">
                       <span className="font-bold text-xs uppercase tracking-wider text-slate-400 block mb-1">Concept</span>
                       原風景。アースカラーと素材感を重視したコラージュレイアウト。ルーツである自然との調和。
                    </p>
                 </div>

              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg sticky top-8">
               <h3 className="font-bold text-lg mb-4">ガイドライン運用</h3>
               <p className="text-slate-400 text-sm mb-6">
                 デザインの一貫性を保つため、実装時には必ず各テーマの `docs/design_guide_*.md` を参照してください。
               </p>
               <div className="space-y-3">
                  <div className="text-xs font-mono bg-slate-800 p-2 rounded text-slate-300">
                     docs/design_guide_royal.md
                  </div>
                  <div className="text-xs font-mono bg-slate-800 p-2 rounded text-slate-300">
                     docs/design_guide_editorial.md
                  </div>
                  <div className="text-xs font-mono bg-slate-800 p-2 rounded text-slate-300">
                     docs/design_guide_nocturne.md
                  </div>
                  <div className="text-xs font-mono bg-slate-800 p-2 rounded text-slate-300">
                     docs/design_guide_studio.md
                  </div>
                  <div className="text-xs font-mono bg-slate-800 p-2 rounded text-slate-300">
                     docs/design_guide_stage.md
                  </div>
                  <div className="text-xs font-mono bg-slate-800 p-2 rounded text-slate-300">
                     docs/design_guide_nature.md
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalysisView;