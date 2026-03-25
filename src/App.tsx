import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Upload, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Copy, 
  Check, 
  Loader2,
  ArrowRight,
  RefreshCw,
  History,
  Plus,
  Eye,
  X
} from 'lucide-react';
import { generateAsset, DesignAsset } from './services/gemini';

export default function App() {
  const [input, setInput] = useState('');
  const [visualInstructions, setVisualInstructions] = useState('');
  const [artStyle, setArtStyle] = useState('Realistic');
  const [subjectImage, setSubjectImage] = useState<File | null>(null);
  const [subjectPreviewUrl, setSubjectPreviewUrl] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referencePreviewUrl, setReferencePreviewUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [asset, setAsset] = useState<DesignAsset | null>(null);
  const [history, setHistory] = useState<DesignAsset[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSubjectImage(file);
      const url = URL.createObjectURL(file);
      setSubjectPreviewUrl(url);
    }
  };

  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceImage(file);
      const url = URL.createObjectURL(file);
      setReferencePreviewUrl(url);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const url = URL.createObjectURL(file);
      setLogoPreviewUrl(url);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleGenerate = async () => {
    if (!input && !subjectImage && !logoFile) return;
    
    setIsGenerating(true);
    try {
      let subjectBase64;
      if (subjectImage) {
        subjectBase64 = await fileToBase64(subjectImage);
      }
      let referenceBase64;
      if (referenceImage) {
        referenceBase64 = await fileToBase64(referenceImage);
      }
      let logoBase64;
      if (logoFile) {
        logoBase64 = await fileToBase64(logoFile);
      }
      const result = await generateAsset(
        input || "Create a professional social media post", 
        subjectBase64,
        visualInstructions,
        logoBase64,
        artStyle,
        referenceBase64
      );
      setAsset(result);
      setHistory(prev => [result, ...prev].slice(0, 10)); // Keep last 10
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate asset. Please check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!asset?.imageUrl) return;
    
    const link = document.createElement('a');
    link.href = asset.imageUrl;
    link.download = `instant-designer-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setInput('');
    setVisualInstructions('');
    setArtStyle('Realistic');
    setSubjectImage(null);
    setSubjectPreviewUrl(null);
    setReferenceImage(null);
    setReferencePreviewUrl(null);
    setLogoFile(null);
    setLogoPreviewUrl(null);
    setAsset(null);
    if (subjectInputRef.current) subjectInputRef.current.value = '';
    if (referenceInputRef.current) referenceInputRef.current.value = '';
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Global Header */}
      <header className="w-full bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-center relative sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center text-black shadow-lg shadow-gold/20">
            <Sparkles size={20} />
          </div>
          <div className="text-center">
            <h1 className="font-display font-bold text-xl tracking-tight text-gold">Instant Designer</h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Pro Social Assets</p>
          </div>
        </div>
        <div className="absolute right-8 hidden sm:block">
          <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Powered by Gemini AI</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel: Inputs */}
        <div className="w-full lg:w-[450px] bg-zinc-900 border-r border-zinc-800 p-8 flex flex-col gap-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Design Controls</h2>
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gold hover:bg-gold/10 rounded-lg transition-all border border-gold/20"
              title="Reset All Fields"
            >
              <RefreshCw size={12} />
              Reset
            </button>
          </div>

          <div className="space-y-8">
            {/* Section 1: Branding & Style */}
            <div className="space-y-6 p-5 bg-black/40 rounded-3xl border border-zinc-800/50">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <Plus size={12} className="text-gold" />
                  Describe your post
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="What are you promoting? (e.g., New Summer Collection)"
                  className="w-full h-20 p-4 bg-black border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all resize-none text-sm text-gold-light placeholder:text-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <Plus size={12} className="text-gold" />
                  Brand Logo
                </label>
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className="group relative w-full h-16 bg-black border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-gold/50 transition-all overflow-hidden"
                >
                  {logoPreviewUrl ? (
                    <img src={logoPreviewUrl} alt="Logo" className="h-full object-contain p-2" />
                  ) : (
                    <>
                      <ImageIcon size={16} className="text-zinc-600 group-hover:text-gold transition-colors" />
                      <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Upload Logo</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={logoInputRef} 
                    onChange={handleLogoChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <Plus size={12} className="text-gold" />
                  Art Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Realistic', 'Digital Art', '3D Render', 'Minimalist', 'Vintage', 'Futuristic'].map((style) => (
                    <button
                      key={style}
                      onClick={() => setArtStyle(style)}
                      className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                        artStyle === style 
                          ? 'bg-gold text-black border-gold shadow-lg shadow-gold/20' 
                          : 'bg-black text-zinc-500 border-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: Subject & Visuals */}
            <div className="space-y-6 p-5 bg-black/40 rounded-3xl border border-zinc-800/50">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <Plus size={12} className="text-gold" />
                  Product / Subject Image
                </label>
                <p className="text-[10px] text-zinc-600 mb-2 italic">Upload the image you want to create an ad for.</p>
                <div 
                  onClick={() => subjectInputRef.current?.click()}
                  className="group relative w-full aspect-video bg-black border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-gold/50 transition-all overflow-hidden"
                >
                  {subjectPreviewUrl ? (
                    <img src={subjectPreviewUrl} alt="Subject" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload size={24} className="text-zinc-600 group-hover:text-gold transition-colors" />
                      <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Upload Subject</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={subjectInputRef} 
                    onChange={handleSubjectChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <Plus size={12} className="text-gold" />
                  Visual Look & Feel
                </label>
                <textarea
                  value={visualInstructions}
                  onChange={(e) => setVisualInstructions(e.target.value)}
                  placeholder="Define how the post should look like (e.g., cinematic lighting, neon accents)"
                  className="w-full h-20 p-4 bg-black border border-zinc-800 rounded-2xl focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all resize-none text-sm text-gold-light placeholder:text-zinc-700"
                />
              </div>
            </div>

            {/* Section 3: Reference Post */}
            <div className="space-y-4 p-5 bg-black/40 rounded-3xl border border-zinc-800/50">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <Plus size={12} className="text-gold" />
                  Reference Post (Optional)
                </label>
                <p className="text-[10px] text-zinc-600 mb-2 italic">Upload a post for layout/style reference.</p>
                <div 
                  onClick={() => referenceInputRef.current?.click()}
                  className="group relative w-full h-24 bg-black border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-gold/50 transition-all overflow-hidden"
                >
                  {referencePreviewUrl ? (
                    <img src={referencePreviewUrl} alt="Reference" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <History size={18} className="text-zinc-600 group-hover:text-gold transition-colors" />
                      <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Upload Reference</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={referenceInputRef} 
                    onChange={handleReferenceChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || (!input && !subjectImage && !logoFile)}
              className="w-full py-5 bg-gold text-black rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-gold/10 text-sm uppercase tracking-widest"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Designing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Generate Asset</span>
                </>
              )}
            </button>
          </div>

          {history.length > 0 && (
            <div className="space-y-4 pt-8 border-t border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-500">
                <History size={16} />
                <h3 className="text-xs font-bold uppercase tracking-wider">Recent Designs</h3>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {history.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAsset(item)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      asset?.imageUrl === item.imageUrl ? 'border-gold' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={item.imageUrl} alt="History" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto pt-8 border-t border-zinc-800">
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Rule of Thirds • High Contrast • Modern Typography
            </p>
          </div>
        </div>

        {/* Right Panel: Preview */}
        <main className="flex-1 bg-black p-8 lg:p-12 overflow-y-auto flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!asset && !isGenerating ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center h-full max-w-md text-center gap-4"
            >
              <div className="w-20 h-20 bg-zinc-900 rounded-3xl shadow-sm flex items-center justify-center text-zinc-700 border border-zinc-800 mb-4">
                <ImageIcon size={40} />
              </div>
              <h2 className="font-display font-bold text-2xl text-gold">Ready to design?</h2>
              <p className="text-zinc-500 text-sm">
                Enter a description or upload an image to generate professional social media assets in seconds.
              </p>
            </motion.div>
          ) : isGenerating ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full gap-6"
            >
              <div className="relative">
                <div className="w-24 h-24 border-4 border-zinc-800 border-t-gold rounded-full animate-spin" />
                <Sparkles className="absolute inset-0 m-auto text-gold" size={32} />
              </div>
              <div className="text-center">
                <h3 className="font-display font-bold text-xl text-gold">Crafting your visual...</h3>
                <p className="text-zinc-500 text-sm mt-2">Analyzing composition and generating captions</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-4xl space-y-12"
            >
              {/* Design Strategy Banner */}
              <div className="bg-zinc-900 text-gold p-6 rounded-3xl flex items-center gap-4 shadow-2xl border border-zinc-800">
                <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Sparkles size={24} className="text-gold" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1">Design Strategy</p>
                  <p className="font-medium text-sm lg:text-base leading-snug">{asset?.strategy}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                {/* Image Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Visual Asset</h3>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setIsViewModalOpen(true)}
                        className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 hover:text-gold transition-colors"
                      >
                        <Eye size={12} /> VIEW FULLSCREEN
                      </button>
                      <button 
                        onClick={handleDownload}
                        className="text-[10px] font-bold text-gold flex items-center gap-1 hover:underline"
                      >
                        DOWNLOAD HD <ArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                  <div 
                    onClick={() => setIsViewModalOpen(true)}
                    className="aspect-square bg-zinc-900 rounded-[40px] shadow-2xl shadow-gold/5 overflow-hidden border-8 border-zinc-900 cursor-pointer group relative"
                  >
                    <img 
                      src={asset?.imageUrl} 
                      alt="Generated Asset" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-gold text-black p-3 rounded-full shadow-xl">
                        <Eye size={20} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Captions */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <Instagram size={16} className="text-gold" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gold">Instagram</h3>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(`${asset?.captions.instagram.text}\n\n${asset?.captions.instagram.hashtags.join(' ')}`, 'ig')}
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        {copied === 'ig' ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-zinc-600" />}
                      </button>
                    </div>
                    <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-sm space-y-4">
                      <p className="text-sm leading-relaxed text-zinc-300">{asset?.captions.instagram.text}</p>
                      <div className="flex flex-wrap gap-2">
                        {asset?.captions.instagram.hashtags.map(tag => (
                          <span key={tag} className="text-[11px] font-mono text-zinc-500">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <Facebook size={16} className="text-gold" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gold">Facebook</h3>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(`${asset?.captions.facebook.text}\n\nCTA: ${asset?.captions.facebook.cta}`, 'fb')}
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        {copied === 'fb' ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-zinc-600" />}
                      </button>
                    </div>
                    <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-sm space-y-4">
                      <p className="text-sm leading-relaxed text-zinc-300">{asset?.captions.facebook.text}</p>
                      <div className="pt-4 border-t border-zinc-800">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Call to Action</p>
                        <p className="text-sm font-bold text-gold">{asset?.captions.facebook.cta}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <Linkedin size={16} className="text-gold" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gold">LinkedIn</h3>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(`${asset?.captions.linkedin.text}\n\n${asset?.captions.linkedin.hashtags.join(' ')}`, 'li')}
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        {copied === 'li' ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-zinc-600" />}
                      </button>
                    </div>
                    <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-sm space-y-4">
                      <p className="text-sm leading-relaxed text-zinc-300">{asset?.captions.linkedin.text}</p>
                      <div className="flex flex-wrap gap-2">
                        {asset?.captions.linkedin.hashtags.map(tag => (
                          <span key={tag} className="text-[11px] font-mono text-zinc-500">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {isViewModalOpen && asset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12"
            onClick={() => setIsViewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full aspect-square bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="absolute top-6 right-6 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-md"
              >
                <X size={24} />
              </button>
              <img
                src={asset.imageUrl}
                alt="Full View"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-gold font-display font-bold text-xl">Asset Preview</h3>
                    <p className="text-zinc-400 text-sm mt-1">{asset.strategy}</p>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-gold text-black rounded-xl font-bold text-sm hover:bg-gold-light transition-colors flex items-center gap-2"
                  >
                    Download HD <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
