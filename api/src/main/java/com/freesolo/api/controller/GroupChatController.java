package com.freesolo.api.controller;

import com.freesolo.api.dto.chat.GroupMessageResponse;
import com.freesolo.api.dto.chat.PostGroupMessageRequest;
import com.freesolo.api.security.UserPrincipal;
import com.freesolo.api.service.GroupChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/** Group chat for a listing's host and the travelers holding a seat. */
@RestController
@RequestMapping("/api/experiences/{id}/chat")
@RequiredArgsConstructor
public class GroupChatController {

    private final GroupChatService groupChatService;

    /**
     * GET /api/experiences/{id}/chat — latest messages. For polling, pass the
     * newest {@code createdAt} seen as {@code after}; the reply overlaps it by a
     * minute, so dedupe by message id.
     */
    @GetMapping
    public ResponseEntity<List<GroupMessageResponse>> list(
            @PathVariable String id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime after,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(groupChatService.list(principal.getId(), id, after));
    }

    /** POST /api/experiences/{id}/chat */
    @PostMapping
    public ResponseEntity<GroupMessageResponse> post(
            @PathVariable String id,
            @Valid @RequestBody PostGroupMessageRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(201).body(groupChatService.post(principal.getId(), id, req.body()));
    }
}
