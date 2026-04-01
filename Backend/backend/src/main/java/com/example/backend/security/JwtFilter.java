package com.example.backend.security;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // 1. Look for the token in the header
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // Remove "Bearer " prefix
            try {
                email = jwtUtil.extractEmail(token); // Extract the email from the token
            } catch (Exception e) {
                System.out.println("Invalid or Expired Token!");
            }
        }

        // 2. If the token is good, authenticate the user in Spring Security
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            User user = userRepository.findByEmail(email).orElse(null);
            
            if (user != null) {
                // Attach their Role (USER or ADMIN) so Spring knows what they are allowed to do
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        user, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole())));
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Let them in!
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        // Continue to the next step
        filterChain.doFilter(request, response);
    }
}