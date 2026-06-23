export function Footer() {
  return (
    <footer className="border-t border-border py-6 bg-background">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>Fill the Frames &copy; {new Date().getFullYear()}. Built for satellite-science.</p>
      </div>
    </footer>
  );
}
