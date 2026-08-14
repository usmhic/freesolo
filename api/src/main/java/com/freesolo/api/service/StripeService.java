package com.freesolo.api.service;

import com.freesolo.api.config.AppProperties;
import com.freesolo.api.entity.Booking;
import com.freesolo.api.entity.User;
import com.freesolo.api.exception.ApiException;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.param.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class StripeService {

    private final AppProperties props;

    @PostConstruct
    void init() {
        Stripe.apiKey = props.getStripe().getSecretKey();
    }

    public static final double PLATFORM_FEE = 0.20;
    public static final double HOST_CREDIT  = 0.10;
    public static final double VENUE_PCT    = 0.70;

    public record Split(double total, double venue, double credit, double platform) {}

    public Split calcSplit(double price, int seats) {
        double total    = price * seats;
        double venue    = round(total * VENUE_PCT);
        double credit   = round(total * HOST_CREDIT);
        double platform = round(total * PLATFORM_FEE);
        return new Split(total, venue, credit, platform);
    }

    private double round(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    public String ensureCustomer(User user) {
        if (user.getStripeCustomerId() != null) return user.getStripeCustomerId();
        try {
            Customer customer = Customer.create(CustomerCreateParams.builder()
                    .setEmail(user.getEmail())
                    .setName(user.getName())
                    .build());
            return customer.getId();
        } catch (StripeException e) {
            throw ApiException.internal("Failed to create Stripe customer: " + e.getMessage());
        }
    }

    public PaymentIntent createPaymentIntent(Booking booking, String customerId, String paymentMethodId) {
        try {
            PaymentIntentCreateParams.Builder builder = PaymentIntentCreateParams.builder()
                    .setAmount((long) (booking.getAmountTotal() * 100))
                    .setCurrency(booking.getCurrency().toLowerCase())
                    .setCustomer(customerId)
                    .putMetadata("bookingId", booking.getId())
                    .putMetadata("experienceId", booking.getExperience().getId())
                    .putMetadata("userId", booking.getUser().getId())
                    .putMetadata("seats", String.valueOf(booking.getSeats()))
                    .setConfirmationMethod(PaymentIntentCreateParams.ConfirmationMethod.MANUAL)
                    .setCaptureMethod(PaymentIntentCreateParams.CaptureMethod.AUTOMATIC);

            if (paymentMethodId != null) {
                builder.setPaymentMethod(paymentMethodId).setConfirm(true);
            }

            return PaymentIntent.create(builder.build());
        } catch (StripeException e) {
            throw ApiException.internal("Failed to create payment intent: " + e.getMessage());
        }
    }

    public SetupIntent createSetupIntent(String customerId) {
        try {
            return SetupIntent.create(SetupIntentCreateParams.builder()
                    .setCustomer(customerId)
                    .addPaymentMethodType("card")
                    .build());
        } catch (StripeException e) {
            throw ApiException.internal("Failed to create setup intent: " + e.getMessage());
        }
    }

    public Account createConnectAccount(String email) {
        try {
            return Account.create(AccountCreateParams.builder()
                    .setType(AccountCreateParams.Type.EXPRESS)
                    .setEmail(email)
                    .setCapabilities(AccountCreateParams.Capabilities.builder()
                            .setTransfers(AccountCreateParams.Capabilities.Transfers.builder()
                                    .setRequested(true).build())
                            .build())
                    .build());
        } catch (StripeException e) {
            throw ApiException.internal("Failed to create Stripe Connect account: " + e.getMessage());
        }
    }

    public Transfer createTransfer(long amountCents, String currency, String destination,
                                   Map<String, String> metadata) {
        try {
            TransferCreateParams.Builder b = TransferCreateParams.builder()
                    .setAmount(amountCents)
                    .setCurrency(currency.toLowerCase())
                    .setDestination(destination);
            metadata.forEach(b::putMetadata);
            return Transfer.create(b.build());
        } catch (StripeException e) {
            throw ApiException.internal("Stripe transfer failed: " + e.getMessage());
        }
    }

    public Event constructWebhookEvent(String payload, String sigHeader) {
        try {
            return com.stripe.net.Webhook.constructEvent(
                    payload, sigHeader, props.getStripe().getWebhookSecret());
        } catch (Exception e) {
            throw ApiException.badRequest("Webhook signature verification failed");
        }
    }
}
