import logoAsset from "@/assets/evolution-logo.png.asset.json";

export function BrandLogo({ size = 40, withText = false }: { size?: number; withText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={logoAsset.url}
        alt="Evolution Gym"
        width={size}
        height={size}
        className="rounded-full"
        style={{ width: size, height: size, objectFit: "cover" }}
      />
      {withText && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-lg tracking-wider text-foreground">EVOLUTION</span>
          <span className="text-[10px] tracking-[0.35em] text-muted-foreground">GYM HUÁNUCO</span>
        </div>
      )}
    </div>
  );
}