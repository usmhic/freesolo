package com.freesolo.api.repository;

import com.freesolo.api.entity.OauthAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OauthAccountRepository extends JpaRepository<OauthAccount, String> {
    Optional<OauthAccount> findByProviderIdAndAccountId(String providerId, String accountId);
}
