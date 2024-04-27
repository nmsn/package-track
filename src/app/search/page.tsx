const PackageItem = () => {
  return (<div className="flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent">
    <div className="flex items-center">
      <span className="flex items-center gap-2 font-semibold">Title</span>
      <span className="ml-auto text-xs text-muted-foreground">Time</span>
    </div>
    <div></div>
  </div>);
};

export default function Page() {
  return <div className="p-4">Hollo</div>
}