import React, { useState } from 'react';
import { MarketplaceItem } from '../types/resume';
import { bookKaaroMarketplaceItems } from '../data/sampleData';
import {
  Sparkles,
  CheckCircle,
  ExternalLink,
  Tag,
  Layers,
  ShieldCheck,
  Eye,
  X,
} from 'lucide-react';

// Use exact generated asset paths with fallback policy
import packTechLeadImg from '../assets/images/pack_tech_lead_1790748548270.jpg';
import packExecutiveImg from '../assets/images/pack_executive_suite_1790748564803.jpg';
import heroDeskImg from '../assets/images/bookkaaro_hero_desk_1790748530055.jpg';

const imageMap: Record<string, string> = {
  '/src/assets/images/pack_tech_lead_1790748548270.jpg': packTechLeadImg,
  '/src/assets/images/pack_executive_suite_1790748564803.jpg': packExecutiveImg,
  '/src/assets/images/bookkaaro_hero_desk_1790748530055.jpg': heroDeskImg,
};

export const MarketplaceSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeItem, setActiveItem] = useState<MarketplaceItem | null>(null);

  const categories = ['All', 'Resume Templates', 'Executive Bundles', 'Interview Packs'];

  const filteredItems =
    selectedCategory === 'All'
      ? bookKaaroMarketplaceItems
      : bookKaaroMarketplaceItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Header & Context */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Book Kaaro Career Templates &amp; Interview Packs
        </h2>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Curated, typography-first career documents crafted for readability and ATS parsing.
          Below is our preview catalog. Placeholders are clearly labeled with zero fake pricing.
        </p>

        {/* Category Filter Tabs (Single-line controls) */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-md mx-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredItems.map((item) => {
          const resolvedImg = imageMap[item.imagePath] || item.imagePath;

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Image Showcase with Fallback */}
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={resolvedImg}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-102"
                    onError={(e) => {
                      // Fallback if image path fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-md">
                    {item.badge}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="text-xs text-slate-500 font-medium mb-1">
                    {item.category}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Features */}
                  <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                    {item.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between mt-4">
                <span className="text-xs font-mono text-slate-600 font-medium">
                  {item.priceNote}
                </span>

                <button
                  type="button"
                  onClick={() => setActiveItem(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Detail View */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in duration-150">
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              {activeItem.category}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{activeItem.title}</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              {activeItem.description}
            </p>

            <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
              <span className="font-semibold text-slate-900 block mb-1">Included Attributes:</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-700">
                {activeItem.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            <div className="mt-5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <span className="font-semibold">Marketplace Transparency Notice:</span> This item is currently
              provided as a reference layout in Book Kaaro Studio. When the full marketplace syncs, genuine pricing
              and creator credits will appear here. No hidden fees or fake subscriptions.
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
