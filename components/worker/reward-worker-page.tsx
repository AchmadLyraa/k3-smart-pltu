"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Award, Coins, History, RefreshCw, Sparkles } from "lucide-react";

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
	const { toast } = useToast();
	const [loading, setLoading] = useState(true);
	const [redeeming, setRedeeming] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);
	const [balance, setBalance] = useState(0);
	const [rewards, setRewards] = useState<RewardItem[]>([]);
	const [redemptions, setRedemptions] = useState<RedemptionItem[]>([]);
	const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
	const [error, setError] = useState<string | null>(null);

	const fetchDashboard = async () => {
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
	};

	useEffect(() => {
		fetchDashboard();
	}, [refreshKey]);

	const totalRewards = useMemo(() => rewards.length, [rewards.length]);

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
		<div className="space-y-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
						<Sparkles className="h-3.5 w-3.5" />
						Reward Worker Center
					</div>
					<h1 className="mt-3 text-3xl font-bold tracking-tight">
						Tukar Poin dengan Reward
					</h1>
					<p className="mt-2 max-w-2xl text-muted-foreground">
						Pilih reward yang sudah disiapkan admin dan tukarkan poin yang sudah
						Anda kumpulkan.
					</p>
				</div>
				<Button
					variant="outline"
					onClick={() => setRefreshKey((prev) => prev + 1)}
					disabled={loading}
				>
					<RefreshCw className="mr-2 h-4 w-4" />
					Refresh
				</Button>
			</div>

			{error && (
				<Card className="border-destructive/50">
					<CardContent className="pt-6 text-sm text-destructive">
						{error}
					</CardContent>
				</Card>
			)}

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Poin tersedia</CardDescription>
						<CardTitle className="flex items-center gap-2 text-3xl">
							<Coins className="h-5 w-5 text-amber-500" />
							{loading ? "..." : balance.toLocaleString("id-ID")}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Reward aktif</CardDescription>
						<CardTitle className="flex items-center gap-2 text-3xl">
							<Award className="h-5 w-5 text-sky-500" />
							{loading ? "..." : totalRewards}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Riwayat penukaran</CardDescription>
						<CardTitle className="flex items-center gap-2 text-3xl">
							<History className="h-5 w-5 text-emerald-500" />
							{loading ? "..." : redemptions.length}
						</CardTitle>
					</CardHeader>
				</Card>
			</div>

			<div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
				<Card>
					<CardHeader>
						<CardTitle>Katalog Reward</CardTitle>
						<CardDescription>
							Reward yang bisa ditukar dengan poin Anda saat ini.
						</CardDescription>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="py-10 text-center text-sm text-muted-foreground">
								Memuat reward...
							</div>
						) : rewards.length === 0 ? (
							<div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
								Belum ada reward aktif dari admin.
							</div>
						) : (
							<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
								{rewards.map((reward) => {
									const canRedeem = balance >= reward.pointCost && reward.quantity > 0;

									return (
										<div
											key={reward.id}
											className="rounded-xl border bg-card p-4 shadow-sm transition hover:shadow-md"
										>
											<div className="flex items-start justify-between gap-3">
												<div>
													<h3 className="font-semibold leading-tight">
														{reward.name}
													</h3>
													<p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
														{reward.description ||
															"Reward ini belum memiliki deskripsi."}
													</p>
												</div>
												<Badge variant={reward.quantity > 0 ? "default" : "secondary"}>
													{reward.quantity > 0 ? "Tersedia" : "Habis"}
												</Badge>
											</div>

											<Separator className="my-4" />

											<div className="grid grid-cols-2 gap-3 text-sm">
												<div>
													<p className="text-muted-foreground">Harga</p>
													<p className="font-semibold">
														{reward.pointCost.toLocaleString("id-ID")} poin
													</p>
												</div>
												<div>
													<p className="text-muted-foreground">Stok</p>
													<p className="font-semibold">{reward.quantity}</p>
												</div>
											</div>

											<Button
												className="mt-4 w-full"
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

				<Card>
					<CardHeader>
						<CardTitle>Riwayat Penukaran</CardTitle>
						<CardDescription>
							10 transaksi terakhir penukaran reward.
						</CardDescription>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="py-10 text-center text-sm text-muted-foreground">
								Memuat riwayat...
							</div>
						) : redemptions.length === 0 ? (
							<div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
								Belum ada reward yang ditukar.
							</div>
						) : (
							<div className="space-y-3">
								{redemptions.map((item) => (
									<div key={item.id} className="rounded-lg border p-3">
										<div className="flex items-start justify-between gap-3">
											<div>
												<p className="font-medium">{item.reward.name}</p>
												<p className="text-sm text-muted-foreground">
													{item.pointsUsed.toLocaleString("id-ID")} poin
												</p>
											</div>
											<Badge variant="outline">{item.status}</Badge>
										</div>
										<p className="mt-2 text-xs text-muted-foreground">
											{new Date(item.createdAt).toLocaleString("id-ID")}
										</p>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<AlertDialog
				open={!!selectedReward}
				onOpenChange={(open) => !open && setSelectedReward(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Tukar reward ini?</AlertDialogTitle>
						<AlertDialogDescription>
							Anda akan menukar {selectedReward?.name} dengan{" "}
							{selectedReward?.pointCost.toLocaleString("id-ID")} poin. Sisa
							poin Anda setelah transaksi akan diperbarui otomatis.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={redeeming}>Batal</AlertDialogCancel>
						<AlertDialogAction onClick={handleRedeem} disabled={redeeming}>
							{redeeming ? "Memproses..." : "Ya, tukar"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
