package com.example.backend.service;

import com.example.backend.dto.CartRequest;
import com.example.backend.model.Cart;
import com.example.backend.model.CartItem;
import com.example.backend.model.Product;
import com.example.backend.model.User;
import com.example.backend.repository.CartItemRepository;
import com.example.backend.repository.CartRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public CartItem addToCart(CartRequest request) {
        // 1. Find User and Product
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // 2. Find or create the user's cart
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });

        // 3. Create the CartItem with dynamic custom printing details
        CartItem cartItem = new CartItem();
        cartItem.setCart(cart);
        cartItem.setProduct(product);
        cartItem.setQuantity(request.getQuantity());
        
        // NEW: Save the dynamic options JSON (e.g., {"Size": "M", "Mug Type": "Magic"})
        cartItem.setSelectedOptions(request.getSelectedOptions());
        
        cartItem.setCustomText(request.getCustomText());
        cartItem.setDesignImage(request.getDesignImage());

        return cartItemRepository.save(cartItem);
    }

    public Cart getCartByUserId(Long userId) {
        return cartRepository.findByUserId(userId).orElse(null);
    }

    @Transactional
    public void removeCartItem(Long cartItemId) {
        // 1. Find the exact item we want to delete
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("CartItem not found"));

        // 2. Find the Cart that owns this item
        Cart cart = item.getCart();
        
        if (cart != null) {
            // 3. Break the memory link! Tell the cart to let go of the item
            cart.getCartItems().remove(item);
            cartRepository.save(cart); // Save the cart without the item in it
        }

        // 4. Now that the Cart let go, we can safely delete the item from MySQL
        cartItemRepository.delete(item);
    }
}