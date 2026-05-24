"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
	getWorkerRewardDashboard,
	redeemReward,
} from "@/app/actions/worker-rewards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Award, Coins, History, RefreshCw, Sparkles, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

type RewardItem = {
	id: string;
	name: string;
	description?: string | null;
	pointCost: number;
	quantity: number;
	status: string;
	createdAt: string | Date;
};

type RedemptionItem = {
	id: string;
	status: string;
	shippingStatus?: string | null;
	pointsUsed: number;
	createdAt: string | Date;
	completedAt?: string | Date | null;
	reward: {
		id: string;
		name: string;
		pointCost: number;
	};
};

export default function RewardUsersPage() {
	const router = useRouter();
	const { toast } = useToast();
	const [mounted, setMounted] = useState(false);
	const [loading, setLoading] = useState(true);
	const [redeeming, setRedeeming] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);
	const [balance, setBalance] = useState(0);
	const [rewards, setRewards] = useState<RewardItem[]>([]);
	const [redemptions, setRedemptions] = useState<RedemptionItem[]>([]);
	const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	const fetchDashboard = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const result = await getWorkerRewardDashboard();

			if (result.success && result.data) {
				setBalance(result.data.balance ?? 0);
				setRewards(result.data.rewards ?? []);
				setRedemptions(result.data.redemptions ?? []);
			} else {
				setError(result.error || "Gagal memuat data reward");
			}
		} catch (err) {
			console.error("Error loading reward dashboard:", err);
			setError("Terjadi kesalahan saat memuat halaman reward");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchDashboard();
	}, [fetchDashboard, refreshKey]);

	const totalRewards = useMemo(() => rewards.length, [rewards.length]);

	if (!mounted) {
		return (
			<div className="space-y-4 animate-in fade-in duration-500 pb-16">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div className="space-y-3">
						<div className="h-5 w-40 rounded-full bg-muted animate-pulse" />
						<div className="h-10 w-72 rounded-lg bg-muted animate-pulse" />
						<div className="h-5 w-96 rounded-full bg-muted animate-pulse" />
					</div>
					<div className="h-9 w-24 rounded-md bg-muted animate-pulse" />
				</div>
				<div className="grid gap-4 md:grid-cols-3">
					<div className="h-24 rounded-2xl border bg-muted/40 animate-pulse" />
					<div className="h-24 rounded-2xl border bg-muted/40 animate-pulse" />
					<div className="h-24 rounded-2xl border bg-muted/40 animate-pulse" />
				</div>
				<div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
					<div className="h-[420px] rounded-3xl border bg-muted/30 animate-pulse" />
					<div className="h-[420px] rounded-3xl border bg-muted/30 animate-pulse" />
				</div>
			</div>
		);
	}

	const handleRedeem = async () => {
		if (!selectedReward) return;

		setRedeeming(true);
		try {
			const result = await redeemReward(selectedReward.id);

			if (result.success) {
				toast({
					title: "Berhasil",
					description: result.message || "Reward berhasil ditukar",
				});
				setSelectedReward(null);
				setRefreshKey((prev) => prev + 1);
			} else {
				toast({
					title: "Gagal",
					description: result.error || "Gagal menukar reward",
					variant: "destructive",
				});
			}
		} finally {
			setRedeeming(false);
		}
	};

	return (
		<div className="space-y-6 animate-in fade-in duration-500 pb-16 px-2">
			{/* Back Button */}
			<button
				onClick={() => router.push("/worker/home")}
				className="w-10 h-10 rounded-full bg-white border border-zinc-200/60 flex items-center justify-center text-zinc-900 active:scale-95 transition-all shrink-0 shadow-sm"
			>
				<ChevronLeft className="w-6 h-6 stroke-[2.5]" />
			</button>

			{/* Top Header Banner */}
			<div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-zinc-950 via-red-950 to-red-600 p-6 md:p-7 text-white shadow-xl border border-red-900/30">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(239,68,68,0.25),transparent_45%)] pointer-events-none" />
				<div className="absolute -right-10 -bottom-10 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
				<div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
					<Gift className="w-52 h-52 text-white" />
				</div>
				<div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

				<div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<span className="p-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30">
								<Gift className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
							</span>
							<span className="text-[10px] font-bold tracking-wider uppercase text-red-300 flex items-center gap-1">
								Reward Center <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
							</span>
						</div>
						<h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight" style={{ fontFamily: 'Buckin, sans-serif' }}>
							Tukar Poin Dengan Hadiah
						</h1>
						<p className="text-xs md:text-sm text-red-100/80 font-medium max-w-xl">
							Redeem poin yang sudah Anda kumpulkan dengan berbagai jenis merchandise eksklusif K3 Smart.
						</p>
					</div>

					<Button
						variant="outline"
						onClick={() => setRefreshKey((prev) => prev + 1)}
						disabled={loading}
						className="bg-white/10 border-white/10 hover:bg-white/20 text-white rounded-2xl h-11 px-4 text-xs font-bold shadow-sm shrink-0 active:scale-95 transition-all"
					>
						<RefreshCw className="mr-2 h-4 w-4" />
						Refresh Katalog
					</Button>
				</div>
			</div>

			{error && (
				<Card className="border-red-200 bg-red-50/50 rounded-3xl">
					<CardContent className="pt-6 text-xs font-bold text-red-600 uppercase tracking-wider text-center">
						{error}
					</CardContent>
				</Card>
			)}

			{/* Stats Grid */}
			<div className="grid gap-4 md:grid-cols-3">
				<div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] flex items-center justify-between hover:shadow-[0_6px_25px_-6px_rgba(0,0,0,0.04)] transition-all duration-300">
					<div className="space-y-1">
						<span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Poin Tersedia</span>
						<h3 className="text-2xl font-black text-zinc-950 font-mono tracking-tight" style={{ fontFamily: 'Buckin, sans-serif' }}>
							{loading ? "..." : balance.toLocaleString("id-ID")}
						</h3>
					</div>
					<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shadow-sm border border-amber-100/50">
						<Coins className="h-5.5 w-5.5" />
					</div>
				</div>

				<div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] flex items-center justify-between hover:shadow-[0_6px_25px_-6px_rgba(0,0,0,0.04)] transition-all duration-300">
					<div className="space-y-1">
						<span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Reward Aktif</span>
						<h3 className="text-2xl font-black text-zinc-950 font-mono tracking-tight" style={{ fontFamily: 'Buckin, sans-serif' }}>
							{loading ? "..." : totalRewards}
						</h3>
					</div>
					<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-500 shadow-sm border border-red-100/50">
						<Award className="h-5.5 w-5.5" />
					</div>
				</div>

				<div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] flex items-center justify-between hover:shadow-[0_6px_25px_-6px_rgba(0,0,0,0.04)] transition-all duration-300">
					<div className="space-y-1">
						<span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Riwayat Penukaran</span>
						<h3 className="text-2xl font-black text-zinc-950 font-mono tracking-tight" style={{ fontFamily: 'Buckin, sans-serif' }}>
							{loading ? "..." : redemptions.length}
						</h3>
					</div>
					<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 shadow-sm border border-emerald-100/50">
						<History className="h-5.5 w-5.5" />
					</div>
				</div>
			</div>

			{/* Main Catalog & History Layout */}
			<div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
				{/* Catalog Section */}
				<Card className="border border-zinc-200 bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
					<CardHeader className="pb-3 pt-5 px-6 border-b border-zinc-100">
						<CardTitle className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider">Katalog Reward</CardTitle>
						<CardDescription className="text-xs font-semibold text-zinc-400">
							Pilih item yang tersedia di bawah ini dan klik tukar untuk meredeem poin Anda.
						</CardDescription>
					</CardHeader>
					<CardContent className="p-6">
						{loading ? (
							<div className="py-12 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
								Memuat daftar katalog reward...
							</div>
						) : rewards.length === 0 ? (
							<div className="rounded-3xl border border-dashed border-zinc-200 p-12 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">
								Belum ada reward aktif yang dapat ditukarkan saat ini.
							</div>
						) : (
							<div className="grid gap-5 md:grid-cols-2">
								{rewards.map((reward) => {
									const canRedeem = balance >= reward.pointCost && reward.quantity > 0;

									return (
										<div
											key={reward.id}
											className="group flex flex-col justify-between rounded-3xl border border-zinc-150 bg-white p-5 shadow-sm transition-all duration-300 hover:border-red-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-8px_rgba(239,68,68,0.12)]"
										>
											<div>
												<div className="flex items-start justify-between gap-3">
													<h3 className="font-extrabold text-sm text-zinc-950 group-hover:text-red-600 transition-colors leading-tight">
														{reward.name}
													</h3>
													<Badge 
														className={cn(
															"rounded-full border-0 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-sm",
															reward.quantity > 0 ? "bg-emerald-500 hover:bg-emerald-500" : "bg-zinc-300 hover:bg-zinc-300 text-zinc-600"
														)}
													>
														{reward.quantity > 0 ? "Tersedia" : "Habis"}
													</Badge>
												</div>
												<p className="mt-2 line-clamp-3 text-[11px] font-semibold text-zinc-400 leading-relaxed">
													{reward.description ||
														"Reward eksklusif edisi terbatas dari K3 Smart PLTU."}
												</p>
											</div>

											<Separator className="my-4" />

											<div className="grid grid-cols-2 gap-3 text-xs">
												<div className="space-y-0.5">
													<p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Harga</p>
													<p className="font-black text-amber-600 flex items-center gap-1" style={{ fontFamily: 'Buckin, sans-serif' }}>
														<Coins className="h-3.5 w-3.5" />
														{reward.pointCost.toLocaleString("id-ID")} Pts
													</p>
												</div>
												<div className="space-y-0.5">
													<p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Sisa Stok</p>
													<p className="font-black text-zinc-950 font-mono">
														{reward.quantity} pcs
													</p>
												</div>
											</div>

											<Button
												className={cn(
													"mt-5 w-full rounded-2xl py-5 text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-sm",
													canRedeem 
														? "bg-red-600 hover:bg-red-700 text-white shadow-red-500/10 hover:shadow-red-500/20" 
														: "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200/40"
												)}
												disabled={!canRedeem}
												onClick={() => setSelectedReward(reward)}
											>
												{balance < reward.pointCost
													? "Poin Tidak Cukup"
													: reward.quantity <= 0
														? "Stok Habis"
														: "Tukar Reward"}
											</Button>
										</div>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Redemption History Section */}
				<Card className="border border-zinc-200 bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
					<CardHeader className="pb-3 pt-5 px-6 border-b border-zinc-100">
						<CardTitle className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider">Riwayat Penukaran</CardTitle>
						<CardDescription className="text-xs font-semibold text-zinc-400">
							10 transaksi terakhir penukaran reward.
						</CardDescription>
					</CardHeader>
					<CardContent className="p-5">
						{loading ? (
							<div className="py-12 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
								Memuat riwayat transaksi...
							</div>
						) : redemptions.length === 0 ? (
							<div className="rounded-3xl border border-dashed border-zinc-200 p-10 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">
								Belum ada pengajuan penukaran reward.
							</div>
						) : (
							<div className="space-y-4">
								{redemptions.map((item) => (
									<div 
										key={item.id} 
										className="group flex flex-col gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 hover:bg-zinc-50 hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] transition-all duration-300"
									>
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0 flex-1">
												<p className="font-bold text-xs text-zinc-950 truncate leading-snug group-hover:text-red-600 transition-colors">
													{item.reward.name}
												</p>
												<p className="mt-1 text-[10px] font-black text-amber-600 flex items-center gap-1" style={{ fontFamily: 'Buckin, sans-serif' }}>
													<Coins className="h-3 w-3" />
													{item.pointsUsed.toLocaleString("id-ID")} Pts
												</p>
											</div>
											<div className="flex flex-col items-end gap-1 shrink-0">
												<Badge 
													variant="outline" 
													className={cn(
														"rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider shadow-sm",
														item.status === "APPROVED" || item.status === "SUCCESS"
															? "bg-green-50 text-green-700 border-green-200"
															: item.status === "PENDING"
															? "bg-amber-50 text-amber-700 border-amber-200"
															: "bg-red-50 text-red-700 border-red-200"
													)}
												>
													{item.status === "APPROVED" ? "DISETUJUI" : item.status === "PENDING" ? "PROSES" : item.status}
												</Badge>
												<Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[8px] font-bold text-zinc-500 uppercase tracking-wide">
													{item.shippingStatus || "Sedang diproses"}
												</Badge>
											</div>
										</div>
										<p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide border-t border-zinc-200/50 pt-2 flex items-center justify-between">
											<span>Pengajuan ditukar</span>
											<span className="font-mono">{new Date(item.createdAt).toLocaleString("id-ID", {
												day: "numeric",
												month: "short",
												year: "numeric",
												hour: "2-digit",
												minute: "2-digit"
											})}</span>
										</p>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Confirm Dialog */}
			<AlertDialog
				open={!!selectedReward}
				onOpenChange={(open) => !open && setSelectedReward(null)}
			>
				<AlertDialogContent className="rounded-3xl max-w-sm">
					<AlertDialogHeader>
						<AlertDialogTitle className="font-bold text-zinc-950">Tukar reward ini?</AlertDialogTitle>
						<AlertDialogDescription className="text-xs font-semibold text-zinc-500 leading-relaxed">
							Anda akan mengajukan penukaran <span className="font-bold text-red-600">{selectedReward?.name}</span> menggunakan saldo sebesar <span className="font-bold text-amber-600">{selectedReward?.pointCost.toLocaleString("id-ID")} poin</span>. Saldo poin Anda akan didebet secara otomatis setelah proses disetujui.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
						<AlertDialogCancel disabled={redeeming} className="rounded-2xl border-zinc-200 text-xs font-bold uppercase tracking-wider py-2.5 shadow-sm active:scale-95 transition-all">Batal</AlertDialogCancel>
						<AlertDialogAction 
							onClick={handleRedeem} 
							disabled={redeeming}
							className="rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider py-2.5 shadow-sm active:scale-95 transition-all"
						>
							{redeeming ? "Memproses..." : "Ya, Tukar"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
