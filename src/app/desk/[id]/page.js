"use client";

import { use, useState } from "react";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import NavigationStrip from "@/components/NavigationStrip";
import ArticleModal from "@/components/ArticleModal";
import NewspaperFooter from "@/components/NewspaperFooter";

// Scenes
import AiScene from "@/components/newspaper/AiScene";
import WebScene from "@/components/newspaper/WebScene";
import StartupScene from "@/components/newspaper/StartupScene";
import DesignScene from "@/components/newspaper/DesignScene";
import SecurityScene from "@/components/newspaper/SecurityScene";
import GamingScene from "@/components/newspaper/GamingScene";
import CultureScene from "@/components/newspaper/CultureScene";
import BusinessScene from "@/components/newspaper/BusinessScene";
import FutureScene from "@/components/newspaper/FutureScene";
import FrontPageScene from "@/components/newspaper/FrontPageScene";

import { navigationDesks, allArticles } from "@/data/newspaperData";
import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";

export default function DeskPage({ params }) {
  const resolvedParams = use(params);
  const deskId = resolvedParams?.id || "frontpage";
  const [selectedArticle, setSelectedArticle] = useState(null);

  const deskInfo = navigationDesks.find((d) => d.id === deskId) || {
    id: deskId,
    label: deskId.toUpperCase(),
    page: "01",
  };

  const deskArticles = allArticles.filter(
    (a) =>
      a.desk?.toLowerCase().includes(deskId.toLowerCase()) ||
      deskId.toLowerCase().includes(a.desk?.toLowerCase() || "")
  );

  return (
    <div className="min-h-screen paper-texture-bg bg-[#E8DFC8] text-[#201E19]">
      {/* Masthead */}
      <Masthead />

      {/* Navigation Strip */}
      <NavigationStrip activeDesk={deskId} />

      {/* Desk Breadcrumb & Route Banner */}
      <div className="w-full bg-[#DFD5BC] border-b border-[#766E5F] py-3">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between text-xs font-mono">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-[#9F3028] hover:underline uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO FULL FRONT PAGE BROADSHEET</span>
          </Link>

          <div className="flex items-center gap-3 font-mono text-[11px] text-[#39352D]">
            <span>EDITION: {deskInfo.label}</span>
            <span>•</span>
            <span className="font-bold text-[#201E19]">PAGE {deskInfo.page}</span>
          </div>
        </div>
      </div>

      {/* Main Desk Content */}
      <main className="min-h-[60vh]">
        {deskId === "ai" && <AiScene onOpenStory={setSelectedArticle} />}
        {deskId === "web" && <WebScene onOpenStory={setSelectedArticle} />}
        {deskId === "startups" && <StartupScene onOpenStory={setSelectedArticle} />}
        {deskId === "design" && <DesignScene onOpenStory={setSelectedArticle} />}
        {deskId === "security" && <SecurityScene onOpenStory={setSelectedArticle} />}
        {deskId === "gaming" && <GamingScene onOpenStory={setSelectedArticle} />}
        {deskId === "culture" && <CultureScene onOpenStory={setSelectedArticle} />}
        {deskId === "business" && <BusinessScene onOpenStory={setSelectedArticle} />}
        {deskId === "future" && <FutureScene onOpenStory={setSelectedArticle} />}
        {deskId === "frontpage" && (
          <FrontPageScene
            onOpenStory={setSelectedArticle}
            onSaveClipping={() => {}}
            isSaved={() => false}
          />
        )}
      </main>

      {/* Related Desk Dispatches */}
      {deskArticles.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 border-t-2 border-[#766E5F]">
          <div className="border-b border-[#766E5F] pb-2 mb-6 flex items-center justify-between font-mono text-xs text-[#201E19]">
            <span className="font-bold tracking-widest uppercase">
              ARCHIVED DISPATCHES FROM {deskInfo.label}
            </span>
            <span>INDEXED: {deskArticles.length} ARTICLES</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deskArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="p-4 border border-[#766E5F] bg-[#DFD5BC]/50 hover:bg-[#DFD5BC] cursor-pointer transition-colors"
              >
                <div className="text-[10px] font-mono text-[#9F3028] uppercase font-bold mb-1">
                  {article.page || "PAGE 01"} • {article.readTime || "5 MIN READ"}
                </div>
                <h4 className="font-serif font-bold text-lg text-[#201E19] hover:text-[#9F3028] leading-snug mb-2">
                  {article.headline}
                </h4>
                <p className="font-serif text-xs text-[#39352D] line-clamp-3">
                  {article.deck}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Newspaper Footer */}
      <NewspaperFooter onSelectDesk={() => {}} />

      {/* Article Reader Modal */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onSaveClipping={() => {}}
        isSaved={() => false}
      />
    </div>
  );
}
