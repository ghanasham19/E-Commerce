package com.example.backend.service;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder; // NEW IMPORT
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // INJECT THE SCRAMBLER

    public User registerUser(User user) {
        // Check if email already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered.");
        }
        
        // SCRAMBLE THE PASSWORD BEFORE SAVING!
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);
        
        return userRepository.save(user);
    }

    // We will update the login method in the next step when we generate the JWT!
    public User loginUser(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Since the database has scrambled passwords, we can't just use .equals() anymore.
            // We must use the encoder to check if the typed password matches the scrambled one.
            if (passwordEncoder.matches(password, user.getPassword())) {
                return user;
            }
        }
        throw new RuntimeException("Invalid email or password");
    }
}