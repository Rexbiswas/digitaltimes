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
    <div className="min-h-screen paper-texture-bg bg-[#F2EEE5] text-[#111111]">
      {/* Masthead */}
      <Masthead />

      {/* Navigation Strip */}
      <NavigationStrip activeDesk={deskId} />

      {/* Desk Breadcrumb & Route Banner */}
      <div className="w-full bg-[#ECE6D8] border-b border-[#1A1A1A] py-3">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between text-xs font-mono">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-[#A71919] hover:underline uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO FULL FRONT PAGE BROADSHEET</span>
          </Link>

          <div className="flex items-center gap-3 font-mono text-[11px] text-[#555555]">
            <span>EDITION: {deskInfo.label}</span>
            <span>•</span>
            <span className="font-bold text-[#111111]">PAGE {deskInfo.page}</span>
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
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 border-t-2 border-[#1A1A1A]">
          <div className="border-b border-[#1A1A1A] pb-2 mb-6 flex items-center justify-between font-mono text-xs text-[#111111]">
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
                className="p-4 border border-[#1A1A1A] bg-[#ECE6D8]/50 hover:bg-[#ECE6D8] cursor-pointer transition-colors"
              >
                <div className="text-[10px] font-mono text-[#A71919] uppercase font-bold mb-1">
                  {article.page || "PAGE 01"} • {article.readTime || "5 MIN READ"}
                </div>
                <h4 className="font-serif font-bold text-lg text-[#111111] hover:text-[#A71919] leading-snug mb-2">
                  {article.headline}
                </h4>
                <p className="font-serif text-xs text-[#444444] line-clamp-3">
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
