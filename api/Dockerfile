# Build stage
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

COPY pom.xml .
RUN mvn dependency:go-offline -q

COPY src ./src
RUN mvn package -DskipTests -q


# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

LABEL org.opencontainers.image.title="freesolo-api" \
      org.opencontainers.image.source="https://github.com/usmhic/freesolo" \
      org.opencontainers.image.description="FreeSolo Spring Boot API" \
      org.opencontainers.image.authors="usmhic" \
      org.opencontainers.image.licenses="MIT"

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /build/target/*.jar app.jar

RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", \
  "app.jar"]