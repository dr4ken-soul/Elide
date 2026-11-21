export function Token({ value }: { value: string }) {
  return <span className="token-chip select-all px-1 text-[11px]">{value}</span>
}
