import { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Save, 
  Trash2, 
  Layout, 
  Copy,
  ChevronRight,
  Info,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { db } from '@/lib/firebase';
import { collection, query, where, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface Template {
  id: string;
  name: string;
  platform: string;
  structure: string;
}

interface TemplateManagerProps {
  onSelect: (template: Template) => void;
  activePlatform: string;
}

export default function TemplateManager({ onSelect, activePlatform }: TemplateManagerProps) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', platform: activePlatform, structure: '' });
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const sampleData = {
    insight: "AI is transitioning from a 'nice-to-have' to the core operating system of modern enterprise.",
    cta: "Join our Neural Forge workshop to master these workflows.",
    stat: "73% of high-growth companies have already integrated agentic workflows.",
    goal: "Achieve 10x output with a 2x smaller footprint.",
    problem: "Most teams are still using LLMs as fancy search engines rather than reasoning engines."
  };

  const getSimulatedOutput = (structure: string) => {
    let output = structure;
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`\\[${key}\\]`, 'gi');
      output = output.replace(regex, value);
    });
    // Replace any remaining [tags] with generic sample text
    output = output.replace(/\[\w+\]/g, "[(Neural Insight Applied)]");
    return output;
  };

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  const fetchTemplates = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'templates'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
      setTemplates(fetched);
    } catch (e) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !newTemplate.name || !newTemplate.structure) return;
    try {
      const docRef = await addDoc(collection(db, 'templates'), {
        ...newTemplate,
        userId: user.uid,
        createdAt: new Date()
      });
      setTemplates([...templates, { id: docRef.id, ...newTemplate }]);
      setNewTemplate({ name: '', platform: activePlatform, structure: '' });
      setIsOpen(false);
      toast.success('Template forged');
    } catch (e) {
      toast.error('Failed to save template');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'templates', id));
      setTemplates(templates.filter(t => t.id !== id));
      toast.success('Template expunged');
    } catch (e) {
      toast.error('Deletion failed');
    }
  };

  const filteredTemplates = templates.filter(t => t.platform === activePlatform);

  const loadDefaults = async () => {
    if (!user) return;
    setLoading(true);
    const defaults = [
      {
        name: 'The Authority Hook',
        platform: activePlatform,
        structure: 'A: Problem Overview\nB: Catalyst Solution\nC: Data/Evidence\nD: Final Insight\nE: Call to Action'
      },
      {
        name: 'Neural Synthesis',
        platform: activePlatform,
        structure: 'Synthesize the source into 3 distinct layers: Executive, Practical, and Strategic.'
      }
    ];

    try {
      const saved = [];
      for (const d of defaults) {
        const docRef = await addDoc(collection(db, 'templates'), {
          ...d,
          userId: user.uid,
          createdAt: new Date()
        });
        saved.push({ id: docRef.id, ...d });
      }
      setTemplates([...templates, ...saved]);
      toast.success('Starter Blueprints loaded');
    } catch (e) {
      toast.error('Failed to load defaults');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#999]">Intelligence Blueprints</h3>
         {filteredTemplates.length === 0 && !loading && (
           <Button 
             variant="ghost" 
             className="h-6 text-[9px] font-bold text-primary hover:text-primary/80 px-2"
             onClick={loadDefaults}
           >
             Load Neural Presets
           </Button>
         )}
         <Dialog open={isOpen} onOpenChange={setIsOpen}>
           <DialogTrigger render={
             <Button variant="ghost" size="sm" className="h-8 rounded-lg font-black text-[10px] uppercase tracking-widest gap-2 bg-[#F5F5F5]" />
           }>
             <Plus className="w-3 h-3" /> New Forge blueprint
           </DialogTrigger>
           <DialogContent className="max-w-xl rounded-[40px] p-10">
             <DialogHeader>
               <DialogTitle className="text-3xl font-black tracking-tighter uppercase italic italic-serif">Forge Blueprint</DialogTitle>
               <DialogDescription>Create a custom structure for your content generations.</DialogDescription>
             </DialogHeader>
             <div className="space-y-6 mt-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest">Blueprint Name</label>
                  <Input 
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    placeholder="e.g., Weekly Insight Thread" 
                    className="rounded-2xl h-14 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest">Template Structure</label>
                    <div className="flex gap-2">
                      <span className="text-[9px] font-bold text-[#BBB]">[insight]</span>
                      <span className="text-[9px] font-bold text-[#BBB]">[cta]</span>
                      <span className="text-[9px] font-bold text-[#BBB]">[stat]</span>
                    </div>
                  </div>
                  <Textarea 
                    value={newTemplate.structure}
                    onChange={(e) => setNewTemplate({...newTemplate, structure: e.target.value})}
                    placeholder="Enter template with [placeholders]..." 
                    className="rounded-3xl h-48 p-6 font-medium resize-none"
                  />
                </div>
                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                   <Info className="w-5 h-5 text-orange-500 shrink-0" />
                   <p className="text-[10px] font-bold text-orange-700">The Forge will intelligently replace placeholders with context from your source material.</p>
                </div>
                <Button onClick={handleSave} className="w-full h-14 bg-black text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-black/10">
                  Save Blueprint
                </Button>
             </div>
           </DialogContent>
         </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <AnimatePresence mode="popLayout">
          {filteredTemplates.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-[#EEEEEE] rounded-[32px] flex flex-col items-center justify-center text-center">
               <FileText className="w-8 h-8 text-[#DDD] mb-3" />
               <p className="text-[10px] font-bold text-[#BBB] uppercase tracking-widest">No blueprints for {activePlatform}</p>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <motion.button
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => onSelect(template)}
                className="group flex items-center justify-between p-4 bg-white border border-[#EEEEEE] rounded-2xl hover:border-black hover:shadow-xl hover:shadow-black/5 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-[#F5F5F5] rounded-xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                      <Layout className="w-4 h-4" />
                   </div>
                   <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-[#666] group-hover:text-black">{template.name}</p>
                      <p className="text-[10px] font-medium text-[#BBB] mt-0.5">Custom Structure Applied</p>
                   </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className="h-8 w-8 text-[#999] hover:bg-[#F5F5F5]"
                     onClick={(e) => {
                       e.stopPropagation();
                       setPreviewTemplate(template);
                       setIsPreviewOpen(true);
                     }}
                   >
                      <Eye className="w-3.5 h-3.5" />
                   </Button>
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className="h-8 w-8 text-rose-500 hover:bg-rose-50"
                     onClick={(e) => handleDelete(template.id, e)}
                   >
                      <Trash2 className="w-3.5 h-3.5" />
                   </Button>
                   <ChevronRight className="w-4 h-4 text-[#BBB]" />
                </div>
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl rounded-[40px] p-10 bg-[#FAFAFA]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tighter uppercase italic">Blueprint Simulation</DialogTitle>
            <DialogDescription>Previewing how "{previewTemplate?.name}" applies to sample intelligence.</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#999]">Raw Structure</label>
                <div className="p-5 bg-white border border-[#EEE] rounded-3xl font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                  {previewTemplate?.structure}
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-bold text-blue-700 leading-tight">
                  The Forge analyzes your source text to extract the most relevant data points for each structural component.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#999]">Sample Output</label>
              <div className="p-6 bg-black text-white rounded-3xl text-sm leading-relaxed whitespace-pre-wrap shadow-2xl shadow-black/20">
                {previewTemplate && getSimulatedOutput(previewTemplate.structure)}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button 
              onClick={() => {
                if (previewTemplate) onSelect(previewTemplate);
                setIsPreviewOpen(false);
              }}
              className="px-8 h-12 bg-black text-white rounded-xl font-bold uppercase text-xs tracking-widest"
            >
              Apply This Blueprint
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
