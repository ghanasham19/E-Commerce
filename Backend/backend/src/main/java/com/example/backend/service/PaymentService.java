package com.example.backend.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils; // NEW IMPORT
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public String createOrder(double amount) throws Exception {
        System.setProperty("java.net.preferIPv4Stack", "true");
        RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", (int) (amount * 100)); 
        orderRequest.put("currency", "INR"); 
        orderRequest.put("receipt", "txn_" + System.currentTimeMillis()); 

        Order order = razorpay.orders.create(orderRequest);
        return order.toString(); 
    }

    // THE VERIFIER: Checks the cryptographic signature
    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            // Razorpay's library does the complex math using your Secret Key!
            return Utils.verifyPaymentSignature(options, keySecret);
        } catch (Exception e) {
            System.out.println("SIGNATURE VERIFICATION FAILED: " + e.getMessage());
            return false;
        }
    }
}