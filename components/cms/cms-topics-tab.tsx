"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTopic, deleteTopic, updateTopic } from "@/app/actions/topic";
import { Trash2, SquarePen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Topic {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CMSTopicsTabProps {
  initialTopics: Topic[];
}

export default function CMSTopicsTab({ initialTopics }: CMSTopicsTabProps) {
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const router = useRouter();
  const { toast } = useToast();

  // Sinkronisasi prop-to-state pasca router.refresh()
  useEffect(() => {
    setTopics(initialTopics);
  }, [initialTopics]);
  const [searchQuery, setSearchQuery] = useState("");

  // Create Form States
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Edit Form States
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Auto-slug for Create Form
  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    );
  };

  // Auto-slug for Edit Form
  const handleEditNameChange = (val: string) => {
    setEditName(val);
    setEditSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    );
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createTopic({ name, slug, description });
      if (result.success && result.data) {
        setTopics([...topics, result.data]);
        setName("");
        setSlug("");
        setDescription("");
        setShowForm(false);
        toast({
          title: "Topik Berhasil Dibuat!",
          description: `Topik "${result.data.name}" berhasil ditambahkan.`,
          variant: "success",
        });
        router.refresh();
      } else {
        toast({
          title: "Gagal Membuat Topik",
          description: result.error || "Terjadi kesalahan pada server",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (topic: Topic) => {
    setEditingTopic(topic);
    setEditName(topic.name);
    setEditSlug(topic.slug);
    setEditDescription(topic.description || "");
  };

  const handleUpdateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic) return;
    setEditLoading(true);

    try {
      const result = await updateTopic(editingTopic.id, {
        name: editName,
        slug: editSlug,
        description: editDescription,
      });
      if (result.success && result.data) {
        setTopics(
          topics.map((t) => (t.id === editingTopic.id ? result.data! : t))
        );
        setEditingTopic(null);
        toast({
          title: "Topik Berhasil Diperbarui!",
          description: `Topik "${result.data.name}" berhasil diperbarui.`,
          variant: "success",
        });
        router.refresh();
      } else {
        toast({
          title: "Gagal Memperbarui Topik",
          description: result.error || "Terjadi kesalahan pada server",
          variant: "destructive",
        });
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    const topicToDelete = topics.find((t) => t.id === id);
    if (confirm(`Hapus topik "${topicToDelete?.name || ""}"?`)) {
      const result = await deleteTopic(id);
      if (result.success) {
        setTopics(topics.filter((t) => t.id !== id));
        toast({
          title: "Topik Berhasil Dihapus",
          description: `Topik "${topicToDelete?.name || ""}" berhasil dihapus secara permanen.`,
          variant: "success",
        });
        router.refresh();
      } else {
        toast({
          title: "Gagal Menghapus Topik",
          description: result.error || "Terjadi kesalahan pada server",
          variant: "destructive",
        });
      }
    }
  };

  // Filter topics based on search query
  const filteredTopics = topics.filter((topic) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      topic.name.toLowerCase().includes(query) ||
      (topic.description && topic.description.toLowerCase().includes(query))
    );
  });

  const inputStyleClass =
    "w-full rounded-[24px] h-11 px-5 border-[#E2E8F0] focus-visible:border-[#FF4B4B] focus-visible:ring-[#FF4B4B]/20 focus-visible:ring-[3px] focus-visible:outline-none transition-all shadow-sm";

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Topics Management</CardTitle>
              <CardDescription>Create and manage learning topics</CardDescription>
            </div>
            <Button
              className="bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[24px] px-6 h-10 shadow-sm transition-all font-semibold"
              onClick={() => setShowForm(true)}
            >
              + Buat Topik
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <Input
            placeholder="Cari Topik..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6"
          />

          <div className="space-y-2">
            <div className="grid gap-3">
              {filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="flex justify-between items-center border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-base">{topic.name}</p>
                    <p className="text-sm text-muted-foreground">slug: {topic.slug}</p>
                    {topic.description && (
                      <p className="text-sm text-muted-foreground mt-1.5">
                        {topic.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-500 hover:text-slate-600 hover:bg-slate-50 rounded-full w-8 h-8 p-0 flex items-center justify-center"
                      onClick={() => handleEditClick(topic)}
                    >
                      <SquarePen className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full w-8 h-8 p-0 flex items-center justify-center"
                      onClick={() => handleDeleteTopic(topic.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredTopics.length === 0 && (
                <p className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                  {searchQuery.trim()
                    ? "No topics found matching your query."
                    : "No topics yet. Create one by clicking \"+ Create Topic\"."}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Topic Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg w-full max-h-screen overflow-y-auto rounded-[24px] p-6" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Create Topic</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTopic} className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Topic Name</label>
              <Input
                placeholder="Topic name (e.g., Fire Safety)"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className={inputStyleClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Slug</label>
              <Input
                placeholder="Slug (e.g., fire-safety)"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                required
                className={inputStyleClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Description</label>
              <Input
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputStyleClass}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-[24px] h-10 border-[#E2E8F0] hover:border-gray-300 transition-all font-semibold"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[24px] h-10 shadow-sm transition-all font-semibold"
              >
                {loading ? "Creating..." : "Create Topic"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Topic Dialog */}
      <Dialog open={!!editingTopic} onOpenChange={(open) => !open && setEditingTopic(null)}>
        <DialogContent className="max-w-lg w-full max-h-screen overflow-y-auto rounded-[24px] p-6" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Edit Topic</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTopic} className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Topic Name</label>
              <Input
                placeholder="Topic name (e.g., Fire Safety)"
                value={editName}
                onChange={(e) => handleEditNameChange(e.target.value)}
                required
                className={inputStyleClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Slug</label>
              <Input
                placeholder="Slug (e.g., fire-safety)"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value.toLowerCase())}
                required
                className={inputStyleClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Description</label>
              <Input
                placeholder="Description (optional)"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className={inputStyleClass}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-[24px] h-10 border-[#E2E8F0] hover:border-gray-300 transition-all font-semibold"
                onClick={() => setEditingTopic(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editLoading}
                className="flex-1 bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[24px] h-10 shadow-sm transition-all font-semibold"
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
