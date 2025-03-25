import { useState } from "react";
import { useCart } from "../../CartContext";

export default function InputQuantityCom({ cartIndex = 0 }) {
  const { cart, getTotalQuantity, getTotalPrice, addItemToCart, removeItemFromCart, increaseQuantity, decreaseQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);
  const increment = () => {
    setQuantity((prev) => prev + 1);
  };
  const decrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };
  return (
    <div className="w-[120px] h-[40px] px-[26px] flex items-center border border-qgray-border">
      <div className="flex justify-between items-center w-full">
        <button
          onClick={() => decreaseQuantity(cart.items[cartIndex].productId)}
          type="button"
          className="text-base text-qgray"
        >
          -
        </button>
        <span className="text-qblack">{cart.items[cartIndex].quantity}</span>
        <button
          onClick={() => increaseQuantity(cart.items[cartIndex].productId)}
          type="button"
          className="text-base text-qgray"
        >
          +
        </button>
      </div>
    </div>
  );
}
