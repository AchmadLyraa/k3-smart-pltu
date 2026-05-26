"use client";

import { useEffect, useState } from "react";

import UserList from "@/components/users/user-list";
import CreateUserForm from "@/components/users/create-user-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Trash2, Plus } from "lucide-react";

import {
  createUnit,
  createDivision,
  getUnits,
  getDivisions,
  deleteUnit,
  deleteDivision,
  updateUnit,
  updateDivision,
} from "@/app/actions/master-data";

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState("users");

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [units, setUnits] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  // ========================= UNIT =========================
  const [unitName, setUnitName] = useState("");
  const [unitCode, setUnitCode] = useState("");
  const [editingUnit, setEditingUnit] = useState<any>(null);

  // ========================= DIVISION =========================
  const [divisionName, setDivisionName] = useState("");
  const [divisionCode, setDivisionCode] = useState("");
  const [divisionUnitId, setDivisionUnitId] = useState("");
  const [editingDivision, setEditingDivision] = useState<any>(null);

  const handleCreateSuccess = () => {
    setIsCreateUserOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  // ========================= LOAD DATA =========================
  const loadAllData = async () => {
    setLoading(true);

    try {
      const [unitsRes, divisionsRes] = await Promise.all([
        getUnits(),
        getDivisions(),
      ]);

      if (unitsRes.success) setUnits(unitsRes.data || []);
      if (divisionsRes.success) setDivisions(divisionsRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="sa-welcome mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="sa-welcome__title">Kelola Data Pengguna</h1>

          <p className="sa-welcome__subtitle">Pengguna, unit, dan divisi</p>
        </div>

        <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#FF4B4B] hover:bg-[#FF3333] text-white rounded-[20px] px-6 h-10 shadow-sm transition-all font-semibold">
              <Plus className="w-5 h-5 mr-1" strokeWidth={3} />
              Tambah Pengguna
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-[28px] p-0 border-0">
            <DialogHeader className="px-8 pt-8 pb-2">
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Tambah Pengguna
              </DialogTitle>
            </DialogHeader>

            <div className="px-8 pb-8">
              <CreateUserForm onSuccess={handleCreateSuccess} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* TABS */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-white border border-slate-200 rounded-[20px] p-1 h-auto">
          <TabsTrigger value="users" className="rounded-[14px]">
            Pengguna
          </TabsTrigger>

          <TabsTrigger value="units" className="rounded-[14px]">
            Unit
          </TabsTrigger>

          <TabsTrigger value="divisions" className="rounded-[14px]">
            Divisi
          </TabsTrigger>
        </TabsList>

        {/* ========================= USERS ========================= */}
        <TabsContent value="users">
          <UserList refreshTrigger={refreshTrigger} />
        </TabsContent>

        {/* ========================= UNITS ========================= */}
        <TabsContent value="units">
          <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
            {/* FORM */}
            <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm h-fit">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                {editingUnit ? "Edit Unit" : "Tambah Unit"}
              </h2>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  if (!unitName || !unitCode) return;

                  if (editingUnit) {
                    await updateUnit({
                      id: editingUnit.id,
                      name: unitName,
                      code: unitCode,
                    });

                    setEditingUnit(null);
                  } else {
                    await createUnit({
                      name: unitName,
                      code: unitCode,
                    });
                  }

                  setUnitName("");
                  setUnitCode("");

                  await loadAllData();
                }}
                className="space-y-4"
              >
                <Input
                  placeholder="Nama Unit"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  className="rounded-[18px] h-11"
                />

                <Input
                  placeholder="Kode Unit"
                  value={unitCode}
                  onChange={(e) => setUnitCode(e.target.value)}
                  className="rounded-[18px] h-11"
                />

                <Button
                  type="submit"
                  className="w-full bg-[#FF4B4B] hover:bg-[#FF3333] rounded-[18px]"
                >
                  {editingUnit ? "Update Unit" : "Simpan Unit"}
                </Button>
              </form>
            </div>

            {/* LIST */}
            <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Daftar Unit
              </h2>

              <div className="space-y-3">
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    className="flex items-center justify-between rounded-[18px] border border-slate-100 px-4 py-4"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {unit.name}
                      </h3>

                      <p className="text-sm text-slate-500">{unit.code}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-[12px]"
                        onClick={() => {
                          setEditingUnit(unit);

                          setUnitName(unit.name);
                          setUnitCode(unit.code);

                          setActiveTab("units");
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        size="icon"
                        variant="destructive"
                        className="rounded-[12px]"
                        onClick={async () => {
                          await deleteUnit(unit.id);
                          await loadAllData();
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {!loading && units.length === 0 && (
                  <p className="text-sm text-slate-500">Belum ada unit</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ========================= DIVISIONS ========================= */}
        <TabsContent value="divisions">
          <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
            {/* FORM */}
            <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm h-fit">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                {editingDivision ? "Edit Divisi" : "Tambah Divisi"}
              </h2>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  if (!divisionName || !divisionCode || !divisionUnitId) {
                    return;
                  }

                  if (editingDivision) {
                    await updateDivision({
                      id: editingDivision.id,
                      name: divisionName,
                      code: divisionCode,
                      unitId: divisionUnitId,
                    });

                    setEditingDivision(null);
                  } else {
                    await createDivision({
                      name: divisionName,
                      code: divisionCode,
                      unitId: divisionUnitId,
                    });
                  }

                  setDivisionName("");
                  setDivisionCode("");
                  setDivisionUnitId("");

                  await loadAllData();
                }}
                className="space-y-4"
              >
                <select
                  value={divisionUnitId}
                  onChange={(e) => setDivisionUnitId(e.target.value)}
                  className="w-full rounded-[18px] h-11 border border-slate-200 px-4 text-sm"
                >
                  <option value="">Pilih Unit</option>

                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>

                <Input
                  placeholder="Nama Divisi"
                  value={divisionName}
                  onChange={(e) => setDivisionName(e.target.value)}
                  className="rounded-[18px] h-11"
                />

                <Input
                  placeholder="Kode Divisi"
                  value={divisionCode}
                  onChange={(e) => setDivisionCode(e.target.value)}
                  className="rounded-[18px] h-11"
                />

                <Button
                  type="submit"
                  className="w-full bg-[#FF4B4B] hover:bg-[#FF3333] rounded-[18px]"
                >
                  {editingDivision ? "Update Divisi" : "Simpan Divisi"}
                </Button>
              </form>
            </div>

            {/* LIST */}
            <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Daftar Divisi
              </h2>

              <div className="space-y-3">
                {divisions.map((division) => (
                  <div
                    key={division.id}
                    className="flex items-center justify-between rounded-[18px] border border-slate-100 px-4 py-4"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {division.name}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {division.unit?.name} • {division.code}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-[12px]"
                        onClick={() => {
                          setEditingDivision(division);

                          setDivisionName(division.name);
                          setDivisionCode(division.code);
                          setDivisionUnitId(division.unitId);

                          setActiveTab("divisions");
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        size="icon"
                        variant="destructive"
                        className="rounded-[12px]"
                        onClick={async () => {
                          await deleteDivision(division.id);
                          await loadAllData();
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {!loading && divisions.length === 0 && (
                  <p className="text-sm text-slate-500">Belum ada divisi</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
