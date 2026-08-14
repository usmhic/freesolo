package com.freesolo.api.service;

import com.freesolo.api.config.AppProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final AppProperties props;

    private static final String BRAND_INK   = "#0A0A0A";
    private static final String BRAND_PAPER = "#F5F0E8";
    private static final String BRAND_SAND  = "#E6DDD0";
    private static final String BRAND_CLAY  = "#B8976A";
    private static final String BRAND_MUTED = "#8A8278";
    private static final String BRAND_WHITE = "#FFFFFF";

    private String wrap(String preheader, String bodyHtml) {
        return wrap(preheader, bodyHtml, null);
    }

    private String wrap(String preheader, String bodyHtml, String unsubscribeUrl) {
        String footer = unsubscribeUrl != null
                ? "<tr><td style=\"padding:16px 28px;border-top:1px solid " + BRAND_SAND + ";font-size:11px;color:" + BRAND_MUTED + ";text-align:center;\">" +
                  "<a href=\"" + unsubscribeUrl + "\" style=\"color:" + BRAND_MUTED + ";text-decoration:underline;\">Unsubscribe from marketing emails</a></td></tr>"
                : "";
        return "<!DOCTYPE html><html><body style=\"margin:0;padding:0;background:" + BRAND_PAPER + ";font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;\">" +
               "<span style=\"display:none;font-size:1px;color:" + BRAND_PAPER + ";\">" + preheader + "</span>" +
               "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:" + BRAND_PAPER + ";padding:32px 16px;\">" +
               "<tr><td align=\"center\"><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:480px;background:" + BRAND_WHITE + ";border-radius:16px;overflow:hidden;border:1px solid " + BRAND_SAND + ";\">" +
               "<tr><td style=\"background:" + BRAND_INK + ";padding:24px 28px;\">" +
               "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\"><tr>" +
               "<td style=\"width:36px;height:36px;background:" + BRAND_PAPER + ";border-radius:12px;text-align:center;vertical-align:middle;font-family:Georgia,serif;font-size:18px;font-weight:700;color:" + BRAND_INK + ";\">F</td>" +
               "<td style=\"padding-left:12px;font-family:Georgia,serif;font-size:22px;color:" + BRAND_PAPER + ";\">Free<span style=\"font-style:italic;color:" + BRAND_CLAY + ";\">Solo</span></td>" +
               "</tr></table></td></tr>" +
               "<tr><td style=\"padding:28px;color:" + BRAND_INK + ";font-size:15px;line-height:1.6;\">" + bodyHtml + "</td></tr>" +
               footer +
               "</table></td></tr></table></body></html>";
    }

    private void send(String to, String subject, String html) {
        try {
            RestClient.create()
                    .post()
                    .uri("https://api.resend.com/emails")
                    .header("Authorization", "Bearer " + props.getResend().getApiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("from", props.getResend().getFrom(), "to", to, "subject", subject, "html", html))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    public void sendOtpCode(String email, String otp) {
        send(email,
             "Your FreeSolo sign-in code: " + otp,
             wrap("Your sign-in code",
                  "<h2 style=\"margin:0 0 12px;font-family:Georgia,serif;\">Your sign-in code</h2>" +
                  "<p style=\"margin:0 0 12px;font-size:32px;letter-spacing:8px;font-weight:700\">" + otp + "</p>" +
                  "<p style=\"margin:0;color:" + BRAND_MUTED + ";font-size:13px\">This code expires in 5 minutes.</p>"));
    }

    public void sendApplicationReceived(String email) {
        send(email,
             "We received your FreeSolo application 🌍",
             wrap("Application received",
                  "<h2 style=\"margin:0 0 12px;font-family:Georgia,serif;\">Application received</h2>" +
                  "<p style=\"margin:0\">We review every story personally. Expect a response within 48 hours.</p>"));
    }

    public void sendApplicationApproved(String email) {
        String appStoreUrl = props.getAppStoreUrl();
        String playStoreUrl = props.getPlayStoreUrl();
        send(email,
             "You're in! Welcome to FreeSolo 🎉",
             wrap("Welcome to FreeSolo",
                  "<h2 style=\"margin:0 0 12px;font-family:Georgia,serif;\">Welcome to FreeSolo</h2>" +
                  "<p style=\"margin:0 0 20px\">Your application was approved. Sign in with this email (one-time code, Google, or Apple).</p>" +
                  "<p style=\"margin:0\"><a href=\"" + appStoreUrl + "\" style=\"display:inline-block;margin-right:12px;padding:10px 20px;border-radius:8px;background:" + BRAND_INK + ";color:" + BRAND_PAPER + ";text-decoration:none\">App Store</a>" +
                  "<a href=\"" + playStoreUrl + "\" style=\"display:inline-block;padding:10px 20px;border-radius:8px;background:" + BRAND_INK + ";color:" + BRAND_PAPER + ";text-decoration:none\">Google Play</a></p>"));
    }

    public void sendBookingConfirmed(String email, String title, String date) {
        send(email,
             "Your seat is confirmed — " + title,
             wrap("Your seat is confirmed",
                  "<h2 style=\"margin:0 0 12px;font-family:Georgia,serif;\">You're in! 🎉</h2>" +
                  "<p style=\"margin:0\"><strong>" + title + "</strong> on " + date + ". See you there.</p>"));
    }

    public void sendBookingPending(String email, String title, int needed) {
        send(email,
             "Seat reserved — waiting for " + needed + " more traveler" + (needed != 1 ? "s" : ""),
             wrap("Seat reserved",
                  "<h2 style=\"margin:0 0 12px;font-family:Georgia,serif;\">Seat reserved</h2>" +
                  "<p style=\"margin:0\">Your seat for <strong>" + title + "</strong> is held. We need " + needed +
                  " more traveler" + (needed != 1 ? "s" : "") + " to confirm.</p>"));
    }

    public void sendMarketingCampaign(String email, String subject, String body, String unsubscribeUrl) {
        send(email, subject, wrap(subject, body, unsubscribeUrl));
    }
}
