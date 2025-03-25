import React, { createContext, useContext, useEffect, useReducer } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
        const existingItemIndex = state.items.findIndex(item => item.productId === action.payload.productId);
        let updatedAddItems;
        if (existingItemIndex > -1) {
            const updatedItem = { ...state.items[existingItemIndex], quantity: state.items[existingItemIndex].quantity + 1 };
            updatedAddItems = [...state.items];
            updatedAddItems[existingItemIndex] = updatedItem;
        } else {
            updatedAddItems = [...state.items, { ...action.payload, quantity: 1 }];
        }
        localStorage.setItem('cart', JSON.stringify(updatedAddItems));
        return { ...state, items: updatedAddItems };
    case 'REMOVE_FROM_CART':
        const updatedRemovedItems = state.items.filter(item => item.productId !== action.payload);
        localStorage.setItem('cart', JSON.stringify(updatedRemovedItems));
        return { ...state, items: updatedRemovedItems };
    
    case 'INCREASE_QUANTITY':
        const indexIncrease = state.items.findIndex(item => item.productId === action.payload);
        const updatedItemIncrease = { ...state.items[indexIncrease], quantity: state.items[indexIncrease].quantity + 1 };
        const updatedItemsIncrease = [...state.items];
        updatedItemsIncrease[indexIncrease] = updatedItemIncrease;
        return { ...state, items: updatedItemsIncrease };
    case 'DECREASE_QUANTITY':
        const indexDecrease = state.items.findIndex(item => item.productId === action.payload);
        if (state.items[indexDecrease].quantity > 1) {
            const updatedItemDecrease = { ...state.items[indexDecrease], quantity: state.items[indexDecrease].quantity - 1 };
            const updatedItemsDecrease = [...state.items];
            updatedItemsDecrease[indexDecrease] = updatedItemDecrease;
            return { ...state, items: updatedItemsDecrease };
        }
    case 'CLEAR_CART':
        localStorage.removeItem('cart');
        return { ...state, items: [] };
    default:
        return state;
  }
};

const CartProvider = ({ children }) => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const [state, dispatch] = useReducer(cartReducer, { items: savedCart });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(state.items));
    }, [state.items]);

    const addItemToCart = (item) => {
        dispatch({ type: 'ADD_TO_CART', payload: item });
    };

    const removeItemFromCart = (productId) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    };
    
    
    const getTotalQuantity = () => {
        return state.items.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return state.items.reduce((total, item) => total + (item.variants[0].price * item.quantity), 0);
    };
    
    const increaseQuantity = (productId) => {
        dispatch({ type: 'INCREASE_QUANTITY', payload: productId });
    };

    const decreaseQuantity = (productId) => {
        dispatch({ type: 'DECREASE_QUANTITY', payload: productId });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    return (
        <CartContext.Provider value={{ cart: state, addItemToCart, removeItemFromCart, getTotalQuantity, getTotalPrice , increaseQuantity, decreaseQuantity , clearCart}}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);

export default CartProvider;
