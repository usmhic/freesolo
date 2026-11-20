package com.freesolo.api.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class LanguagesTest {

    @Test
    void anExplicitLanguageWinsThenTheBrowsersThenEnglish() {
        assertThat(Languages.resolve("ar", "fr-FR,fr;q=0.9")).isEqualTo("ar");
        assertThat(Languages.resolve(null, "de-DE,es-ES;q=0.8,en;q=0.5")).isEqualTo("es");
        assertThat(Languages.resolve("xx", "fr_CA")).isEqualTo("fr");
        assertThat(Languages.resolve(null, "de, nl")).isEqualTo("en");
        assertThat(Languages.resolve(null, null)).isEqualTo("en");
    }
}
