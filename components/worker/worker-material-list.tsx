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
import { Badge } from "@/components/ui/badge";
import WorkerMaterialView from "./worker-material-view";
import { Clock, BookOpen, CheckCircle } from "lucide-react";

interface Material {
  id: string;
  title: string;
  description?: string;
  type: string;
  duration?: number;
  topic: {
    id: string;
    name: string;
  };
  mediaFiles: Array<{
    id: string;
    type: string;
    url: string;
  }>;
}

interface WorkerMaterialListProps {
  materials: Material[];
}

export default function WorkerMaterialList({
  materials,
}: WorkerMaterialListProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null,
  );
  const [completedMaterials, setCompletedMaterials] = useState<string[]>([]);

  if (selectedMaterial) {
    return (
      <WorkerMaterialView
        material={selectedMaterial}
        onBack={() => setSelectedMaterial(null)}
        onComplete={(materialId) => {
          setCompletedMaterials([...completedMaterials, materialId]);
          setSelectedMaterial(null);
        }}
      />
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return "🎥";
      case "INFOGRAPHIC":
        return "📊";
      case "ARTICLE":
        return "📄";
      default:
        return "📚";
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {materials.map((material) => (
        <Card key={material.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start gap-2 mb-2">
              <span className="text-2xl">{getTypeIcon(material.type)}</span>
              {completedMaterials.includes(material.id) && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </div>
            <CardTitle className="line-clamp-2">{material.title}</CardTitle>
            <CardDescription>{material.topic.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {material.description && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {material.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{material.type}</Badge>
              {material.duration && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.ceil(material.duration / 60)}m
                </Badge>
              )}
            </div>

            <Button
              onClick={() => setSelectedMaterial(material)}
              className="w-full"
              variant={
                completedMaterials.includes(material.id) ? "outline" : "default"
              }
            >
              {completedMaterials.includes(material.id) ? "Review" : "Learn"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
