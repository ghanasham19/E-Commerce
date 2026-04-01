
package com.example.backend.repository;

import com.example.backend.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    // Custom method to find the specific cart belonging to a user
    Optional<Cart> findByUserId(Long userId);
}