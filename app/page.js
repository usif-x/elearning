import Button from "@/components/ui/Button";
export default function Home() {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <h1 className="text-4xl font-bold">
          Welcome to the E-Learning Platform
        </h1>
        <p className="mt-4 text-lg">
          Explore our courses and enhance your skills!
        </p>
        <Button text="اضغط هنا" outline={true} color="red" shade={600} />
      </main>
    </>
  );
}
