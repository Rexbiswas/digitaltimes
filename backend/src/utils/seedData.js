const mongoose = require("mongoose");
const Article = require("../models/Article");
const Edition = require("../models/Edition");
const Source = require("../models/Source");
const Notification = require("../models/Notification");
const { generateContentHash } = require("../services/deduplication/deduplicator");

const INITIAL_BROADSHEET_ARTICLES = [
  {
    title: "THE INTERNET IS ENTERING A NEW ERA",
    headline: "THE INTERNET IS ENTERING A NEW ERA",
    slug: "lead-new-era",
    deck: "AI agents and neural compilation pipelines are radically changing the way software is conceived, deployed, and experienced. The static page gives way to sovereign cognitive machines.",
    description: "AI agents and neural compilation pipelines are radically changing the way software is conceived, deployed, and experienced.",
    leadParagraph: "FOR DECADES, the architecture of the World Wide Web was defined by a quiet, dependable treaty: a browser requested an address, a remote server fetched files from disk, and a display rendered hyperlinked text across rectangular glass screens. That half-century paradigm has reached its twilight. Across research laboratories and developer networks worldwide, the browser is transforming from a passive document viewer into an active cognitive interlocutor.",
    bodyParagraphs: [
      "The catalyst is not merely the speed of language models, but the systemic arrival of autonomous agentic meshes. Rather than navigating rigid menus and filling out input forms, modern software now negotiates directly with peer models, querying distributed vector memories, synthesizing custom binaries in memory, and assembling interfaces on-demand in milliseconds.",
      "Engineers at major infrastructure providers describe this transformation as the end of the deterministic client-server boundary. Where webmasters once spent sleepless nights optimizing database queries and CSS layout rules, autonomous compilation engines now calibrate entire user experiences in real-time according to cognitive intent.",
      "This brings both astonishing velocity and profound philosophical quandaries. What becomes of search engines when autonomous agents crawl, absorb, and synthesize facts without human intervention? What is the role of the creator when software can author, debug, and publish its own evolutions without pause?",
      "Yet, despite this rush toward automated hyper-efficiency, human engineers report an unexpected resurgence of craftsmanship. The artisanal spirit of early computing—the hand-carved algorithms, the poetic appreciation for structural elegance—has not evaporated; rather, it has ascended to the level of intent, directing vast cognitive swarms toward problems once deemed intractable."
    ],
    pullQuote: "“Software is no longer a collection of static instructions executed deterministically; it has evolved into conversational, self-healing ecologies operating at the speed of thought.”",
    author: "By ALISTAIR VANCE & DR. ELENA ROSTOVA",
    location: "SAN FRANCISCO BUREAU",
    desk: "technology",
    category: "technology",
    tags: ["ai", "agents", "software", "infrastructure"],
    page: "PAGE 01",
    readTime: "7 MIN READ",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
    urlToImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "THE PHYSICAL ARCHIVE MEETS COGNITIVE REASONING: A humanoid research unit examines historic broadsheet records in the Zurich Digital Vault.",
    imageCredit: "Photograph by E. Rostova / The Digital Times",
    featured: true,
    breaking: true,
    trending: true,
    views: 1240,
  },
  {
    title: "THE AGE OF INTELLIGENT MACHINES",
    headline: "THE AGE OF INTELLIGENT MACHINES",
    slug: "ai-frontier-reasoning",
    deck: "Reasoning models transcend synthetic benchmarks to conduct peer-reviewed mathematical proofs and autonomous hardware layout verification.",
    description: "Reasoning models transcend synthetic benchmarks to conduct peer-reviewed mathematical proofs.",
    leadParagraph: "At the International Conference on Computational Logic in Geneva yesterday, researchers demonstrated an autonomous model that resolved a fifty-year-old conjecture in combinatorial topology. Rather than generating text probabilistically, the architecture executed three million internal simulations before outputting a verifiable, step-by-step formal proof in Lean 4.",
    bodyParagraphs: [
      "Rather than generating text probabilistically, the architecture executed three million internal simulations before outputting a verifiable, step-by-step formal proof in Lean 4.",
      "Model-on-model red teaming proves 40x more effective at catching subtle logic hallucinations than human annotator farms.",
      "Optical light guides replace copper traces between GPU clusters, slashing inter-chip communication latency by 85%."
    ],
    pullQuote: "“We are witnessing the transition from statistical pattern matching to deliberate, introspective algorithmic thought.”",
    author: "By DR. AMARA CHEN & JONAS LINDQVIST",
    location: "GENEVA BUREAU",
    desk: "ai",
    category: "ai",
    tags: ["reasoning", "benchmarks", "lean4", "topology"],
    page: "PAGE 02",
    readTime: "6 MIN READ",
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80",
    urlToImage: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    trending: true,
    views: 890,
  },
  {
    title: "WHY THE WEB IS BECOMING MORE INTELLIGENT",
    headline: "WHY THE WEB IS BECOMING MORE INTELLIGENT",
    slug: "web-compiler-dialectic",
    deck: "From heavyweight JavaScript bundles to lightweight WebAssembly runtimes and local-first reactive sync engines: the browser's technical architecture reimagined.",
    description: "From heavyweight JavaScript bundles to lightweight WebAssembly runtimes and local-first reactive sync engines.",
    leadParagraph: "For two decades, modern web applications grew heavier with each passing season. Megabytes of JavaScript framework bundles, thousands of indirect npm dependencies, and sluggish client-side hydration chains became the reluctant industry standard. In 2026, an insurgent counter-movement has emerged.",
    bodyParagraphs: [
      "The ratified standards allow client applications to persist gigabytes of encrypted state directly on consumer devices, synchronizing peer-to-peer over WebRTC meshes without relying on centralized cloud databases.",
      "Major browser vendors have committed to shipping production implementations across the standard engine channels before the close of the current quarter."
    ],
    author: "By DEVON REID",
    location: "SAN FRANCISCO",
    desk: "web",
    category: "web",
    tags: ["webassembly", "wasm", "javascript", "browser", "crdt"],
    page: "PAGE 03",
    readTime: "5 MIN READ",
    image: null,
    views: 650,
  },
  {
    title: "THE NEXT GENERATION OF DIGITAL COMPANIES",
    headline: "THE NEXT GENERATION OF DIGITAL COMPANIES",
    slug: "startup-capital-shift",
    deck: "Venture firms pour record capital into solo-founder autonomous infrastructure. The $100M seed round becomes standard for frontier compute clusters.",
    description: "Venture firms pour record capital into solo-founder autonomous infrastructure.",
    leadParagraph: "A consortium of Japanese sovereign investment vehicles and Silicon Valley venture partners closed a landmark $320 million venture fund in Tokyo this morning, targeted exclusively at autonomous hardware compiler startups.",
    bodyParagraphs: [
      "Rather than taking months to tape out custom silicon, the funded architectures use generative reasoning swarms to produce provably correct gate-level transistor schematics in under 48 hours.",
      "Early test chips produced by the portfolio have demonstrated a 40% performance-per-watt advantage over manually routed industrial microcontrollers."
    ],
    author: "By VALERIE DU PONT",
    location: "TOKYO WIRE",
    desk: "startups",
    category: "startups",
    tags: ["venture", "seed", "startups", "compilers"],
    page: "PAGE 04",
    readTime: "5 MIN READ",
    views: 430,
  },
  {
    title: "THE REDESIGN OF THE HUMAN INTERFACE",
    headline: "THE REDESIGN OF THE HUMAN INTERFACE",
    slug: "design-semantic-landscapes",
    deck: "From skeuomorphism and flat cards to generative, semantic latent landscapes: how computational aesthetics are returning to artisanal print craft.",
    description: "From skeuomorphism and flat cards to generative, semantic latent landscapes.",
    leadParagraph: "Graphic designers across the digital capitals are abandoning the ubiquitous generic gray dashboard. Inspired by hundred-year-old Swiss broadsheets, constructivist posters, and Japanese editorial journals, modern interfaces are reviving tactile typography, asymmetric column balance, and authentic paper materiality.",
    bodyParagraphs: [
      "Tactile textures, asymmetric ink rules, and bespoke editorial drop caps are establishing a new digital benchmark for discerning readers who crave thoughtful visual pacing.",
      "Headlines dictate layout geometry, rather than fitting into predetermined card containers."
    ],
    pullQuote: "“In the post-app era, typography does not merely present content; typography becomes the environment itself.”",
    author: "By ELEANOR STERLING",
    location: "LONDON BUREAU",
    desk: "design",
    category: "design",
    tags: ["design", "typography", "swiss style", "broadsheet"],
    page: "PAGE 05",
    readTime: "5 MIN READ",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    urlToImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    views: 710,
  },
  {
    title: "NEW SECURITY DISCOVERY AFFECTS MILLIONS OF USERS",
    headline: "NEW SECURITY DISCOVERY AFFECTS MILLIONS OF USERS",
    slug: "sec-post-quantum",
    deck: "Cryptographic vulnerability uncovered in 256-bit elliptic curves triggers emergency migration to post-quantum lattice primitives.",
    description: "Cryptographic vulnerability uncovered in 256-bit elliptic curves triggers emergency migration.",
    leadParagraph: "In the early morning hours of Tuesday, cryptographic researchers in Geneva published definitive proof that a specialized 4,000-qubit simulator can deconstruct legacy RSA and standard elliptic curve keys in under eighteen minutes. Within hours, central banks and cloud infrastructures initiated the largest cryptographic migration in human history.",
    bodyParagraphs: [
      "The directive affects billions of secure sockets layer sessions, payment processing gateways, and sovereign passport verification endpoints.",
      "System administrators reported intense weekend patching cycles, with automated migration pipelines absorbing the brunt of the protocol upgrades."
    ],
    author: "By INVESTIGATIVE TEAM",
    location: "ZURICH VAULT",
    desk: "security",
    category: "security",
    tags: ["cryptography", "post-quantum", "security", "zero-day"],
    page: "PAGE 06",
    readTime: "7 MIN READ",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    urlToImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    breaking: true,
    views: 990,
  },
  {
    title: "THE NEXT GENERATION OF GAMING HAS ARRIVED",
    headline: "THE NEXT GENERATION OF GAMING HAS ARRIVED",
    slug: "game-neural-worlds",
    deck: "Polygon meshes and hand-baked textures yield to real-time neural radiance fields. Complete virtual worlds generated continuously at 120 frames per second.",
    description: "Polygon meshes and hand-baked textures yield to real-time neural radiance fields.",
    leadParagraph: "The boundary between cinematic film and interactive gameplay has officially dissolved with the release of the first fully neural-rendered simulation engine.",
    bodyParagraphs: [
      "Lighting calculations that once required server farms now compute instantaneously through lightweight tensor cores, creating photorealistic virtual ecosystems with infinite depth.",
      "Playing through this title is like standing inside an oil painting that breathes. Non-player characters recall interactions from three weeks ago, holding debates that have never been written into any script."
    ],
    author: "By TOBIAS WEBER",
    location: "BERLIN BUREAU",
    desk: "gaming",
    category: "gaming",
    tags: ["gaming", "neural fields", "simulation", "nerf"],
    page: "PAGE 07",
    readTime: "4 MIN READ",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80",
    urlToImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80",
    views: 520,
  },
  {
    title: "THE ARCHAEOLOGY OF THE HYPERLINK",
    headline: "THE ARCHAEOLOGY OF THE HYPERLINK",
    slug: "culture-hyperlink",
    deck: "How the open web's chaotic spirit survives inside sovereign digital enclaves, underground zines, and small-web hand-coded sanctuaries.",
    description: "How the open web's chaotic spirit survives inside sovereign digital enclaves.",
    leadParagraph: "Amidst the seamless, perfectly polished corporate web, a passionate subterranean movement of artists, essayists, and tinkerers is resurrecting raw HTML, quirky CSS keyframes, and personal journals hosted on solar-powered home servers.",
    bodyParagraphs: [
      "In an era of frictionless AI homogenization, the idiosyncratic, hand-coded personal website has become the ultimate act of intellectual defiance.",
      "These hand-carved digital artifacts serve as reminders that the web was founded as an ecosystem of human voices, not algorithmic advertising feeds."
    ],
    pullQuote: "“In an era of frictionless AI homogenization, the idiosyncratic, hand-coded personal website has become the ultimate act of intellectual defiance.”",
    author: "By SOPHIA VARGAS",
    location: "NEW YORK WIRE",
    desk: "culture",
    category: "culture",
    tags: ["hyperlink", "small web", "culture", "html"],
    page: "PAGE 08",
    readTime: "5 MIN READ",
    views: 480,
  },
  {
    title: "THE COMPUTE COMMODITY STANDARD",
    headline: "THE COMPUTE COMMODITY STANDARD",
    slug: "business-global-compute",
    deck: "Global financial markets formalize Kilowatt-Token futures contracts as computational capacity replaces oil and gold as the sovereign reserve asset.",
    description: "Global financial markets formalize Kilowatt-Token futures contracts as computational capacity replaces oil and gold.",
    leadParagraph: "When historians look back at the economic reconfiguration of 2026, the pivotal moment will not be an interest rate cut or a sovereign debt auction, but the morning the Chicago Mercantile Exchange launched the world's first physically settled Compute-Megawatt-Hour contract.",
    bodyParagraphs: [
      "Sovereign wealth funds and multinational treasury departments are rebalancing reserves away from fiat instruments into tokenized compute capacity leases backed by subterranean nuclear and geothermal installations.",
      "The shift marks the formal arrival of an energy-backed computational currency layer across international commerce."
    ],
    author: "By RUPERT ASHFORD",
    location: "CHICAGO / LONDON",
    desk: "business",
    category: "business",
    tags: ["markets", "compute", "energy", "nasdaq"],
    page: "PAGE 09",
    readTime: "6 MIN READ",
    views: 590,
  },
  {
    title: "QUANTUM REVERBERATION & SYNTHETIC BIOLOGY",
    headline: "QUANTUM REVERBERATION & SYNTHETIC BIOLOGY",
    slug: "future-quantum-bio",
    deck: "Silicon meets carbon: optical biocomputing passes laboratory thresholds as synthetic DNA storage stores humanity's collective archives.",
    description: "Silicon meets carbon: optical biocomputing passes laboratory thresholds.",
    leadParagraph: "Deep within subterranean laboratories in Oxford and Kyoto, the boundary between biological chemistry and crystalline electronics has blurred. Synthetic DNA molecules are now synthesized to hold exabytes of historical data at room temperature for ten thousand years without electrical power.",
    bodyParagraphs: [
      "The experiment, conducted in coordination with quantum nodes in Zurich and Munich, proves that post-quantum entanglement distribution can survive real-world subterranean environmental vibration.",
      "Commercial telecommunications operators have expressed immediate interest in licensing the photonic synchronization repeaters for secure inter-bank liquidity settlement channels."
    ],
    author: "By DR. A. K. SUBRAMANIAM",
    location: "OXFORD LAB",
    desk: "future",
    category: "future",
    tags: ["quantum", "dna storage", "biology", "cern"],
    page: "PAGE 10",
    readTime: "8 MIN READ",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80",
    urlToImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80",
    views: 820,
  },
  {
    title: "The Demise of the Traditional Sitemap",
    headline: "The Demise of the Traditional Sitemap",
    slug: "fp-crawlers",
    deck: "Autonomous crawlers bypass URL structures in favor of live neural vector streams, reshaping 30 years of web indexing.",
    description: "Autonomous crawlers bypass URL structures in favor of live neural vector streams.",
    leadParagraph: "Search crawlers of the prior decade relied on sitemaps and anchor tags. Today's cognitive crawlers parse raw state graphs directly, synthesizing contextual maps that update continuously as content shifts.",
    bodyParagraphs: [
      "Search crawlers of the prior decade relied on sitemaps and anchor tags. Today's cognitive crawlers parse raw state graphs directly."
    ],
    author: "By MARCUS STERLING",
    location: "SAN FRANCISCO",
    desk: "frontpage",
    category: "web",
    page: "PAGE 01",
    readTime: "4 MIN READ",
    views: 310,
  },
  {
    title: "Edge Silicon Now Executes 70B Models Locally",
    headline: "Edge Silicon Now Executes 70B Models Locally",
    slug: "fp-edge-chips",
    deck: "Breakthrough in 2-nanometer wafer stacking allows zero-latency local inference on consumer hardware with zero cloud egress.",
    description: "Breakthrough in 2-nanometer wafer stacking allows zero-latency local inference.",
    leadParagraph: "Thermal thresholds once thought insurmountable have yielded to 3D diamond-substrate heat dissipation, bringing enterprise-grade reasoning engines onto desktop workstations.",
    bodyParagraphs: [
      "Thermal thresholds once thought insurmountable have yielded to 3D diamond-substrate heat dissipation."
    ],
    author: "By DR. KENJI SATO",
    location: "TOKYO",
    desk: "frontpage",
    category: "technology",
    page: "PAGE 01",
    readTime: "5 MIN READ",
    views: 450,
  },
  {
    title: "The Return of Sovereign Local-First Software",
    headline: "The Return of Sovereign Local-First Software",
    slug: "fp-sovereign-data",
    deck: "Developers rebel against centralized cloud silos by returning to CRDTs, SQLite in the browser, and peer-to-peer sync.",
    description: "Developers rebel against centralized cloud silos by returning to CRDTs, SQLite in the browser, and peer-to-peer sync.",
    leadParagraph: "The pendulum of history swings back. After fifteen years of cloud dominance, engineering teams are voting with their git repositories for local-first software where user data never leaves the premises.",
    bodyParagraphs: [
      "After fifteen years of cloud dominance, engineering teams are voting with their git repositories for local-first software where user data never leaves the premises."
    ],
    author: "By CLARA BEAUCHAMP",
    location: "PARIS WIRE",
    desk: "frontpage",
    category: "security",
    page: "PAGE 01",
    readTime: "3 MIN READ",
    views: 520,
  }
];

