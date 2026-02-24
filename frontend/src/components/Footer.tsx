import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-burgundy-border">
      <div className="container py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-taupe">
            &copy; {new Date().getFullYear()} Masashi Enokida. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy/" className="text-xs text-taupe hover:text-white transition-colors">
              プライバシーポリシー
            </Link>
            <Link href="/legal/" className="text-xs text-taupe hover:text-white transition-colors">
              特定商取引法に基づく表記
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
