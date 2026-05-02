"use client";

import { useEffect, useState } from "react";
import {
  getMaterials,
  publishMaterial,
  archiveMaterial,
} from "@/app/actions/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Archive, Trash2 } from "lucide-react";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    setLoading(true);
    const result = await getMaterials();
    if (result.success) {
      setMaterials(result.data);
    }
    setLoading(false);
  };

  const handlePublish = async (id: string) => {
    const result = await publishMaterial(id);
    if (result.success) {
      loadMaterials();
    }
  };

  const handleArchive = async (id: string) => {
    const result = await archiveMaterial(id);
    if (result.success) {
      loadMaterials();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Materials</h1>
        <p className="text-muted-foreground">Manage all learning materials</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Materials</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : materials.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No materials found
            </p>
          ) : (
            <div className="space-y-4">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="border rounded-lg p-4 flex justify-between items-start hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{material.title}</h3>
                      <Badge className={getStatusColor(material.status)}>
                        {material.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {material.description}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Type: {material.type}</span>
                      <span>Duration: {material.duration}s</span>
                      <span>Topic: {material.topic?.name}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {material.status === "DRAFT" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handlePublish(material.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    {material.status === "PUBLISHED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleArchive(material.id)}
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
