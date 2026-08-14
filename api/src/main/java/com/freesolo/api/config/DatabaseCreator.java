package com.freesolo.api.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationEnvironmentPreparedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.ConfigurableEnvironment;

import java.net.URI;
import java.net.URISyntaxException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map;

/**
 * Ensures the target Postgres database exists before Hikari/Flyway try to connect to it.
 * Runs on {@link ApplicationEnvironmentPreparedEvent}, i.e. before any Spring-managed
 * DataSource bean is created, using a plain JDBC connection to the "postgres"
 * maintenance database. Best-effort: any failure (missing privileges, managed hosts
 * without a "postgres" maintenance db, etc.) is logged and swallowed so the normal
 * datasource connection attempt surfaces the real error afterward.
 */
@Slf4j
public class DatabaseCreator implements ApplicationListener<ApplicationEnvironmentPreparedEvent> {

    @Override
    public void onApplicationEvent(ApplicationEnvironmentPreparedEvent event) {
        ConfigurableEnvironment env = event.getEnvironment();
        String url = env.getProperty("spring.datasource.url");
        if (url == null || !url.startsWith("jdbc:postgresql:")) {
            return;
        }

        try {
            createDatabaseIfMissing(url, env.getProperty("spring.datasource.username"),
                    env.getProperty("spring.datasource.password"));
        } catch (Exception e) {
            log.warn("Could not verify/create the target database (will proceed anyway): {}", e.getMessage());
        }
    }

    private void createDatabaseIfMissing(String jdbcUrl, String username, String password) throws SQLException, URISyntaxException {
        URI uri = new URI(jdbcUrl.substring("jdbc:".length()));

        String dbName = uri.getPath().replaceFirst("^/", "");
        if (dbName.isBlank()) {
            return;
        }

        Map<String, String> queryParams = parseQuery(uri.getRawQuery());
        String user = username != null ? username : queryParams.get("user");
        String pass = password != null ? password : queryParams.get("password");

        String adminUrl = "jdbc:postgresql://" + uri.getRawAuthority() + "/postgres"
                + (uri.getRawQuery() != null ? "?" + uri.getRawQuery() : "");

        try (Connection conn = DriverManager.getConnection(adminUrl, user, pass)) {
            try (PreparedStatement ps = conn.prepareStatement("SELECT 1 FROM pg_database WHERE datname = ?")) {
                ps.setString(1, dbName);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        return;
                    }
                }
            }
            log.info("Database '{}' does not exist, creating it", dbName);
            try (Statement st = conn.createStatement()) {
                try {
                    st.executeUpdate("CREATE DATABASE \"" + dbName.replace("\"", "\"\"") + "\"");
                } catch (SQLException e) {
                    if (!"42P04".equals(e.getSQLState())) {
                        throw e;
                    }
                    log.info("Database '{}' was created by another instance", dbName);
                }
            }
        }
    }

    private Map<String, String> parseQuery(String rawQuery) {
        Map<String, String> params = new HashMap<>();
        if (rawQuery == null || rawQuery.isBlank()) {
            return params;
        }
        for (String pair : rawQuery.split("&")) {
            int idx = pair.indexOf('=');
            if (idx > 0) {
                params.put(pair.substring(0, idx), pair.substring(idx + 1));
            }
        }
        return params;
    }
}
