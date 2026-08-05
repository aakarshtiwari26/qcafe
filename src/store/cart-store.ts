import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  menuItemId: string;
  name: string;
  slug: string;
  image?: string;
  price: number;
  discountPrice?: number;
  foodType: "veg" | "non_veg" | "egg";
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        const existing = get().items.find((i) => i.menuItemId === item.menuItemId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity }] });
        }
      },
      removeItem: (menuItemId) => set({ items: get().items.filter((i) => i.menuItemId !== menuItemId) }),
      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set({ items: get().items.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i)) });
      },
      clearCart: () => set({ items: [] }),
    }),
    { name: "qcafe-cart" }
  )
);

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.discountPrice ?? item.price) * item.quantity, 0);
}