const seedInitialData = async () => {
  try {
    const existingCount = await Article.countDocuments();
    if (existingCount > 0) {
      console.log(`[Seed] Database already contains ${existingCount} articles. Verifying editions...`);
    } else {
      console.log("[Seed] Seeding initial broadsheet editorial articles...");

      const todayStr = new Date().toISOString().split("T")[0];

      for (const item of INITIAL_BROADSHEET_ARTICLES) {
        item.editionDate = todayStr;
        item.contentHash = generateContentHash(item);
        await Article.create(item);
      }

      console.log(`[Seed] Seeded ${INITIAL_BROADSHEET_ARTICLES.length} broadsheet articles.`);
    }

    // Ensure default sources are registered
    const sourceCount = await Source.countDocuments();
    if (sourceCount === 0) {
      await Source.create([
        {
          name: "Ars Technica",
          url: "https://feeds.arstechnica.com/arstechnica/index",
          type: "RSS",
          defaultDesk: "technology",
        },
        {
          name: "The Verge",
          url: "https://www.theverge.com/rss/technology/index.xml",
          type: "RSS",
          defaultDesk: "web",
        },
        {
          name: "MIT Technology Review",
          url: "https://www.technologyreview.com/feed/",
          type: "RSS",
          defaultDesk: "future",
        },
      ]);
      console.log("[Seed] Registered default news sources.");
    }

    // Ensure Editions exist for today and past 4 days (for calendar testing)
    const datesToSeed = [
      "2026-10-07",
      "2026-10-06",
      "2026-10-05",
      "2026-10-04",
      "2026-10-03",
    ];

    const allArticles = await Article.find({ status: "published" });
    const leadArt = allArticles.find((a) => a.featured) || allArticles[0];

    for (let i = 0; i < datesToSeed.length; i++) {
      const dateStr = datesToSeed[i];
      const existingEd = await Edition.findOne({ date: dateStr });
      if (!existingEd) {
        const d = new Date(dateStr);
        const displayDate = d.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }).toUpperCase();

        const deskMap = {
          frontpage: allArticles.filter((a) => a.desk === "frontpage").map((a) => a._id),
          ai: allArticles.filter((a) => a.desk === "ai").map((a) => a._id),
          web: allArticles.filter((a) => a.desk === "web").map((a) => a._id),
          startups: allArticles.filter((a) => a.desk === "startups").map((a) => a._id),
          design: allArticles.filter((a) => a.desk === "design").map((a) => a._id),
          security: allArticles.filter((a) => a.desk === "security").map((a) => a._id),
          technology: allArticles.filter((a) => a.desk === "technology").map((a) => a._id),
          gaming: allArticles.filter((a) => a.desk === "gaming").map((a) => a._id),
          culture: allArticles.filter((a) => a.desk === "culture").map((a) => a._id),
          business: allArticles.filter((a) => a.desk === "business").map((a) => a._id),
          future: allArticles.filter((a) => a.desk === "future").map((a) => a._id),
        };

        await Edition.create({
          date: dateStr,
          displayDate,
          status: i === 0 ? "live" : "archived",
          leadArticle: leadArt ? leadArt._id : null,
          articles: allArticles.map((a) => a._id),
          desks: deskMap,
        });
      }
    }

    console.log("[Seed] Editions verified and initialized.");

    // Ensure default editorial notifications exist
    const notifCount = await Notification.countDocuments();
    if (notifCount === 0) {
      const sampleLead = allArticles[0];
      await Notification.create([
        {
          title: "Autonomous reasoning model passes formal logic theorem proof",
          message: "Frontier mathematical verification model resolves fifty-year combinatorial conjecture in Lean 4.",
          type: "breaking",
          desk: "AI",
          time: "2 MIN AGO",
          articleId: sampleLead ? sampleLead._id : null,
          read: false,
        },
        {
          title: "Market Alert: Global compute futures index advances +3.4%",
          message: "Consortium expands dedicated photonics interconnect corridors across European financial hubs.",
          type: "breaking",
          desk: "BUSINESS",
          time: "18 MIN AGO",
          articleId: allArticles[1] ? allArticles[1]._id : null,
          read: false,
        },
        {
          title: "Dispatch: New browser local inference specification ratified by W3C",
          message: "Sub-millisecond local SQLite threads become the standard for zero-egress consumer web applications.",
          type: "desk",
          desk: "WEB",
          time: "45 MIN AGO",
          articleId: allArticles[2] ? allArticles[2]._id : null,
          read: false,
        },
        {
          title: "Morning Edition № 001 Broadside Distributed",
          message: "The full broadsheet edition is printed and ready for reading in your archival portfolio.",
          type: "edition",
          desk: "EDITION",
          time: "1 HOUR AGO",
          read: true,
        },
      ]);
      console.log("[Seed] Registered default newsroom notifications.");
    }
  } catch (err) {
    console.error(`[Seed] Error seeding initial data: ${err.message}`);
  }
};

module.exports = {
  seedInitialData,
};
