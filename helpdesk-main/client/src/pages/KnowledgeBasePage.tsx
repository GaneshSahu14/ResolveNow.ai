import { useState, useMemo } from "react";
import { PageTransition } from "../components/PageTransition";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 350, damping: 25 } }
};

const categoryMeta: Record<string, { icon: string; description: string }> = {
  "getting-started": {
    icon: "rocket_launch",
    description: "Get up and running with the ResolveNow workspace and setup your profile."
  },
  "authentication": {
    icon: "vpn_key",
    description: "Configure Single Sign-On (SSO), MFA, passwords, and user access tokens."
  },
  "user-management": {
    icon: "manage_accounts",
    description: "Manage team roles, custom permissions, shift hours, and availability."
  },
  "ticket-management": {
    icon: "confirmation_number",
    description: "Organize ticket statuses, bulk updates, assignment rules, and SLA policies."
  },
  "ai-copilot": {
    icon: "psychology",
    description: "Configure smart replies, auto-resolution, tone, and training data."
  },
  "integrations": {
    icon: "extension",
    description: "Connect ResolveNow with Jira, Slack, Salesforce, and custom endpoints."
  },
  "email-webhooks": {
    icon: "webhook",
    description: "Configure outbound SMTP, webhook signatures, endpoints, and retry policies."
  },
  "security-compliance": {
    icon: "gpp_good",
    description: "Manage SOC 2 standards, GDPR, Whitelisting, encryption, and audit logs."
  },
  "analytics-reports": {
    icon: "bar_chart",
    description: "Analyze CSAT reports, response times, SLA metrics, and AI resolution rates."
  },
  "troubleshooting": {
    icon: "build",
    description: "Resolve common errors, debugging ticket routing, and log analysis."
  },
  "apis-sdks": {
    icon: "developer_mode",
    description: "Explore libraries for Python, Node.js, Go, and React Native SDKs."
  },
  "billing-plans": {
    icon: "payments",
    description: "Manage billing details, invoices, plan changes, and seat updates."
  }
};

interface CategoryCardProps {
  id: string;
  name: string;
  icon: string;
  description: string;
  onClick: () => void;
}

