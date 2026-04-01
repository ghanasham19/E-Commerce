package com.example.backend.controller;

import com.example.backend.dto.LoginResponse;
import com.example.backend.model.User;
import com.example.backend.security.JwtUtil;
import com.example.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            return ResponseEntity.ok(authService.registerUser(user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
        try {
            User authenticatedUser = authService.loginUser(loginRequest.getEmail(), loginRequest.getPassword());
            String token = jwtUtil.generateToken(authenticatedUser);
            return ResponseEntity.ok(new LoginResponse(token, authenticatedUser));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}