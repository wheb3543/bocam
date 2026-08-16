export function completeMediaSelection(
  url: string,
  onSelect: (url: string) => void,
  onOpenChange: (open: boolean) => void
) {
  onSelect(url);
  onOpenChange(false);
}