function CategoryCard({ name, icon, description, onClick }: CategoryCardProps) {
  return (
    <motion.button
      variants={itemVariants}
      whileHover={{ y: -6, scale: 1.02, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.3)" }}
      onClick={onClick}
      className="flex flex-col items-start text-left p-8 bg-surface-container border border-outline-variant/15 rounded-2xl cursor-pointer hover:border-primary transition-all group min-h-[240px] w-full"
    >
      <div className="p-3 bg-primary/10 text-primary rounded-xl mb-6 group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
        <span className="material-symbols-outlined text-[24px] block">{icon}</span>
      </div>
      <h3 className="text-[20px] font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">{name}</h3>
      <p className="text-[14px] text-on-surface-variant/80 leading-relaxed mb-6 flex-grow">{description}</p>
      <div className="flex items-center gap-1.5 text-[12px] font-bold text-primary tracking-wider uppercase mt-auto">
        Explore
        <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </div>
    </motion.button>
  );
}

interface Article {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  content: string;
  pinned?: boolean;
  views: number;
  readTime: string;
  date: string;
}

const mapArticle = (dbArt: any): Article => {
  let title = dbArt.title;
  let content = dbArt.content;
  
  if (title === "Refund Request Policy & Steps") {
    title = "How to Request a Refund";
    content = `### How to Request a Refund
This article provides detailed guidelines and step-by-step instructions regarding **Refund Guarantee Policy** within the ResolveNow AI Helpdesk system.
Ensure your transaction is verified.
> [!NOTE]
> All changes applied are synced immediately.`;
  } else if (title === "Troubleshooting CORS Whitelist Block Errors") {
    title = "CORS and Authentication Troubleshooting";
  }

  const excerpt = content.split("\n\n")[0]?.replace(/[#*`]/g, "").slice(0, 150) + "...";
  const wordCount = content.split(/\s+/).length;
  const readTimeVal = Math.max(1, Math.ceil(wordCount / 200));
  const readTime = `${readTimeVal} min read`;
  const date = new Date(dbArt.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return {
    id: dbArt.id,
    category: dbArt.category,
    title,
    excerpt,
    content,
    pinned: dbArt.pinned,
    views: dbArt.views || 0,
    readTime,
    date,
  };
};

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<{ articles: any[] }>({
    queryKey: ["/api/knowledge-base"],
    queryFn: async () => {
      const res = await axios.get("/api/knowledge-base");
      return res.data;
    },
  });

  const articles = useMemo(() => {
    if (!data?.articles) return [];
    return data.articles.map(mapArticle);
  }, [data]);

  const categories = useMemo(() => {
    const nameMap: Record<string, string> = {
      "getting-started": "Getting Started",
      "authentication": "Authentication",
      "user-management": "User Management",
      "ticket-management": "Ticket Management",
      "ai-copilot": "AI Copilot",
      "integrations": "Integrations",
      "email-webhooks": "Email & Webhooks",
      "security-compliance": "Security & Compliance",
      "analytics-reports": "Analytics & Reports",
      "troubleshooting": "Troubleshooting",
      "apis-sdks": "APIs & SDKs",
      "billing-plans": "Billing & Plans"
    };
    
    const uniqueIds = Array.from(new Set(articles.map(a => a.category)));
    return uniqueIds.map(id => ({
      id,
      name: nameMap[id] || id.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    }));
  }, [articles]);

  const filteredArticles = useMemo(() => {
    let result = articles;
    if (activeCategory !== "all") {
      result = result.filter(a => a.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.content.toLowerCase().includes(q) || 
        a.excerpt.toLowerCase().includes(q)
      );
    }
    return result;
  }, [articles, activeCategory, searchQuery]);

  const selectedArticle = useMemo(() => {
    return articles.find(a => a.id === selectedArticleId);
  }, [articles, selectedArticleId]);

  if (isLoading) {
    return (
      <PageTransition className="flex-1 overflow-y-auto w-full scrollbar-hide">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-8 md:py-12 pb-32 animate-pulse space-y-8">
          <div className="h-12 w-1/3 bg-border/40 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-40 bg-border/40 rounded-xl" />
            <div className="h-40 col-span-2 bg-border/40 rounded-xl" />
            <div className="h-40 bg-border/40 rounded-xl" />
          </div>
          <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-border/40 rounded-xl" />
            <div className="h-20 bg-border/40 rounded-xl" />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition className="flex-1 overflow-y-auto w-full scrollbar-hide">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-8 md:py-12 pb-32 text-center">
          <p className="text-error font-bold">Failed to load Knowledge Base articles.</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="flex-1 overflow-y-auto w-full scrollbar-hide">
      <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-8 md:py-12 pb-32">
        <AnimatePresence mode="wait">
          {!selectedArticleId ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-12"
            >
              <header className="space-y-4">
                <h1 className="text-[44px] font-display-lg text-on-surface">Knowledge Base</h1>
                <div className="relative max-w-2xl">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant">search</span>
                  <input 
                    type="text" 
                    placeholder="Search documentation... (e.g. refund)"
                    className="w-full h-12 pl-10 pr-4 bg-surface-container-lowest rounded-xl border border-outline-variant focus:border-primary outline-none text-on-surface transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </header>

              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {[{ id: "all", name: "All Articles" }, ...categories].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`relative px-6 py-2 rounded-full whitespace-nowrap transition-all border outline-none ${
                      activeCategory === cat.id
                        ? "text-on-primary border-primary/10"
                        : "bg-surface-variant/30 text-on-surface-variant border-outline-variant/20 hover:bg-surface-variant/50"
                    }`}
                  >
                    {activeCategory === cat.id && (
                      <motion.span
                        layoutId="activeCategoryPill"
                        className="absolute inset-0 bg-primary rounded-full -z-10"
                        transition={{ type: "spring" as const, stiffness: 380, damping: 30 }}
                      />
                    )}
                    <h3 className="text-sm font-semibold inline relative z-10">{cat.name}</h3>
                  </button>
                ))}
              </div>

              {activeCategory === "all" && !searchQuery.trim() ? (
                <div className="space-y-6">
                  <h2 className="text-[28px] font-bold text-on-surface">Categories</h2>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {categories.map((cat) => {
                      const meta = categoryMeta[cat.id] || {
                        icon: "menu_book",
                        description: "Read documentation and guides for this category."
                      };
                      return (
                        <CategoryCard
                          key={cat.id}
                          id={cat.id}
                          name={cat.name}
                          icon={meta.icon}
                          description={meta.description}
                          onClick={() => setActiveCategory(cat.id)}
                        />
                      );
                    })}
                  </motion.div>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeCategory !== "all" && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setActiveCategory("all")} 
                        className="text-primary hover:underline flex items-center gap-1 text-sm font-bold cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        Back to Categories
                      </button>
                    </div>
                  )}
                  <motion.div
                    key={activeCategory + searchQuery}
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {filteredArticles.map((art) => (
                      <motion.div
                        key={art.id}
                        variants={itemVariants}
                        whileHover={{ y: -4, scale: 1.01, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)" }}
                        onClick={() => setSelectedArticleId(art.id)}
                        className="p-6 bg-surface-container rounded-2xl border border-outline-variant/20 cursor-pointer hover:border-primary transition-all group"
                      >
                        <h3 className="font-bold text-[18px] text-on-surface mb-2 group-hover:text-primary transition-colors">{art.title}</h3>
                        <p className="text-[14px] text-on-surface-variant line-clamp-3 mb-4">{art.excerpt}</p>
                        <div className="flex items-center gap-4 text-[12px] text-on-surface-variant/60">
                          <span>{art.date}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">timer</span> {art.readTime}</span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}
            </motion.div>
          ) : selectedArticle ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-[800px] mx-auto"
            >
              <button onClick={() => setSelectedArticleId(null)} className="flex items-center gap-1 text-primary mb-8 hover:underline">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to articles
              </button>
            <article>
              <header className="mb-10 space-y-4">
                <div className="flex items-center gap-6 text-[14px]">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold uppercase tracking-wide text-[11px]">{selectedArticle.category}</span>
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    {selectedArticle.date}
                  </span>
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    {selectedArticle.views}
                  </span>
                </div>

                <h1 className="text-[36px] sm:text-[44px] font-display-lg leading-tight text-on-surface">
                  {selectedArticle.title}
                </h1>
                <p className="text-[18px] text-on-surface-variant italic leading-relaxed font-body-lg">
                  {selectedArticle.excerpt}
                </p>
              </header>

              {/* Notion Article body rendering */}
              <div className="prose prose-invert max-w-none text-[16px] leading-loose text-on-surface space-y-6">
                {selectedArticle.content.split("\n\n").map((para, i) => {
                  if (para.startsWith("### ")) {
                    return <h3 key={i} className="text-[24px] font-headline-lg-mobile text-on-surface mt-8 mb-4">{para.replace("### ", "")}</h3>;
                  }
                  if (para.startsWith("#### ")) {
                    return <h4 key={i} className="text-[18px] font-bold text-on-surface mt-6 mb-2">{para.replace("#### ", "")}</h4>;
                  }
                  
                  if (para.includes("\n1. ") || para.includes("\n- ") || para.startsWith("1. ") || para.startsWith("- ")) {
                    const items = para.split("\n").filter((x) => x.trim());
                    const listElements = items.map((item, idx) => {
                      const cleanItem = item.replace(/^\d+\.\s*/, "").replace(/^-\s*/, "");
                      const parts = cleanItem.split("**");
                      const formatted = parts.map((part, pidx) => pidx % 2 === 1 ? <strong key={pidx} className="text-on-surface">{part}</strong> : part);
                      return <li key={idx} className="list-disc ml-6 pl-2 mb-2 text-on-surface-variant">{formatted}</li>;
                    });
                    return <ul key={i} className="space-y-2 my-6">{listElements}</ul>;
                  }

                  if (para.startsWith("> [!NOTE]")) {
                    return (
                      <div key={i} className="p-6 bg-primary/5 border-l-4 border-primary rounded-r-xl my-8">
                        <p className="font-bold text-primary mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">info</span> NOTE
                        </p>
                        <p className="text-on-surface-variant leading-relaxed text-[15px]">
                          {para.replace("> [!NOTE]\n", "").replace(/> /g, "")}
                        </p>
                      </div>
                    );
                  }
                  if (para.startsWith("> [!WARNING]")) {
                    return (
                      <div key={i} className="p-6 bg-amber-500/5 border-l-4 border-amber-500 rounded-r-xl my-8">
                        <p className="font-bold text-amber-500 mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">warning</span> WARNING
                        </p>
                        <p className="text-on-surface-variant leading-relaxed text-[15px]">
                          {para.replace("> [!WARNING]\n", "").replace(/> /g, "")}
                        </p>
                      </div>
                    );
                  }

                  if (para.startsWith("\`\`\`")) {
                    const lines = para.split("\n");
                    const lang = lines[0].replace("\`\`\`", "") || "code";
                    const code = lines.slice(1, -1).join("\n");
                    return (
                      <div key={i} className="bg-surface-container-lowest p-5 rounded-xl font-mono text-[13px] my-6 border border-outline-variant/20 overflow-x-auto shadow-inner">
                        <div className="flex justify-between items-center text-[11px] font-bold text-on-surface-variant uppercase border-b border-outline-variant/10 pb-3 mb-3 tracking-widest">
                          <span>{lang}</span>
                          <span className="cursor-pointer hover:text-on-surface transition-colors flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">content_copy</span> Copy</span>
                        </div>
                        <pre className="text-on-surface leading-relaxed">{code}</pre>
                      </div>
                    );
                  }

                  const parts = para.split("**");
                  const formatted = parts.map((part, pidx) => pidx % 2 === 1 ? <strong key={pidx} className="font-bold text-on-surface">{part}</strong> : part);
                  
                  const codeParts = formatted.reduce((acc: any[], currentItem) => {
                    if (typeof currentItem === "string") {
                      const subParts = currentItem.split("\`");
                      subParts.forEach((sp, spidx) => {
                        if (spidx % 2 === 1) {
                          acc.push(<code key={`${spidx}`} className="font-mono text-[14px] bg-surface-container-lowest border border-outline-variant/20 px-1.5 py-0.5 rounded text-primary">{sp}</code>);
                        } else {
                          acc.push(sp);
                        }
                      });
                    } else {
                      acc.push(currentItem);
                    }
                    return acc;
                  }, []);

                  return <p key={i} className="leading-relaxed text-on-surface-variant text-[16px]">{codeParts}</p>;
                })}
              </div>

              {/* Article Feedback Footer */}
              <footer className="border-t border-outline-variant/20 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[14px] text-on-surface-variant">
                <div className="flex items-center gap-4">
                  <span>Was this article helpful?</span>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 h-9 px-4 bg-surface-variant/30 hover:bg-surface-variant hover:text-on-surface border border-outline-variant/20 rounded-full transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-[18px]">thumb_up</span> Yes
                    </button>
                    <button className="flex items-center gap-1.5 h-9 px-4 bg-surface-variant/30 hover:bg-surface-variant hover:text-on-surface border border-outline-variant/20 rounded-full transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-[18px]">thumb_down</span> No
                    </button>
                  </div>
                </div>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline font-bold"
                >
                  Open original website
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </a>
              </footer>
            </article>
          </motion.div>
        ) : null}
      </AnimatePresence>

      </div>
    </PageTransition>
  );
}
