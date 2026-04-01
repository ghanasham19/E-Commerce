package com.example.backend.controller;

import com.example.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        try {
            double amount = Double.parseDouble(data.get("amount").toString());
            String orderResponse = paymentService.createOrder(amount);
            return ResponseEntity.ok(orderResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating payment order: " + e.getMessage());
        }
    }
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> data) {
        String orderId = data.get("razorpay_order_id");
        String paymentId = data.get("razorpay_payment_id");
        String signature = data.get("razorpay_signature");
        boolean isValid = paymentService.verifySignature(orderId, paymentId, signature);
        if (isValid) {
            return ResponseEntity.ok(Map.of("message", "Payment verified successfully!"));
        } else {
            return ResponseEntity.badRequest().body("Payment verification failed! Invalid signature.");
        }
    }
}