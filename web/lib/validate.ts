export function zodErr(result: any): string {
  return result?.error?.issues?.[0]?.message ?? result?.error?.errors?.[0]?.message ?? "Validation error";
}

export function validate<T>(schema: { safeParse: (v: any) => any }, data: unknown): { ok: true; data: T } | { ok: false; message: string } {
  const r = schema.safeParse(data);
  if (!r.success) return { ok: false, message: zodErr(r) };
  return { ok: true, data: r.data as T };
}
