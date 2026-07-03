import { useState } from "react";
import { useSession } from "../lib/auth-client";
import { useTheme } from "../lib/theme";
import { PageTransition } from "../components/PageTransition";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  
  const [profileName, setProfileName] = useState(session?.user?.name ?? "");
  const [profileEmail] = useState(session?.user?.email ?? "");

  const [aiTone, setAiTone] = useState("professional");
  const [aiConfidence, setAiConfidence] = useState(85);
  const [autoResolve, setAutoResolve] = useState(true);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    alert("All settings saved! (Simulated)");
  };

  return (
    <PageTransition className="flex-1 overflow-y-auto w-full scrollbar-hide">
      <div className="max-w-[1024px] mx-auto w-full px-4 md:px-margin-desktop py-8 md:py-12 pb-32">
        
        {/* Page Header */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-[32px] text-primary mb-2">Settings & Configuration</h2>
          <p className="font-body-lg text-[18px] text-on-surface-variant">Manage your enterprise environment, identity, and AI preferences.</p>
        </div>

        <form onSubmit={handleSaveAll} className="space-y-6">
          {/* Bento Grid Layout for Settings Cards */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            
            {/* Profile Settings Card */}
            <div className="md:col-span-8 glass-card rounded-xl p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(184,195,255,0.05)] hover:-translate-y-0.5 flex flex-col h-full bg-surface-container-lowest/40">
              <div className="flex items-center gap-4 mb-8">
                <span className="material-symbols-outlined text-[32px] text-secondary">manage_accounts</span>
                <h3 className="font-headline-lg-mobile md:font-headline-lg text-[24px] text-on-surface">Profile Identity</h3>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-8 mb-8 items-start">
                <div className="w-24 h-24 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center relative group shrink-0 overflow-hidden">
                  <div className="text-[40px] font-bold text-on-surface-variant group-hover:opacity-0 transition-opacity">
                    {profileName ? profileName[0].toUpperCase() : 'U'}
                  </div>
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="material-symbols-outlined text-primary">edit</span>
                  </div>
                </div>
                
                <div className="flex-1 w-full space-y-6">
                  <div>
                    <label htmlFor="display-name" className="block font-label-md text-[14px] text-outline mb-2">Display Name</label>
                    <input 
                      id="display-name"
                      className="w-full bg-surface-variant/20 border-b border-outline-variant/30 focus:border-primary focus:bg-surface-variant/30 py-2 text-[16px] text-on-surface px-2 outline-none transition-all" 
                      type="text" 
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="enterprise-email" className="block font-label-md text-[14px] text-outline mb-2">Enterprise Email</label>
                    <input 
                      id="enterprise-email"
                      className="w-full bg-surface-variant/20 border-b border-outline-variant/30 py-2 text-[16px] text-on-surface px-2 outline-none opacity-70 cursor-not-allowed" 
                      readOnly 
                      type="email" 
                      value={profileEmail || "user@resolvenow.ai"}
                    />
                    <p className="text-[12px] text-on-surface-variant mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      Managed by single sign-on (SSO).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Appearance Card */}
            <div className="md:col-span-4 glass-card rounded-xl p-8 transition-all duration-300 hover:border-tertiary/30 hover:shadow-[0_0_20px_rgba(0,220,229,0.05)] hover:-translate-y-0.5 flex flex-col h-full bg-surface-container-lowest/40">
              <div className="flex items-center gap-4 mb-8">
                <span className="material-symbols-outlined text-[32px] text-tertiary">palette</span>
                <h3 className="font-headline-lg-mobile md:font-headline-lg text-[24px] text-on-surface">Appearance</h3>
              </div>
              
              <div className="space-y-6 flex-1">
                <div className="space-y-3">
                  <label className="block font-label-md text-[14px] text-outline">Theme Preference</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => theme !== "dark" && toggleTheme()}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                        theme === "dark" 
                          ? "border-primary bg-primary/10 text-primary" 
                          : "border-outline-variant/20 hover:border-outline-variant/50 text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px]">dark_mode</span>
                      <span className="font-label-sm text-[12px]">Deep Space</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => theme !== "light" && toggleTheme()}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                        theme === "light" 
                          ? "border-primary bg-primary/10 text-primary" 
                          : "border-outline-variant/20 hover:border-outline-variant/50 text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px]">light_mode</span>
                      <span className="font-label-sm text-[12px]">Light</span>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-outline-variant/10">
                  <label className="block font-label-md text-[14px] text-outline">Density</label>
                  <select className="w-full bg-surface-variant/20 border-b border-outline-variant/30 focus:border-primary focus:bg-surface-variant/30 py-2 text-[16px] text-on-surface outline-none transition-all appearance-none cursor-pointer">
                    <option className="bg-surface text-on-surface" value="comfortable">Editorial (Comfortable)</option>
                    <option className="bg-surface text-on-surface" value="compact">Compact (Data Heavy)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Configuration Card */}
            <div className="md:col-span-12 glass-card rounded-xl p-8 relative overflow-hidden bg-surface-container-lowest/40 border-primary/30 shadow-[0_0_30px_rgba(184,195,255,0.05)]">
              {/* AI Background Glow Effect */}
              <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <span className="material-symbols-outlined text-[32px] text-primary animate-pulse">model_training</span>
                <div>
                  <h3 className="font-headline-lg-mobile md:font-headline-lg text-[24px] text-on-surface">AI Copilot Parameters</h3>
                  <p className="font-body-md text-[14px] text-on-surface-variant mt-1">Configure how ResolveNow's intelligence interacts with your workflow.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                <div className="space-y-8">
                  {/* Toggle 1 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-label-md text-[16px] text-on-surface mb-1">Predictive Resolution Suggestions</h4>
                      <p className="font-body-md text-[13px] text-on-surface-variant">Auto-draft responses based on historical ticket data.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={autoResolve}
                        onChange={(e) => setAutoResolve(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  {/* Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-label-md text-[16px] text-on-surface">Auto-Resolution Threshold Confidence</h4>
                      <span className="font-mono text-[14px] font-bold text-primary">{aiConfidence}%</span>
                    </div>
                    <p className="font-body-md text-[13px] text-on-surface-variant mb-3">AI auto-closes tickets if classification confidence exceeds this.</p>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={aiConfidence}
                      onChange={(e) => setAiConfidence(Number(e.target.value))}
                      className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="smart-reply-tone" className="block font-label-md text-[14px] text-outline mb-2">Smart Reply Tone</label>
                    <div className="relative">
                      <select 
                        id="smart-reply-tone"
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value)}
                        className="w-full bg-surface-variant/20 border-b border-outline-variant/30 focus:border-primary focus:bg-surface-variant/30 py-3 pl-3 pr-10 text-[16px] text-on-surface outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option className="bg-surface" value="professional">Strictly Professional (formal business sign-off)</option>
                        <option className="bg-surface" value="warm">Helpful & Warm (casual friendly service)</option>
                        <option className="bg-surface" value="concise">Concise & Direct (short step logs)</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">arrow_drop_down</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-md text-[14px] text-outline mb-2">Base Knowledge Repository</label>
                    <div className="relative">
                      <select className="w-full bg-surface-variant/20 border-b border-outline-variant/30 focus:border-primary focus:bg-surface-variant/30 py-3 pl-3 pr-10 text-[16px] text-on-surface outline-none transition-all appearance-none cursor-pointer">
                        <option className="bg-surface" value="global">Global Enterprise DB (v4.2)</option>
                        <option className="bg-surface" value="regional">North America Sales DB</option>
                        <option className="bg-surface" value="tech">Technical Support Archives</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">arrow_drop_down</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-outline-variant/30 text-[11px] font-label-sm tracking-wider text-on-surface-variant bg-surface-variant/20 uppercase">
                        Indexing active
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-primary/30 text-[11px] font-label-sm tracking-wider text-primary bg-primary/10 uppercase">
                        LLM v2.5
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications Card */}
            <div className="md:col-span-12 glass-card rounded-xl p-8 bg-surface-container-lowest/40 mt-4 transition-all duration-300 hover:border-outline-variant/30">
              <div className="flex items-center gap-4 mb-8">
                <span className="material-symbols-outlined text-[32px] text-outline">notifications_active</span>
                <h3 className="font-headline-lg-mobile md:font-headline-lg text-[24px] text-on-surface">Alert Preferences</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-outline-variant/20">
                      <th className="py-4 px-4 font-label-md text-[14px] text-outline font-normal">Event Type</th>
                      <th className="py-4 px-4 font-label-md text-[14px] text-outline font-normal text-center">In-App</th>
                      <th className="py-4 px-4 font-label-md text-[14px] text-outline font-normal text-center">Email</th>
                      <th className="py-4 px-4 font-label-md text-[14px] text-outline font-normal text-center">Push</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-[15px] text-on-surface">
                    <tr className="border-b border-outline-variant/10 hover:bg-surface-variant/10 transition-colors">
                      <td className="py-4 px-4">High Priority Ticket Assigned</td>
                      <td className="py-4 px-4 text-center">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-outline-variant/30 bg-surface-variant text-primary focus:ring-primary cursor-pointer accent-primary" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-outline-variant/30 bg-surface-variant text-primary focus:ring-primary cursor-pointer accent-primary" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-outline-variant/30 bg-surface-variant text-primary focus:ring-primary cursor-pointer accent-primary" />
                      </td>
                    </tr>
                    <tr className="border-b border-outline-variant/10 hover:bg-surface-variant/10 transition-colors">
                      <td className="py-4 px-4">AI Insight Generated</td>
                      <td className="py-4 px-4 text-center">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-outline-variant/30 bg-surface-variant text-primary focus:ring-primary cursor-pointer accent-primary" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <input type="checkbox" className="w-4 h-4 rounded border-outline-variant/30 bg-surface-variant text-primary focus:ring-primary cursor-pointer accent-primary" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <input type="checkbox" className="w-4 h-4 rounded border-outline-variant/30 bg-surface-variant text-primary focus:ring-primary cursor-pointer accent-primary" />
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-variant/10 transition-colors">
                      <td className="py-4 px-4">Weekly Analytics Digest</td>
                      <td className="py-4 px-4 text-center">
                        <input type="checkbox" className="w-4 h-4 rounded border-outline-variant/30 bg-surface-variant text-primary focus:ring-primary cursor-pointer accent-primary" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-outline-variant/30 bg-surface-variant text-primary focus:ring-primary cursor-pointer accent-primary" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <input type="checkbox" className="w-4 h-4 rounded border-outline-variant/30 bg-surface-variant text-primary focus:ring-primary cursor-pointer accent-primary" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Bottom Action Row */}
          <div className="mt-12 flex justify-end gap-4 border-t border-outline-variant/20 pt-8 animate-in fade-in duration-700 delay-300">
            <button 
              type="button"
              className="px-6 py-2.5 rounded-lg border border-outline-variant/30 text-on-surface-variant font-label-md text-[14px] hover:bg-surface-variant/30 hover:text-on-surface transition-colors cursor-pointer"
            >
              Discard Changes
            </button>
            <button 
              type="submit"
              className="px-8 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-[14px] font-bold hover:opacity-90 hover:shadow-[0_0_20px_rgba(184,195,255,0.3)] transition-all cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </form>

      </div>
    </PageTransition>
  );
}
