package com.freesolo.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FreeSoloApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(FreeSoloApiApplication.class, args);
    }
}