package com.freesolo.api;

import com.freesolo.api.config.DatabaseCreator;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FreeSoloApiApplication {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(FreeSoloApiApplication.class);
        app.addListeners(new DatabaseCreator());
        app.run(args);
    }
}
