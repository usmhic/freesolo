package com.freesolo.api.security;

import com.freesolo.api.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
public class UserPrincipal implements UserDetails {

    private final String id;
    private final String email;
    private final String role;
    private final String status;
    private final String businessId;

    public UserPrincipal(User user) {
        this(user, null);
    }

    public UserPrincipal(User user, String businessId) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.status = user.getStatus();
        this.businessId = businessId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
    }

    @Override
    public String getPassword() { return null; }

    @Override
    public String getUsername() { return email; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return !"suspended".equals(status); }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
