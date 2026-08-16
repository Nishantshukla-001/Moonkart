"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { toast } from "sonner";
import { MapPin, Plus, ShoppingBag, Truck } from "lucide-react";

import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { AspectImage } from "@/components/shared/AspectImage";
import { EmptyState } from "@/components/shared/EmptyState";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AddressCard } from "@/features/addresses/components/AddressCard";
import { AddressFormDialog } from "@/features/addresses/components/AddressFormDialog";
import { ROUTES } from "@/constants/routes";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/utils/formatCurrency";
import type { IAddress } from "@/types/address";
import type { RazorpayCheckoutOptions, RazorpayPaymentSuccessResponse } from "@/types/razorpay";

interface CheckoutCustomer {
  name: string;
  email: string;
  phone: string;
}

export function CheckoutClient({
  addresses: initialAddresses,
  customer,
}: {
  addresses: IAddress[];
  customer: CheckoutCustomer;
}) {
  const router = useRouter();
  const items = useCart((state) => state.items);
  const subtotal = useCart((state) => state.subtotal);
  const isLoading = useCart((state) => state.isLoading);

  const [addresses, setAddresses] = useState(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState(
    initialAddresses.find((address) => address.isDefault)?.id ?? initialAddresses[0]?.id
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IAddress | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [finalizationError, setFinalizationError] = useState<string | null>(null);

  const shippingCharge = 0;
  const discount = 0;
  const tax = 0;
  const grandTotal = subtotal - discount + shippingCharge + tax;

  function handleAddressSaved(address: IAddress) {
    setAddresses((current) => {
      const withoutSaved = current.filter((item) => item.id !== address.id);
      const next = address.isDefault
        ? withoutSaved.map((item) => ({ ...item, isDefault: false }))
        : withoutSaved;
      return [address, ...next].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
    });
    setSelectedAddressId(address.id);
  }

  async function verifyPayment(paymentResponse: RazorpayPaymentSuccessResponse) {
    // Dispatched together rather than one-after-another — /complete-order
    // independently re-verifies this same signature itself (it never trusts
    // /verify's result), so the two requests don't actually depend on each
    // other; only the UI's *handling* of the results still happens in the
    // original order below. This removes a full network round trip from
    // the wait between payment and redirect. No UI is shown between the two
    // calls today, so there is no visible behavior change — only which of
    // the two original error branches fires (verify-network-failure vs.
    // complete-order-network-failure) is preserved via `allSettled` so each
    // keeps its own original message.
    const [verifySettled, completeSettled] = await Promise.allSettled([
      fetch("/api/payments/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentResponse),
      }).then((response) => response.json()),
      fetch("/api/payments/razorpay/complete-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId: selectedAddressId, ...paymentResponse }),
      }).then((response) => response.json()),
    ]);

    if (verifySettled.status === "rejected") {
      toast.error("Could not verify payment. Please contact support if the amount was deducted.");
      setIsPlacingOrder(false);
      return;
    }

    const verifyResult = verifySettled.value;
    if (!verifyResult.success || !verifyResult.data?.verified) {
      toast.error(verifyResult.message || "Payment verification failed. Please contact support if the amount was deducted.");
      setIsPlacingOrder(false);
      return;
    }

    // Payment is verified — check the Order finalization outcome. If this
    // failed, the Razorpay payment has still succeeded, so the shopper must
    // never be sent back to "Pay Now" (that would charge them a second
    // time). `finalizationError` replaces the button with a static message
    // instead.
    if (completeSettled.status === "rejected") {
      setFinalizationError(
        `Your payment (ID: ${paymentResponse.razorpay_payment_id}) was received, but we couldn't confirm your order due to a connection issue. Please contact support with this Payment ID — do not pay again.`
      );
      return;
    }

    const completeResult = completeSettled.value;
    if (!completeResult.success || !completeResult.data) {
      setFinalizationError(
        `Your payment (ID: ${paymentResponse.razorpay_payment_id}) was received, but we couldn't finalize your order automatically. Please contact support with this Payment ID — do not pay again.`
      );
      return;
    }

    await useCart.getState().clear();
    router.push(ROUTES.checkoutSuccess(completeResult.data.orderNumber));
  }

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      toast.error("Select a shipping address to continue.");
      return;
    }
    if (items.length === 0 || isPlacingOrder) return;

    const RazorpayCheckout = window.Razorpay;
    if (!RazorpayCheckout) {
      toast.error("Payment gateway is still loading. Please try again in a moment.");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const response = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(grandTotal * 100),
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        }),
      });
      const result = await response.json();

      if (!result.success || !result.data) {
        toast.error(result.message || "Could not start payment. Please try again.");
        setIsPlacingOrder(false);
        return;
      }

      const razorpayOrder = result.data as { id: string; amount: number; currency: string; key: string };

      const options: RazorpayCheckoutOptions = {
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "MoonKart",
        description: "Order Payment",
        order_id: razorpayOrder.id,
        prefill: {
          name: customer.name || undefined,
          email: customer.email || undefined,
          contact: customer.phone || undefined,
        },
        handler: (paymentResponse) => {
          void verifyPayment(paymentResponse);
        },
        modal: {
          // Fires when the shopper closes the Checkout overlay without
          // completing payment — close gracefully rather than treating it
          // as an error, since nothing has failed.
          ondismiss: () => {
            setIsPlacingOrder(false);
            toast("Payment cancelled.");
          },
        },
      };

      new RazorpayCheckout(options).open();
    } catch {
      toast.error("Could not reach the server. Check your connection and try again.");
      setIsPlacingOrder(false);
    }
  }

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <div>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart", href: ROUTES.cart }, { label: "Checkout" }]} />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">Checkout</h1>
      </div>

      {isLoading ? (
        <p className="text-text-secondary">Loading your order...</p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          description="Add something you love before checking out."
          actionLabel="Shop Products"
          onAction={() => router.push(ROUTES.products)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-lg font-semibold text-text-primary">
                  Shipping Address
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                >
                  <Plus /> Add New
                </Button>
              </div>

              {addresses.length === 0 ? (
                <EmptyState
                  icon={MapPin}
                  title="No saved addresses"
                  description="Add a delivery address to continue."
                  actionLabel="Add Address"
                  onAction={() => setFormOpen(true)}
                  className="py-10"
                />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {addresses.map((address) => (
                    <AddressCard
                      key={address.id}
                      address={address}
                      selectable
                      selected={selectedAddressId === address.id}
                      onSelect={() => setSelectedAddressId(address.id)}
                      onEdit={() => {
                        setEditing(address);
                        setFormOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </Card>

            <Card className="flex items-center gap-3 p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blush-light">
                <Truck className="size-5 text-blush-hover" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-heading text-sm font-semibold text-text-primary">Delivery Details</h2>
                <p className="text-sm text-text-secondary">
                  Estimated delivery in 5–7 business days. Secure payment powered by Razorpay.
                </p>
              </div>
            </Card>
          </div>

          <Card className="h-fit p-6">
            <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Order Summary</h2>

            <div className="flex flex-col gap-4 border-b border-divider pb-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="size-14 shrink-0">
                    <AspectImage src={item.image} alt={item.name} ratio="square" rounded="rounded-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-1 text-sm font-medium text-text-primary">{item.name}</p>
                    <p className="text-xs text-text-muted">Qty {item.quantity}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-text-primary">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 border-b border-divider py-4 text-sm">
              <div className="flex items-center justify-between text-text-secondary">
                <span>Subtotal</span>
                <span className="font-medium text-text-primary">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-text-secondary">
                <span>Delivery Charges</span>
                <span className="font-medium text-success">
                  {shippingCharge === 0 ? "Free" : formatCurrency(shippingCharge)}
                </span>
              </div>
              <div className="flex items-center justify-between text-text-secondary">
                <span>Discount</span>
                <span className="font-medium text-text-primary">
                  {discount === 0 ? "—" : `-${formatCurrency(discount)}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-text-secondary">
                <span>Taxes</span>
                <span className="font-medium text-text-primary">
                  {tax === 0 ? "Included" : formatCurrency(tax)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-4 font-heading text-base font-semibold text-text-primary">
              <span>Grand Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>

            {finalizationError ? (
              <Alert variant="destructive">
                <AlertTitle>Payment received</AlertTitle>
                <AlertDescription>{finalizationError}</AlertDescription>
              </Alert>
            ) : (
              <Button
                size="lg"
                className="w-full"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !selectedAddressId}
              >
                {isPlacingOrder ? "Processing Payment…" : "Pay Now"}
              </Button>
            )}
          </Card>
        </div>
      )}

      <AddressFormDialog open={formOpen} onOpenChange={setFormOpen} address={editing} onSaved={handleAddressSaved} />
    </Container>
  );
}
