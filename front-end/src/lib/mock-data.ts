export type Collection = {
  id: string;
  name: string;
  fileCount: number;
  updatedAt: string;
};

export type CollectionFile = {
  id: string;
  name: string;
  size: string;
  pages: number;
  uploadedAt: string;
};

export const COLLECTIONS: Collection[] = [
  {
    id: "research",
    name: "Research",
    fileCount: 4,
    updatedAt: "2026-04-24",
  },
  {
    id: "work",
    name: "Work",
    fileCount: 7,
    updatedAt: "2026-04-22",
  },
  {
    id: "personal",
    name: "Personal",
    fileCount: 2,
    updatedAt: "2026-04-18",
  },
  {
    id: "books",
    name: "Books",
    fileCount: 11,
    updatedAt: "2026-04-10",
  },
];

export const FILES_BY_COLLECTION: Record<string, CollectionFile[]> = {
  research: [
    { id: "1", name: "Attention Is All You Need.pdf", size: "1.2 MB", pages: 15, uploadedAt: "2026-04-24" },
    { id: "2", name: "RAG Survey 2024.pdf", size: "3.4 MB", pages: 42, uploadedAt: "2026-04-23" },
    { id: "3", name: "LLM Evaluation Methods.pdf", size: "2.1 MB", pages: 28, uploadedAt: "2026-04-20" },
    { id: "4", name: "Vector Databases Overview.pdf", size: "0.9 MB", pages: 11, uploadedAt: "2026-04-18" },
  ],
  work: [
    { id: "5", name: "Q1 Strategy.pdf", size: "0.4 MB", pages: 6, uploadedAt: "2026-04-22" },
    { id: "6", name: "Product Roadmap 2026.pdf", size: "1.1 MB", pages: 18, uploadedAt: "2026-04-21" },
    { id: "7", name: "Team OKRs.pdf", size: "0.2 MB", pages: 4, uploadedAt: "2026-04-20" },
    { id: "8", name: "Architecture Decision Records.pdf", size: "0.7 MB", pages: 9, uploadedAt: "2026-04-19" },
    { id: "9", name: "Incident Report Apr 12.pdf", size: "0.3 MB", pages: 5, uploadedAt: "2026-04-14" },
    { id: "10", name: "Budget Forecast.pdf", size: "0.5 MB", pages: 7, uploadedAt: "2026-04-12" },
    { id: "11", name: "Hiring Plan.pdf", size: "0.4 MB", pages: 6, uploadedAt: "2026-04-10" },
  ],
  personal: [
    { id: "12", name: "Tax Return 2025.pdf", size: "0.6 MB", pages: 8, uploadedAt: "2026-04-18" },
    { id: "13", name: "Health Records.pdf", size: "1.4 MB", pages: 22, uploadedAt: "2026-04-10" },
  ],
  books: [
    { id: "14", name: "Thinking Fast and Slow.pdf", size: "4.2 MB", pages: 499, uploadedAt: "2026-04-10" },
    { id: "15", name: "The Pragmatic Programmer.pdf", size: "3.8 MB", pages: 352, uploadedAt: "2026-04-09" },
    { id: "16", name: "Deep Work.pdf", size: "2.1 MB", pages: 296, uploadedAt: "2026-04-08" },
    { id: "17", name: "Atomic Habits.pdf", size: "1.9 MB", pages: 320, uploadedAt: "2026-04-07" },
    { id: "18", name: "Zero to One.pdf", size: "1.2 MB", pages: 224, uploadedAt: "2026-04-06" },
    { id: "19", name: "The Design of Everyday Things.pdf", size: "2.8 MB", pages: 368, uploadedAt: "2026-04-05" },
    { id: "20", name: "Sapiens.pdf", size: "3.1 MB", pages: 443, uploadedAt: "2026-04-04" },
    { id: "21", name: "Dune.pdf", size: "2.5 MB", pages: 412, uploadedAt: "2026-04-03" },
    { id: "22", name: "1984.pdf", size: "1.1 MB", pages: 328, uploadedAt: "2026-04-02" },
    { id: "23", name: "Meditations.pdf", size: "0.8 MB", pages: 254, uploadedAt: "2026-04-01" },
    { id: "24", name: "The Art of War.pdf", size: "0.4 MB", pages: 112, uploadedAt: "2026-03-30" },
  ],
};
