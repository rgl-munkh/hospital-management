export function ErrorMessage({ error }: { error: string[] | undefined }) {
  if (!error) return null;

  return (
    <p className="text-destructive text-sm">
      {error.map((err) => err).join(", ")}
    </p>
  );
}
