"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { getSession } from "@/lib/auth"

declare global {
  interface Window {
    PaystackPop?: {
      setup(opts: Record<string, unknown>): { openIframe(): void }
    }
  }
}

function loadPaystackScript(): Promise<void> {
  if (window.PaystackPop) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const s = document.createElement("script")
    s.src = "https://js.paystack.co/v1/inline.js"
    s.onload = () => resolve()
    s.onerror = () => reject(new Error("Failed to load Paystack script"))
    document.head.appendChild(s)
  })
}

interface EnrollButtonProps {
  slug: string
}

export function EnrollButton({ slug }: EnrollButtonProps) {
  const router  = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEnroll() {
    setError(null)
    setBusy(true)

    try {
      // Fetch authoritative role data (id + price_ngn) from the API
      const roleRes = await api.get<{ data: { role: { id: string; price_ngn: number } } }>(
        `/learning/roles/${slug}`,
      )
      const { id: roleId, price_ngn: priceNgn } = roleRes.data.role

      const session = getSession()
      if (!session) {
        router.push("/login")
        return
      }

      await loadPaystackScript()

      await new Promise<void>((resolve, reject) => {
        const handler = window.PaystackPop!.setup({
          key:    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
          email:  `${session.id}@users.intrainin.com`,
          amount: priceNgn * 100, // kobo
          currency: "NGN",
          metadata: {
            type:    "enrollment",
            user_id: session.id,
            role_id: roleId,
          },
          onSuccess: async (transaction: { reference: string }) => {
            try {
              await api.post("/learning/enrol", {
                roleId,
                paymentReference: transaction.reference,
                paymentType:      "individual",
              })
              resolve()
            } catch (err) {
              reject(err)
            }
          },
          onCancel: () => reject(new Error("cancelled")),
        })
        handler.openIframe()
      })

      router.push(`/learn/${slug}`)
    } catch (err) {
      if (err instanceof Error && err.message !== "cancelled") {
        setError(err.message || "Enrollment failed. Please try again.")
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button size="lg" className="w-full justify-center" onClick={handleEnroll} disabled={busy}>
        {busy ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <>Enroll — full course <ArrowRight className="ml-1 size-4" /></>
        )}
      </Button>
      {error && <p className="text-center text-xs text-destructive">{error}</p>}
    </div>
  )
}
