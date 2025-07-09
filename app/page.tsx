import ChatPopup from "@/components/ChatPopup";


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="h-screen w-full bg-black">
       <ChatPopup />
      </div>
    </main>
  );
}
