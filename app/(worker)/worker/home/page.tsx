import { auth } from "@/auth";

export const metadata = {
  title: "Home - K3 SMART",
};

export default async function WorkerHomePage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-3xl font-bold">
        Selamat datang, {session?.user?.name}!
      </h1>
      <p className="text-muted-foreground mt-2">
        Dashboard pekerja - fitur materi, quiz, poin segera hadir
      </p>
    </div>
  );
}
