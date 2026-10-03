import { NextResponse } from "next/server";

const liveDispatches = [
  {
    id: "dispatch-live-01",
    headline: "CERN Quantum Interconnect Demonstrates Stable Entanglement Across 1,200 KM",
    desk: "FUTURE",
    time: "JUST NOW",
    bureau: "GENEVA BUREAU",
    author: "By DR. A. K. SUBRAMANIAM",
    readTime: "4 MIN READ",
    date: "OCTOBER 1, 2026",
    deck: "Breakthrough in photonic crystal fiber links marks a historic milestone toward the global quantum internet.",
    leadParagraph: "Physicists at the European Organization for Nuclear Research (CERN) in Geneva announced today the successful transmission of quantum-entangled photon qubits across a 1,200-kilometer terrestrial fiber corridor with zero coherence decay.",
    bodyParagraphs: [
      "The experiment, conducted in coordination with quantum nodes in Zurich and Munich, proves that post-quantum entanglement distribution can survive real-world subterranean environmental vibration.",
      "The team employed room-temperature diamond defect repeaters, eliminating the need for continuous liquid helium cryostats along the transcontinental network line.",
      "Commercial telecommunications operators have expressed immediate interest in licensing the photonic synchronization repeaters for secure inter-bank liquidity settlement channels."
    ]
  },
  {
    id: "dispatch-live-02",
    headline: "Venture Consortium Raises $320M Autonomous Compiler Fund in Tokyo",
    desk: "STARTUPS",
    time: "2 MIN AGO",
    bureau: "TOKYO WIRE",
    author: "By VALERIE DU PONT",
    readTime: "3 MIN READ",
    date: "OCTOBER 1, 2026",
    deck: "Global sovereign funds back specialized ASIC design pipelines with automated formal verification.",
    leadParagraph: "A consortium of Japanese sovereign investment vehicles and Silicon Valley venture partners closed a landmark $320 million venture fund in Tokyo this morning, targeted exclusively at autonomous hardware compiler startups.",
    bodyParagraphs: [
      "Rather than taking months to tape out custom silicon, the funded architectures use generative reasoning swarms to produce provably correct gate-level transistor schematics in under 48 hours.",
      "Early test chips produced by the portfolio have demonstrated a 40% performance-per-watt advantage over manually routed industrial microcontrollers."
    ]
  },
  {
    id: "dispatch-live-03",
    headline: "W3C Committee Accelerates Local-First Synchronization Ratification",
    desk: "WEB",
    time: "4 MIN AGO",
    bureau: "SAN FRANCISCO",
    author: "By DEVON REID",
    readTime: "5 MIN READ",
    date: "OCTOBER 1, 2026",
    deck: "WebNN 2.0 and sub-millisecond local SQLite threads become the standard for zero-egress web applications.",
    leadParagraph: "The World Wide Web Consortium's standards working group approved accelerated RFC drafts for native browser conflict-free replicated data types (CRDTs) and high-speed local vector memory.",
    bodyParagraphs: [
      "The ratified standards allow client applications to persist gigabytes of encrypted state directly on consumer devices, synchronizing peer-to-peer over WebRTC meshes without relying on centralized cloud databases.",
      "Major browser vendors have committed to shipping production implementations across the standard engine channels before the close of the current quarter."
    ]
  }
];

export async function GET() {
  return NextResponse.json({
    status: "ok",
    hasNewDispatches: true,
    newCount: liveDispatches.length,
    dispatches: liveDispatches,
    timestamp: new Date().toISOString(),
  });
}
