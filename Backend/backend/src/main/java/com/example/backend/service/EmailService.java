package com.example.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}") 
    private String shopEmail;

    public void sendOrderStatusEmail(String toEmail, String customerName, Long orderId, String newStatus) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(shopEmail);
            helper.setTo(toEmail);
            helper.setSubject("Thread vibe - Order #" + orderId + " Update");

            // 1. Determine the message AND dynamic colors for the Status Badge!
            String statusMessage = "";
            String badgeColor = "#2874f0"; // Default Blue text
            String badgeBg = "#e6f0ff";    // Default Light Blue bg

            if (newStatus.equalsIgnoreCase("Shipped")) {
                statusMessage = "Great news! Your custom order has been handed over to our delivery partners and is on its way.";
                badgeColor = "#0284c7"; // Ocean Blue
                badgeBg = "#e0f2fe";
            } else if (newStatus.equalsIgnoreCase("Delivered")) {
                statusMessage = "Your order has been successfully delivered. We hope you absolutely love your custom gear!";
                badgeColor = "#16a34a"; // Green
                badgeBg = "#dcfce7";
            } else if (newStatus.equalsIgnoreCase("Cancelled")) {
                statusMessage = "Your order has been cancelled. If you have any questions or concerns, please reach out to us.";
                badgeColor = "#dc2626"; // Red
                badgeBg = "#fee2e2";
            } else {
                statusMessage = "Your order is currently being processed by our team.";
            }

            // 2. Build the Modern HTML template
            String htmlContent = 
                    // Outer Wrapper (Soft gray background so the white card pops)
                    "<div style='background-color: #f4f7f6; padding: 40px 20px; font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;'>"
                    
                    // Main White Card
                    + "<div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e1e5eb; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>"
                    
                    // Header with Logo
                    + "  <div style='text-align: center; padding: 30px 20px; border-bottom: 1px solid #f0f2f5;'>"
                    + "    <img src='https://i.ibb.co/0jcBkpYX/IMG-20250709-222821-200.webp' alt='Tradevibe Logo' style='max-width: 160px; height: auto; display: block; margin: 0 auto;' />"
                    + "  </div>"
                    
                    // Body Section
                    + "  <div style='padding: 40px 30px; color: #333333; text-align: center;'>"
                    + "    <h2 style='margin-top: 0; font-size: 24px; font-weight: 700; color: #1a1a1a;'>Order Update</h2>"
                    + "    <p style='font-size: 16px; line-height: 1.6; color: #4a5568;'>Hi <strong>" + customerName + "</strong>,</p>"
                    + "    <p style='font-size: 16px; line-height: 1.6; color: #4a5568;'>" + statusMessage + "</p>"
                    
                    // Modern Order Details Box
                    + "    <div style='margin: 35px 0; padding: 25px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;'>"
                    + "      <p style='margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;'>Order Number</p>"
                    + "      <p style='margin: 5px 0 20px 0; font-size: 24px; font-weight: 700; color: #0f172a;'>#" + orderId + "</p>"
                    + "      <p style='margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;'>Current Status</p>"
                    
                    // Dynamic Status Badge
                    + "      <div style='margin-top: 10px;'>"
                    + "        <span style='display: inline-block; padding: 8px 20px; background-color: " + badgeBg + "; color: " + badgeColor + "; font-weight: 700; font-size: 14px; border-radius: 30px; letter-spacing: 0.5px;'>"
                    + "          " + newStatus.toUpperCase()
                    + "        </span>"
                    + "      </div>"
                    + "    </div>"
                    
                    + "    <p style='font-size: 15px; line-height: 1.6; color: #4a5568; margin-top: 30px;'>Need assistance? Our support team is just an email away.</p>"
                    
                    // The Contact Button (Modern Pill Shape)
                    + "    <div style='margin-top: 35px;'>"
                    + "      <a href='mailto:" + shopEmail + "?subject=Support for Order %23" + orderId + "' "
                    + "         style='background-color: #2874f0; color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 30px; font-weight: 600; font-size: 16px; display: inline-block;'>"
                    + "         Contact Support"
                    + "      </a>"
                    + "    </div>"
                    + "  </div>"
                    
                    // Footer
                    + "  <div style='background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;'>"
                    + "    <p style='margin: 0; font-size: 14px; color: #64748b;'>Thank you for choosing <strong>Thread vibe</strong>!</p>"
                    + "    <p style='margin: 10px 0 0 0; font-size: 12px; color: #94a3b8;'>&copy; 2026 Thread vibe. All rights reserved.</p>"
                    + "  </div>"
                    
                    + "</div>"
                    + "</div>";

            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("✅ Modern HTML Email successfully sent to " + toEmail + " for Order #" + orderId);

        } catch (MessagingException e) {
            System.err.println("❌ Failed to send HTML email to " + toEmail + ": " + e.getMessage());
        } catch (Exception e) {
            System.err.println("❌ Unexpected error sending email: " + e.getMessage());
        }
    }
 // ==========================================
    // NEW: ORDER CONFIRMATION EMAIL (Sent right after purchase)
    // ==========================================
    public void sendOrderConfirmationEmail(String toEmail, String customerName, Long orderId, Double totalPrice) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(shopEmail);
            helper.setTo(toEmail);
            helper.setSubject("Tradevibe - Order Confirmation #" + orderId);

            String htmlContent = 
                    "<div style='background-color: #f4f7f6; padding: 40px 20px; font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;'>"
                    + "<div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e1e5eb; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>"
                    
                    // Header with Logo
                    + "  <div style='text-align: center; padding: 30px 20px; border-bottom: 1px solid #f0f2f5;'>"
                    + "    <img src='https://i.ibb.co/0jcBkpYX/IMG-20250709-222821-200.webp' alt='Tradevibe Logo' style='max-width: 160px; height: auto; display: block; margin: 0 auto;' />"
                    + "  </div>"
                    
                    // Body Section
                    + "  <div style='padding: 40px 30px; color: #333333; text-align: center;'>"
                    + "    <h2 style='margin-top: 0; font-size: 24px; font-weight: 700; color: #1a1a1a;'>Thank you for your order!</h2>"
                    + "    <p style='font-size: 16px; line-height: 1.6; color: #4a5568;'>Hi <strong>" + customerName + "</strong>,</p>"
                    + "    <p style='font-size: 16px; line-height: 1.6; color: #4a5568;'>We have successfully received your order and our team is already getting it ready for you.</p>"
                    
                    // Order Details Box (Shows Total Price!)
                    + "    <div style='margin: 35px 0; padding: 25px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; text-align: left;'>"
                    + "      <div style='display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;'>"
                    + "        <span style='font-size: 14px; color: #64748b; font-weight: bold;'>Order Number:</span>"
                    + "        <span style='font-size: 16px; font-weight: 700; color: #0f172a;'>#" + orderId + "</span>"
                    + "      </div>"
                    + "      <div style='display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;'>"
                    + "        <span style='font-size: 14px; color: #64748b; font-weight: bold;'>Status:</span>"
                    + "        <span style='font-size: 14px; font-weight: 700; color: #f59e0b; background-color: #fef3c7; padding: 4px 12px; border-radius: 20px;'>PROCESSING</span>"
                    + "      </div>"
                    + "      <div style='display: flex; justify-content: space-between;'>"
                    + "        <span style='font-size: 16px; color: #0f172a; font-weight: bold;'>Total Amount Paid:</span>"
                    + "        <span style='font-size: 18px; font-weight: 700; color: #16a34a;'>₹" + String.format("%.2f", totalPrice) + "</span>"
                    + "      </div>"
                    + "    </div>"
                    
                    + "    <p style='font-size: 15px; line-height: 1.6; color: #4a5568; margin-top: 30px;'>We will notify you again as soon as your order ships!</p>"
                    + "  </div>"
                    
                    // Footer
                    + "  <div style='background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;'>"
                    + "    <p style='margin: 0; font-size: 14px; color: #64748b;'>Thank you for choosing <strong>Thread vibe</strong>!</p>"
                    + "  </div>"
                    
                    + "</div>"
                    + "</div>";

            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("✅ Order Confirmation Email sent to " + toEmail + " for Order #" + orderId);

        } catch (Exception e) {
            System.err.println("❌ Failed to send Order Confirmation email to " + toEmail + ": " + e.getMessage());
        }
    }
    
    
}