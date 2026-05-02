"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTopic, deleteTopic } from "@/app/actions/topic";
import { Trash2 } from "lucide-react";

interface Topic {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface CMSTopicsTabProps {
  initialTopics: Topic[];
}

export default function CMSTopicsTab({ initialTopics }: CMSTopicsTabProps) {
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

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
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (confirm("Delete this topic?")) {
      const result = await deleteTopic(id);
      if (result.success) {
        setTopics(topics.filter((t) => t.id !== id));
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Topics Management</CardTitle>
        <CardDescription>Create and manage learning topics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleCreateTopic} className="space-y-4 border-b pb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              placeholder="Topic name (e.g., Fire Safety)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              placeholder="Slug (e.g., fire-safety)"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              required
            />
          </div>
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Topic"}
          </Button>
        </form>

        <div className="space-y-2">
          <h3 className="font-semibold">Existing Topics ({topics.length})</h3>
          <div className="grid gap-3">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="flex justify-between items-center border rounded-lg p-4 hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{topic.name}</p>
                  <p className="text-sm text-muted-foreground">{topic.slug}</p>
                  {topic.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {topic.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTopic(topic.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {topics.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No topics yet
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
