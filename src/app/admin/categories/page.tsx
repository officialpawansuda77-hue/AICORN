"use client";

import { useState } from "react";
import { Plus, GripVertical } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GlassInput } from "@/components/ui/glass-input";
import { useToast } from "@/components/ui/toast";
import { demoCategories, demoModels } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState(demoCategories);
  const [models, setModels] = useState(demoModels);

  const [newCatName, setNewCatName] = useState("");
  const [newModelName, setNewModelName] = useState("");

  const addCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    setCategories([
      ...categories,
      { slug, name: newCatName.trim(), sort_order: categories.length, is_active: true },
    ]);
    setNewCatName("");
    toast("Category added", "success");
  };

  const addModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelName.trim()) return;
    const slug = newModelName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    setModels([
      ...models,
      { slug, name: newModelName.trim(), sort_order: models.length, is_active: true },
    ]);
    setNewModelName("");
    toast("Model added", "success");
  };

  const toggleCategory = (slug: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.slug === slug ? { ...c, is_active: !c.is_active } : c))
    );
  };

  const toggleModel = (slug: string) => {
    setModels((prev) =>
      prev.map((m) => (m.slug === slug ? { ...m, is_active: !m.is_active } : m))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
          Categories & AI Models
        </h1>
        <p className="text-xs text-white/50">
          Configure active taxonomy for prompt filtering and uploading
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Categories */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Categories ({categories.length})
          </h2>
          <form onSubmit={addCategory} className="flex gap-2">
            <GlassInput
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Add category (e.g. UGC, Cinematic)..."
            />
            <button
              type="submit"
              className="h-11 px-4 rounded-full bg-[#FFB020] text-[#08090B] font-semibold text-xs inline-flex items-center gap-1 hover:bg-[#FFBE4D] shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </form>

          <GlassPanel rounded="2xl" className="overflow-hidden bg-white/[0.03] border-white/[0.08]">
            <div className="divide-y divide-white/[0.05]">
              {categories.map((cat) => (
                <div key={cat.slug} className="flex items-center justify-between p-3.5 px-4 hover:bg-white/[0.02]">
                  <div className="flex items-center gap-2.5">
                    <GripVertical className="w-3.5 h-3.5 text-white/30" />
                    <div>
                      <p className="text-xs font-semibold text-white">{cat.name}</p>
                      <p className="text-[10px] text-white/40 font-mono">/{cat.slug}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleCategory(cat.slug)}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer",
                      cat.is_active
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-white/10 text-white/40"
                    )}
                  >
                    {cat.is_active ? "Active" : "Hidden"}
                  </button>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* AI Models */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            AI Models & Tools ({models.length})
          </h2>
          <form onSubmit={addModel} className="flex gap-2">
            <GlassInput
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              placeholder="Add AI model (e.g. Veo 3, Seedance)..."
            />
            <button
              type="submit"
              className="h-11 px-4 rounded-full bg-[#FFB020] text-[#08090B] font-semibold text-xs inline-flex items-center gap-1 hover:bg-[#FFBE4D] shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </form>

          <GlassPanel rounded="2xl" className="overflow-hidden bg-white/[0.03] border-white/[0.08]">
            <div className="divide-y divide-white/[0.05]">
              {models.map((mod) => (
                <div key={mod.slug} className="flex items-center justify-between p-3.5 px-4 hover:bg-white/[0.02]">
                  <div className="flex items-center gap-2.5">
                    <GripVertical className="w-3.5 h-3.5 text-white/30" />
                    <div>
                      <p className="text-xs font-semibold text-white">{mod.name}</p>
                      <p className="text-[10px] text-white/40 font-mono">/{mod.slug}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleModel(mod.slug)}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer",
                      mod.is_active
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-white/10 text-white/40"
                    )}
                  >
                    {mod.is_active ? "Active" : "Hidden"}
                  </button>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
