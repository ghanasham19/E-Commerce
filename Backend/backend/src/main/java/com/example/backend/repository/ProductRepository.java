package com.example.backend.repository;

import com.example.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // 1. For clicking a Category: Finds all products that belong to a specific category ID
    List<Product> findByCategoryId(Long categoryId);
    
    // 2. For the "Trending" section: Finds all products where isTrending is true
    List<Product> findByIsTrendingTrue();
    
    // 3. For the "Newly Added" section: Sorts by creation date and grabs the latest 8!
    List<Product> findTop8ByOrderByCreatedAtDesc();
}