interface SettingsHeaderProps {
  title: string;
  description: string;
}

export function SettingsHeader({ title, description }: SettingsHeaderProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}
