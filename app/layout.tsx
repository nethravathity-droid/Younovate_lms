export const metadata = {
  title: 'Younovate LMS',
  description: 'Younovate LMS payment API (optional)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
