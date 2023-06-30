import { useContext, createContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../redux/cartSlice";
import { RootState } from "../redux/store";
import { CartItem } from "../types";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { toast } from "react-toastify";

interface TradeVerseNode {
  children: React.ReactNode;
}

interface TradeVerseContextType {
  handleAddToCart: (item: any) => void;
  handleUpdateQuantity: (itemId: number, quantity: number) => void;
  getRoomId: () => Promise<any>;
  handleRemoveFromCart: (itemId: number) => void
  cartItems: CartItem[]
}

const TradeVerse = createContext<TradeVerseContextType | null>(null);

export const TradeVerseProvider: React.FC<TradeVerseNode> = ({ children }) => {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();

  const handleAddToCart = (item: any) => {
    dispatch(addToCart(item));
    toast.success("One item added to cart")
  };

  const handleRemoveFromCart = (itemId: number) => {
    dispatch(removeFromCart(itemId));
  };
  const handleUpdateQuantity = (itemId: number, change: number) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (item) {
      const newQuantity = item.quantity + change;
      dispatch(updateQuantity({ itemId, quantity: newQuantity }));
    }
    console.log(item);
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const getRoomId = async () => {
    try {
      const { data } = await axios.post(
        "https://iriko.testing.huddle01.com/api/v1/create-iframe-room",
        {
          title: "Huddle01-Test",
          roomLocked: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "2PCDD8nmkQavcrdx7GKf2DegWfpPYMnR",
          },
        }
      );
      console.log(data);
      return data.data.roomId;
    } catch (error) {
      console.log(error);
      return "";
    }
  };

  const router = useRouter();

  useEffect(() => {
    const checkUser = () => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/auth.user
          const uid = user.uid;
          // ...
        } else {
          // User is signed out
          router.push("/");
        }
      });
    };
  });

  const contextValue: TradeVerseContextType = {
    handleAddToCart,
    handleUpdateQuantity,
    getRoomId,
    cartItems,
    handleRemoveFromCart
  };

  return (
    <TradeVerse.Provider value={contextValue}>{children}</TradeVerse.Provider>
  );
};

export const useTradeContext = (): TradeVerseContextType => {
  const context = useContext(TradeVerse);

  if (context === null) {
    throw new Error("useTradeContext must be used within a TradeVerseProvider");
  }

  return context;
};
