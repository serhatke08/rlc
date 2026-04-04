import "server-only";

/**
 * RSC → Client bileşen sınırında yalnızca düz JSON uyumlu değerler geçer.
 * jsonb/metadata içinde beklenmedik tipler (ör. BigInt) sunucu hatasına yol açabilir.
 */
export function jsonForClientBoundary<T>(value: T): T {
  try {
    return JSON.parse(
      JSON.stringify(value, (_key, v) => (typeof v === "bigint" ? v.toString() : v)),
    ) as T;
  } catch (err) {
    console.error("[rsc-serialize] jsonForClientBoundary failed:", err);
    return value;
  }
}
