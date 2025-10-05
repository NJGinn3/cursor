import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome to Violet & Olive</h1>
      <p className="max-w-2xl opacity-90">
        A playful, consent-first space for kink compatibility, Dom/Sub matching,
        habits, rewards, punishments, and community competitions.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Link href="/profile" className="card p-4 hover:opacity-95">
          <div className="font-semibold">Profile</div>
          <div className="text-sm opacity-70">Set your role and bio</div>
        </Link>
        <Link href="/kinks" className="card p-4 hover:opacity-95">
          <div className="font-semibold">Kink Ratings</div>
          <div className="text-sm opacity-70">Rate: Go / Maybe / No-Go</div>
        </Link>
        <Link href="/match" className="card p-4 hover:opacity-95">
          <div className="font-semibold">Matches</div>
          <div className="text-sm opacity-70">Find compatible partners</div>
        </Link>
        <Link href="/pairings" className="card p-4 hover:opacity-95">
          <div className="font-semibold">Pairings</div>
          <div className="text-sm opacity-70">Requests and status</div>
        </Link>
        <Link href="/chat" className="card p-4 hover:opacity-95">
          <div className="font-semibold">Chat</div>
          <div className="text-sm opacity-70">Talk to your partner</div>
        </Link>
        <Link href="/habits" className="card p-4 hover:opacity-95">
          <div className="font-semibold">Habits</div>
          <div className="text-sm opacity-70">Earn points and level up</div>
        </Link>
        <Link href="/rewards" className="card p-4 hover:opacity-95">
          <div className="font-semibold">Rewards</div>
          <div className="text-sm opacity-70">Redeem points</div>
        </Link>
        <Link href="/punishments" className="card p-4 hover:opacity-95">
          <div className="font-semibold">Punishments</div>
          <div className="text-sm opacity-70">Manage consequences</div>
        </Link>
        <Link href="/competitions" className="card p-4 hover:opacity-95">
          <div className="font-semibold">Competitions</div>
          <div className="text-sm opacity-70">Join games and leaderboards</div>
        </Link>
      </div>
    </div>
  );
}
